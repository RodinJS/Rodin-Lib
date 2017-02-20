import {EventEmitter} from '../eventEmitter';
import {messenger} from '../messenger';
import {Set} from '../set';
import {ErrorProtectedMethodCall, ErrorBadValueParameter} from '../error';
import * as utils from '../utils';
import * as CONSTANTS from '../constants';
import {RodinEvent} from '../rodinEvent';

function enforce() {
}

let activeScene = null;
let doRender = true;
let renderRequested = false;

const preRenderFunctions = new Set();
const postRenderFunctions = new Set();

const instances = new Set();

/**
 *
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
    }

    /**
     * Check if your instance is scene
     * @returns {boolean} always true
     */
    get isScene() {
        return true;
    }

    /**
     * Add object to scene.
     * Call with multiple arguments of Sculpt objects
     */
    add() {
        for(let i = 0; i < arguments.length; i++) {
            if(!arguments[i].isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
            }

            this.children.push(arguments[i]);
            this._scene.add(arguments[i]._threeObject);
        }
    }

    /**
     * Remove object from scene
     * Call with multiple arguments of Sculpt objects
     */
    remove() {
        for(let i = 0; i < arguments.length; i++) {
            if(!arguments[i].isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
            }

            this.children.splice(this.children.indexOf(arguments[i]), 1);
            this._scene.remove(arguments[i]._threeObject);
        }
    }

    /**
     * Reset effect size.
     * Reset camera aspect.
     * Update camera projection matrix
     * Reset renderer pixel ratio
     */
    onResize() {
        Scene.effect.setSize(window.innerWidth, window.innerHeight);
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        Scene.renderer.setPixelRatio(window.devicePixelRatio >= 2 ? 2 : window.devicePixelRatio);
    }

    /**
     * Adds a function to a set that will be called every time before rendering this scene
     * @param callback {Function}
     */
    preRender(callback) {
        this._preRenderFunctions.push(callback);
    }

    /**
     * Adds a function to a set that will be called every time after rendering this scene
     * @param callback {Function}
     */
    postRender(callback) {
        this._postRenderFunctions.push(callback);
    }

    static renderer = new THREE.WebGLRenderer({
        antialias: window.devicePixelRatio < 2
    });

    static effect = new THREE.VREffect(Scene.renderer);

    static webVRmanager = null;

    /**
     * Starts render active scene.
     */
    static start() {
        doRender = true;
        if (!renderRequested) {
            Scene.requestFrame(enforce);
        }
    }

    /**
     * Stops render active scene.
     */
    static stop() {
        doRender = false;
    }

    /**
     * Change Scene and go to other scene.
     * If parameter is instance of Scene, go to this scene.
     * If parameter is number, go to scene that created with this number
     * If parameter is strig, got to scene with this name
     * @param scene {Scene, number, string}
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
     * Add object to active scene.
     * Call with multiple arguments of Sculpt objects
     */
    static add() {
        Scene.active.add(...arguments);
    }

    /**
     * Remove object from active scene.
     * Call with multiple arguments of Sculpt objects
     */
    static remove() {
        Scene.active.remove(...arguments);
    }

    /**
     * Call active scene onResize method
     */
    static onResize() {
        Scene.active.onResize();
    }

    /**
     * Adds function that will called each time before renderer will render any scene
     * @param callback {Function}
     */
    static preRender(callback) {
        preRenderFunctions.push(callback);
    }

    /**
     * Adds function that will called each time after renderer will render any scene
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

        Scene.webVRmanager.render(Scene.active._scene, Scene.active._camera, timestamp);
        Scene.active._postRenderFunctions.map(fn => fn());
        messenger.post(CONSTANTS.RENDER, {realTimestamp: timestamp});
        postRenderFunctions.map(fn => fn());

        Scene.requestFrame(enforce);

        messenger.post(CONSTANTS.RENDER_END, {});
    }

    /**
     * Request render function
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

Scene.renderer.setPixelRatio(window.devicePixelRatio);
Scene.effect.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', Scene.onResize, false);
window.addEventListener('vrdisplaypresentchange', Scene.onResize, false);


// TODO: fix this when webkit fixes growing canvas
if (window.parent !== window && navigator.userAgent.match(/(iPod|iPhone|iPad)/) && navigator.userAgent.match(/AppleWebKit/)) {
    this.renderer.domElement.style.position = 'fixed';
    this.onResize();
}


// TODO: fix this after fixing webVRManager
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    Scene.webVRmanager.vrCallback = () => {
        Scene.webVRmanager.enterVRMode_();
        Scene.webVRmanager.hmd.resetPose();
    };
}

messenger.once(CONSTANTS.RODIN_STARTED, (params) => {
    Scene.webVRmanager = new WebVRManager(Scene.renderer, Scene.effect, {hideButton: false, isUndistorted: false});
    document.body.appendChild(Scene.renderer.domElement);
    const mainScene = new Scene('Main');
    Scene.go(mainScene);
    Scene.start();
});