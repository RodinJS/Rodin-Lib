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

/**
 * Scene class
 * A scene is an object which can contain many 3d objects, virtual cameras, lights...
 * Anything that can be rendered or viewed must be in a scene
 * You can have multiple scenes in a single experience, for example to represent
 * different levels of a game.
 */
export class Scene extends EventEmitter {
    constructor(name = utils.string.UID()) {
        super();

        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 0.01, 100);
        this._scene.add(this._camera);
        this._controls = new THREE.VRControls(this._camera);
        this._controls.standing = true;

        this.name = name;

        this._preRenderFunctions = new Set();
        this._postRenderFunctions = new Set();

        instances.push(this);

        this.children = new Set();

        this._sculpt = new Sculpt();
        this._sculpt.on(CONSTANTS.READY, () => {
            this._scene.add(this._sculpt._threeObject);
        });

        this._scene.add(new THREE.AmbientLight());

        //TODO: get rid of this sh*t. this is to cover the bug with crash on vr exit on mobiles

        let x = new THREE.Mesh(new THREE.BoxGeometry(0.0002, 0.0002, 0.0002), new THREE.MeshNormalMaterial());
        this._camera.add(x);
        x.position.set(0, 0, -99);

    }

    /**
     * Checks if your instance is a scene
     * @returns {boolean} always true
     */
    get isScene() {
        return true;
    }

    /**
     * Adds object(s) to scene.
     * Call with a single or multiple arguments of Sculpt objects
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
     * Removes object(s) from scene
     * Call with a single or multiple arguments of Sculpt objects
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
     * Updates camera projection matrix
     * Resets renderer pixel ratio
     */
    onResize() {
        Scene.effect.setSize(window.innerWidth, window.innerHeight);
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        Scene.renderer.setPixelRatio(window.devicePixelRatio >= 2 ? 2 : window.devicePixelRatio);
    }

    /**
     * Adds a function to an array of functions
     * which will be called every time right
     * before rendering this scene
     * @param callback {Function}
     */
    preRender(callback) {
        this._preRenderFunctions.push(callback);
    }

    /**
     * Adds a function to an array of functions
     * which will be called every time after rendering this scene
     * @param callback {Function}
     */
    postRender(callback) {
        this._postRenderFunctions.push(callback);
    }


    /**
     * Starts rendering the current active scene.
     */
    static start() {
        doRender = true;
        if (!renderRequested) {
            Scene.requestFrame(enforce);
        }
    }

    /**
     * Stops rendering the current active scene.
     */
    static stop() {
        doRender = false;
    }

	/**
     * Gets the main camera that currently renders
	 */
	static get activeCamera() {
        return activeScene._camera;
    }

    /**
     * Change Scene and go to other scene.
     * If parameter is instance of Scene, go to this scene.
     * If parameter is number, go to scene that created with this number
     * If parameter is strig, got to scene with this name
     * @param scene {(Object|number|string)}
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
     * Adds object(s) to the active scene.
     * Call with a signle or multiple arguments of Sculpt objects
     */
    static add() {
        Scene.active.add(...arguments);
    }

    /**
     * Removes object(s) from active scene.
     * Call with a single or multiple arguments of Sculpt objects
     */
    static remove() {
        Scene.active.remove(...arguments);
    }

    /**
     * Calls active scene onResize method
     */
    static onResize() {
        Scene.active.onResize();
    }

    /**
     * Adds a function to an array of functions
     * which will be called every time right
     * before rendering <b>the active</b> scene
     * @param callback {Function}
     */
    static preRender(callback) {
        preRenderFunctions.push(callback);
    }

    /**
     * Adds a function to an array of functions
     * which will be called every time right
     * after rendering <b>the active</b> scene
     * @param callback {Function}
     */
    static postRender(callback) {
        postRenderFunctions.push(callback);
    }

    /**
     * Render function
     * Not available for user
     * @param timestamp {number}
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
     * Not available for user
     * @param e {Function} Enforce function
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
     * Active scene
     */
    static get active() {
        return activeScene;
    }
}
/**
 * renderer object
 * @type {Object}
 * @static
 */
Scene.renderer = new THREE.WebGLRenderer({
    antialias: window.devicePixelRatio < 2
});
/**
 * VREffect plugin from three.js
 * @type {Object}
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