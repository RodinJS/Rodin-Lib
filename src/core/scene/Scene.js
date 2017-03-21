import {EventEmitter} from '../eventEmitter';
import {messenger} from '../messenger';
import {Set} from '../set';
import {ErrorProtectedMethodCall, ErrorBadValueParameter} from '../error';
import * as utils from '../utils';
import * as CONSTANTS from '../constants';
import {RodinEvent} from '../rodinEvent';
import {Sculpt} from '../sculpt';

function enforce() {
}

let activeScene = null;
let doRender = true;
let renderRequested = false;

const preRenderFunctions = new Set();
const postRenderFunctions = new Set();

const instances = new Set();

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
        this._camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
        this._scene.add(this._camera);
        this._controls = new THREE.VRControls(this._camera);
        this._controls.standing = true;
        /**
         * Scene name.
         * @type {string}
         */
        this.name = name;

        this._preRenderFunctions = new Set();
        this._postRenderFunctions = new Set();

        instances.push(this);
        /**
         * Child sculpt objects of the scene
         * @type {Set.<Sculpt>}
         */
        this.children = new Set();

        this._sculpt = new Sculpt();
        this._sculpt.on(CONSTANTS.READY, () => {
            this._scene.add(this._sculpt._threeObject);
        });

        this._scene.add(new THREE.AmbientLight());

        //TODO: get rid of this sh*t. this is to cover the bug with crash on vr exit on mobiles

        let x = new THREE.Mesh(new THREE.BoxGeometry(0.0002, 0.0002, 0.0002), new THREE.MeshNormalMaterial());
        this._camera.add(x);
        x.position.set(0, 1, -99);

    }

    /**
     * Gets the names of current scenes in the creation order.
     * @returns {Array.<string>}
     */
    static get sceneNames() {
        let names = [];
        for(let si = 0; si < instances.length; si++){
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

    /**
     * Checks if your instance is scene.
     * @returns {boolean} always true
     */
    get isScene() {
        return true;
    }

    /**
     * Adds object to scene.
     * Call with one or more arguments of Sculpt objects.
     */
    add() {
        for(let i = 0; i < arguments.length; i++) {
            if(!arguments[i].isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
            }

            this.children.push(arguments[i]);
            // this._sculpt.add(arguments[i]._threeObject);
            //todo: figure out what sculpt.parent should actually return to avoid bugs
            arguments[i].parent = this._sculpt;
        }
    }

    /**
     * Removes objects from scene.
     * Call with one or more arguments of Sculpt objects.
     */
    remove() {
        for(let i = 0; i < arguments.length; i++) {
            if(!arguments[i].isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
            }

            this.children.splice(this.children.indexOf(arguments[i]), 1);
            // this._sculpt.remove(arguments[i]._threeObject);
            arguments[i].parent = null;
        }
    }

    /**
     * Resets effect size.
     * Resets camera aspect.
     * Updates camera projection matrix.
     * Resets renderer pixel ratio.
     */
    onResize() {
        Scene.effect.setSize(window.innerWidth, window.innerHeight);
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
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
     * Gets the rendering camera of the active scene.
     * @returns {THREE.PerspectiveCamera}
     */
	static get activeCamera() {
        return activeScene._camera;
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
                    activeScene = filteredScene;
                    break;
                }
            default:
                throw new ErrorBadValueParameter();
        }

        messenger.post(CONSTANTS.ACTIVE_SCENE, activeScene);

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
     * @param timestamp {number}
     * @private
     */
    //todo: maybe add an enforce argument? @Gor
    static render(timestamp) {

        messenger.post(CONSTANTS.RENDER_START, {});

        // Update VR headset position and apply to camera.
        Scene.active._controls.update();

        preRenderFunctions.map(fn => fn());
        Scene.active._preRenderFunctions.map(fn => fn());

        Scene.active.children.map(child => {
            if(child.isReady) {
                child.emit(CONSTANTS.UPDATE, new RodinEvent(child, {}));
            }
        });
        //TODO: camera needs to be a sculpt object, to avoid sh*t like this
        Scene.active._camera.children.map(child => {
            if(child.Sculpt && child.Sculpt.isReady) {
                child.Sculpt.emit(CONSTANTS.UPDATE, new RodinEvent(child, {}));
            }
        });

        Scene.webVRmanager.render(Scene.active._scene, Scene.active._camera, timestamp);
        Scene.active._postRenderFunctions.map(fn => fn());
        messenger.post(CONSTANTS.RENDER, {realTimestamp: timestamp});
        postRenderFunctions.map(fn => fn());

        Scene.requestFrame(enforce);

        messenger.post(CONSTANTS.RENDER_END, {});
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
            Scene.webVRmanager.hmd.requestAnimationFrame(Scene.render);
        } else {
            requestAnimationFrame(Scene.render);
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

window.addEventListener('resize', Scene.onResize, false);
window.addEventListener('vrdisplaypresentchange', Scene.onResize, false);


// TODO: fix this when webkit fixes growing canvas bug
if (window.parent !== window && navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)) {
    this.renderer.domElement.style.position = 'fixed';
    this.onResize();
}

messenger.on(CONSTANTS.REQUEST_ACTIVE_SCENE, () => {
    messenger.postAsync(CONSTANTS.ACTIVE_SCENE, activeScene);
});

messenger.post(CONSTANTS.REQUEST_RODIN_STARTED);

messenger.once(CONSTANTS.RODIN_STARTED, (params) => {
    Scene.webVRmanager = new WebVRManager(Scene.renderer, Scene.effect, {hideButton: false, isUndistorted: false});
    document.body.appendChild(Scene.renderer.domElement);
    const mainScene = new Scene('Main');
    Scene.go(mainScene);
    Scene.start();

    // TODO: fix this after fixing webVRManager
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        Scene.webVRmanager.vrCallback = () => {
            Scene.webVRmanager.enterVRMode_();
            Scene.webVRmanager.hmd.resetPose();
        };
    }
});