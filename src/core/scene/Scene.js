import {EventEmitter} from '../eventEmitter';
import {messenger} from '../messenger';
import {Set} from '../set';
import {ErrorProtectedMethodCall, ErrorBadValueParameter} from '../error';
import * as utils from '../utils';

function enforce() {
}

let activeScene = null;
let shouldRender = true;
let renderRequested = false;

const preRenderFunctions = new Set();
const postRenderFunctions = new Set();

const instances = new Set();

export class Scene extends EventEmitter {
    constructor(name = utils.string.UID()) {
        super();

        this._scene = new THREE.Scene();
        this._camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 0.01, 100);
        this._scene.add(this._camera);
        this._controls = new THREE.VRControls(this._camera);
        this._controls.standing = true;
        this.name = name;
        instances.push(this);
    }

    get isScene() {
        return true;
    }

    onResize() {
        Scene.effect.setSize(window.innerWidth, window.innerHeight);
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        Scene.renderer.setPixelRatio(window.devicePixelRatio >= 2 ? 2 : window.devicePixelRatio);
    }

    static renderer = new THREE.WebGLRenderer({
        antialias: window.devicePixelRatio < 2
    });

    static effect = new THREE.VREffect(Scene.renderer);

    static webVRmanager = new WebVRManager(Scene.renderer, Scene.effect, {hideButton: false, isUndistorted: false});

    static start() {
        shouldRender = true;
        if(!renderRequested) {
            Scene.requestFrame(enforce);
        }
    }

    static stop() {
        shouldRender = false;
    }

    static go(scene) {
        switch (true)
        {
            case scene.isScene:
                activeScene = scene;
                break;
            case !!instances[scene]:
                activeScene = instances[scene];
                break;
            case true:
                const filteredScene = instances.filter(scene => scene.name === scene);
                if(filteredScene && filteredScene[0]) {
                    activeScene = filteredScene;
                    break;
                }
            default:
                throw new ErrorBadValueParameter();
        }

        messenger.post('activescene', activeScene);
        Scene.onResize();
    }

    static onResize() {
        Scene.active.onResize();
    }

    static preRender(callback) {
        preRenderFunctions.push(callback);
    }

    static postRender(callback) {
        postRenderFunctions.push(callback);
    }

    static render(timestamp) {
        // todo: add constants
        messenger.post('renderstart', {});

        // Update VR headset position and apply to camera.
        Scene.active._controls.update();

        preRenderFunctions.map(fn => fn());
        Scene.webVRmanager.render(Scene.active._scene, Scene.active._camera, timestamp);
        messenger.post('render', {realTimestamp: timestamp});
        postRenderFunctions.map(fn => fn());

        Scene.requestFrame(enforce);

        messenger.post('renerend', {});
    }

    static requestFrame(e) {
        // renderRequested becomes false every time
        // render() calls requestFrame(), event if
        // shouldRender is false
        renderRequested = false;

        if(!shouldRender) {
            return;
        }

        if(e !== enforce) {
            throw new ErrorProtectedMethodCall('requestFrame');
        }

        if (Scene.webVRmanager.hmd && Scene.webVRmanager.hmd.isPresenting) {
            Scene.webVRmanager.hmd.requestAnimationFrame(Scene.render);
        } else {
            requestAnimationFrame(Scene.render);
        }

        renderRequested = true;
    }

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

const mainScene = new Scene('Main');
Scene.go(mainScene);
Scene.start();
