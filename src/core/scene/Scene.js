import {EventEmitter} from '../eventEmitter';
import {messenger} from '../messenger';
import {ErrorProtectedMethodCall, ErrorBadValueParameter} from '../error';
import * as utils from '../utils';
import * as CONST from '../constants';
import {RodinEvent} from '../rodinEvent';
import {Sculpt} from '../sculpt';
import {Avatar} from '../avatar';
import {device} from '../device';


function enforce() {
}

let activeScene = null;
let doRender = true;
let renderRequested = false;

const preRenderFunctions = [];
const postRenderFunctions = [];

const instances = [];

export class Scene extends EventEmitter {
    /**
     * <p>Scene class.</p>
     * <p>A scene is an object which can contain multiple 3D objects, Cameras, Lights...</p>
     * <p>Anything that can be rendered or viewed must be in a scene.</p>
     * <p>You can have multiple scenes in a single experience, for example to represent
     * different levels of a game, or different isolated environments.</p>
     * Constructor receives a name string as an argument.
     * @param [name] {string}
     */
    constructor(name = utils.string.UID()) {
        super();

        this._scene = new THREE.Scene();


        /**
         * Scene name.
         * @type {string}
         */
        this.name = name;

        this._preRenderFunctions = [];
        this._postRenderFunctions = [];

        instances.push(this);
        /**
         * Child sculpt objects of the scene
         * @type {Set.<Sculpt>}
         */
        this.children = [];

        this._sculpt = new Sculpt();
        this._sculpt.on(CONST.READY, () => {
            this._scene.add(this._sculpt._threeObject);
        });

        this._scene.add(new THREE.AmbientLight());


        /**
         * Array of cameras of the scene
         * @type {Array}
         */
        this.cameras = [];
        this.avatar = new Avatar();
        this.add(this.avatar);
        Avatar.standing = true;
        //this.addCamera(this.avatar.HMDCamera);
        //this._controls = new THREE.VRControls(this.HMDCamera._threeCamera);
        //this._controls.standing = true;


        //TODO: get rid of this sh*t. this is to cover the bug with crash on vr exit on mobiles

        let x = new Sculpt(new THREE.Mesh(new THREE.BoxGeometry(0.0002, 0.0002, 0.0002), new THREE.MeshNormalMaterial()));
        this.avatar.HMDCamera.add(x);

        x.position.set(0, 1, -99);

    }

    /**
     * Gets the names of current scenes in the creation order.
     * @returns {Array.<string>}
     */
    static get sceneNames() {
        let names = [];
        for (let si = 0; si < instances.length; si++) {
            names.push(instances[si].name);
        }
        return names;
    }

    /**
     * Gets current scene instances in the creation order.
     * NOTE!!! avoid making changes in scenes using this getter,
     * instead, switch to the needed scene and perform the modifications there.
     * @returns {Set.<Scene>}
     */
    static get scenes() {
        return instances;
    }

    static getByName(name) {
        const filteredScene = instances.filter(_scene => _scene.name === name);
        if (filteredScene && filteredScene[0])
            return filteredScene[0];

        return null;
    }

    /**
     * Checks if your instance is scene.
     * @returns {boolean} always true
     */
    get isScene() {
        return true;
    }

    /**
     * Gets the main camera that renders to the hmd, or the screen
     * @returns {HMDCamera}
     */
    get HMDCamera() {
        return this.avatar.HMDCamera;
    }

    /**
     * Adds sculpts to the scene.
     * If a sculpt is a camera, addCamera is called
     * Call with one or more arguments of Sculpt objects.
     */
    add() {
        for (let i = 0; i < arguments.length; i++) {
            if (!arguments[i].isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
            }
            if (arguments[i].isCamera) {
                this.addCamera(arguments[i]);
            }

            this.children.push(arguments[i]);
            // this._sculpt.add(arguments[i]._threeObject);
            //todo: figure out what sculpt.parent should actually return to avoid bugs
            arguments[i].parent = this._sculpt;
        }
    }

    /**
     * Adds a camera to the scene
     * @param {R.Camera | R.PerspectiveCamera | HMDCamera} camera
     */
    addCamera(camera) {
        if (!camera.isCamera) {
            throw new ErrorBadValueParameter('Camera');
        }

        this.cameras.push(camera);
    }

    /**
     * Removes sculpts from scene.
     * Call with one or more arguments of Sculpt objects.
     */
    remove() {
        for (let i = 0; i < arguments.length; i++) {
            if (!arguments[i].isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
            }
            if (arguments[i].isCamera) {
                this.removeCamera(arguments[i]);
            }

            this.children.splice(this.children.indexOf(arguments[i]), 1);
            // this._sculpt.remove(arguments[i]._threeObject);
            arguments[i].parent = null;
        }
    }

    /**
     * Removes a camera to the scene
     * @param {R.Camera | R.PerspectiveCamera | HMDCamera} camera
     */
    removeCamera(camera) {
        if (!camera.isCamera) {
            throw new ErrorBadValueParameter('Camera');
        }

        this.cameras.splice(this.cameras.indexOf(camera), 1);
    }

    /**
     * Resets effect size.
     * Resets camera aspect.
     * Updates camera projection matrix.
     * Resets renderer pixel ratio.
     */
    onResize() {
        Scene.effect.setSize(window.innerWidth, window.innerHeight);
        this.HMDCamera.aspect = window.innerWidth / window.innerHeight;
        this.HMDCamera.updateProjectionMatrix();
        Scene.renderer.setPixelRatio(window.devicePixelRatio >= 2 ? 2 : window.devicePixelRatio);
    }

    /**
     * Sets the current camera property
     * @param {string} property
     * @param {*} value
     */
    setCameraProperty(property, value) {
        Object.setProperty(this._camera, property, value);
        this._camera.projectionMatrixNeedsUpdate = true;
    }

    /**
     * Adds the provided method to a list of methods that are being called before each render call of this scene
     * @param callback {Function}
     */
    preRender(callback) {
        this._preRenderFunctions.push(callback);
    }

    /**
     * Adds the provided method to a list of methods that are being called after each render call of this scene
     * @param callback {Function}
     */
    postRender(callback) {
        this._postRenderFunctions.push(callback);
    }


    /**
     * Starts rendering the active scene.
     */
    static start() {
        doRender = true;
        if (!renderRequested) {
            Scene.requestFrame(enforce);
        }
    }

    /**
     * Stops rendering the active scene.
     */
    static stop() {
        doRender = false;
    }

    /**
     * Gets the hmd camera of the active scene
     * @returns {HMDCamera}
     * @constructor
     */
    static get HMDCamera() {
        return activeScene.HMDCamera;
    }

    /**
     * Switches to another Scene instance.
     * If the parameter is an instance of Scene, go to this scene.
     * If the parameter is a number, go to the scene with that index (creation order)
     * If the parameter is a string, got to the scene with this name
     * @param scene {(Scene|number|string)}
     */
    static go(scene) {
        switch (true) {
            case scene.isScene:
                activeScene = scene;
                break;
            case !!instances[scene]:
                activeScene = instances[scene];
                break;
            case true:
                const filteredScene = instances.filter(_scene => _scene.name === scene);
                if (filteredScene && filteredScene[0]) {
                    activeScene = filteredScene[0];
                    break;
                }
            default:
                throw new ErrorBadValueParameter();
        }

        messenger.post(CONST.ACTIVE_SCENE, activeScene);

        Scene.onResize();
    }

    /**
     * Adds the object(s) to the active scene.
     * Call with one or more arguments of Sculpt type.
     * @param arguments {...Sculpt}
     */
    static add() {
        Scene.active.add(...arguments);
    }

    /**
     * Removes the object(s) from the active scene.
     * Call with one or more arguments of Sculpt type.
     * @param arguments {...Sculpt}
     */
    static remove() {
        Scene.active.remove(...arguments);
    }

    /**
     * Calls the active scene onResize method
     */
    static onResize() {
        Scene.active.onResize();
    }

    /**
     * Adds the provided method to a list of methods that are being called before each render call of every scene
     * @param callback {Function}
     */
    static preRender(callback) {
        preRenderFunctions.push(callback);
    }

    /**
     * Adds the provided method to a list of methods that are being called after each render call of every scene
     * @param callback {Function}
     */
    static postRender(callback) {
        postRenderFunctions.push(callback);
    }

    /**
     * Render function.
     * @param e Enforce function
     * @param timestamp {number}
     * @private
     */
    static render(e, timestamp) {
        if (e !== enforce) {
            throw new ErrorProtectedMethodCall('render');
        }

        messenger.post(CONST.RENDER_START, {});

        // call all prerender functions
        for (let i = 0; i < preRenderFunctions.length; i++) {
            preRenderFunctions[i]();
        }

        // call all scene specific prerender functions
        for (let i = 0; i < Scene.active._preRenderFunctions.length; i++) {
            Scene.active._preRenderFunctions[i]();
        }

        // emit update for all childs
        for (let i = 0; i < Scene.active.children.length; i++) {
            const child = Scene.active.children[i];

            if (child.isReady) {
                child.emit(CONST.UPDATE, new RodinEvent(child, {}));
            }
        }

        Scene.webVRmanager.render(Scene.active._scene, Scene.HMDCamera._threeCamera, timestamp);
        messenger.post(CONST.RENDER, {realTimestamp: timestamp});

        // call all scene specific postrender functions
        for (let i = 0; i < Scene.active._postRenderFunctions.length; i++) {
            Scene.active._postRenderFunctions[i]();
        }

        // call all postrender functions
        for (let i = 0; i < postRenderFunctions.length; i++) {
            postRenderFunctions[i]();
        }

        Scene.requestFrame(enforce);

        messenger.post(CONST.RENDER_END, {});
    }

    /**
     * Requests render function
     * @param e {Function} Enforce function
     * @private
     */
    static requestFrame(e) {
        // renderRequested becomes false every time
        // render() calls requestFrame(), event if
        // doRender is false

        if (e !== enforce) {
            throw new ErrorProtectedMethodCall('requestFrame');
        }

        renderRequested = false;

        if (!doRender) {
            return;
        }

        if (Scene.webVRmanager.hmd && Scene.webVRmanager.hmd.isPresenting) {
            Scene.webVRmanager.hmd.requestAnimationFrame((timestamp) => {
                Scene.render(enforce, timestamp);
            });
        } else {
            requestAnimationFrame((timestamp) => {
                Scene.render(enforce, timestamp);
            });
        }

        renderRequested = true;
    }

    /**
     * Active scene.
     * @returns scene {Scene}
     */
    static get active() {
        return activeScene;
    }
}

/**
 * renderer object
 * @type {THREE.WebGLRenderer}
 * @static
 */
Scene.renderer = new THREE.WebGLRenderer({
    antialias: window.devicePixelRatio < 2
});

/**
 * VREffect plugin from three.js
 * @type {THREE.VREffect}
 * @static
 */
Scene.effect = new THREE.VREffect(Scene.renderer);

/**
 * web VR Manager plugin
 * @type {Object}
 * @static
 */
Scene.webVRmanager = null;

Scene.renderer.setPixelRatio(window.devicePixelRatio);
Scene.effect.setSize(window.innerWidth, window.innerHeight);

window.addEventListener(CONST.RESIZE, Scene.onResize, false);
window.addEventListener(CONST.VR_DISPLAY_PRESENT_CHANGE, () => {
    Scene.onResize();
    messenger.post(CONST.VR_DISPLAY_PRESENT_CHANGE, Scene.webVRmanager.hmd.isPresenting);
}, false);


// TODO: fix this when webkit fixes growing canvas bug
if (device.isIframe && device.isIOS) {
    Scene.renderer.domElement.style.position = 'fixed';
    if(Scene.active)
        Scene.onResize();
}

messenger.on(CONST.REQUEST_ACTIVE_SCENE, () => {
    messenger.postAsync(CONST.ACTIVE_SCENE, activeScene);
});

messenger.post(CONST.REQUEST_RODIN_STARTED);

messenger.once(CONST.RODIN_STARTED, () => {
    Scene.webVRmanager = new WebVRManager(Scene.renderer, Scene.effect, {hideButton: false, isUndistorted: false});
    document.body.appendChild(Scene.renderer.domElement);
    const mainScene = new Scene('Main');
    Scene.go(mainScene);
    Scene.start();

    // TODO: fix this after fixing webVRManager
    if (device.isIOS) {
        Scene.webVRmanager.vrCallback = () => {
            Scene.webVRmanager.enterVRMode_();
            Scene.webVRmanager.hmd.resetPose();
        };
    }
});
