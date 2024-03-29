import {Sculpt} from '../sculpt/index.js';
import {HMDCamera} from '../camera/index.js'
import {messenger} from '../messenger/index.js';
import {AScheme} from '../utils/AScheme.js'
import * as utils from '../utils/index.js';
import * as CONST from "../constants/index.js";
import {device} from '../device/index.js';
import {postMessageTransport} from '../transport/index.js';
import {Vector3} from "../math/Vector3.js";

const constructorScheme = {
    trackPosition: AScheme.bool().default(true),
    trackRotation: AScheme.bool().default('$trackPosition'),
    HMDCamera: AScheme.any().hasProperty('isHMDCamera').default(() => new HMDCamera())
};

let useWebVRPose = true;
let pose = null;
let poseRequesters = [];
let activeAvatar =  null;
let instances = {};

/**
 * Avatar class represents the user in 3D experience. This helps to refer to the camera as an object in space.
 * @param trackRotation {boolean} whether or not this avatar should track users rotation.
 * @param trackPosition {boolean} whether or not this avatar should track users position.
 * @param HMDCamera {HMDCamera} the camera that renders user perspective.
 */

export class Avatar extends Sculpt {
    constructor(...args) {
        args = AScheme.validate(args, constructorScheme);
        super();

        this._hmdCamera = args.HMDCamera;
        this.add(this._hmdCamera);

        this.trackPosition = args.trackPosition;
        this.trackRotation = args.trackRotation;
        this._shiftPos = new Vector3();
        this.offset = new Vector3();
    }

    static get active() {
        return activeAvatar;
    }

    static get HMDCamera() {
        return activeAvatar.HMDCamera;
    }

    static get position() {
        return activeAvatar.position;
    }

    static add (...args){
        activeAvatar.add(...args);
    }

    static init() {
        if ('VRFrameData' in window) {
            Avatar._frameData = new VRFrameData();
        }
    }

    /**
     * Pauses the tracking of all Avatar instances.
     */
    static pause() {
        Avatar.isRunning = false;
    }

    /**
     * Resumes the tracking of all Avatar instances.
     */
    static resume() {
        Avatar.isRunning = true;
    }

    static update() {
        if (!Avatar.isRunning)
            return;

        if (!Avatar._vrDisplay) {
            Avatar.pause();

            if (navigator.getVRDisplays) {
                navigator.getVRDisplays().then((displays) => {
                    if (displays.length > 0) {
                        Avatar._vrDisplay = displays[0];
                        Avatar.resume();
                    }
                    else {
                        // no displays, not sure what to do
                    }
                }).catch(function () {
                    // we stay paused if no vr displays
                });
            }
            return;
        }

        if (useWebVRPose) {
            pose = null;

            // to support different versions of webvr api
            if (Avatar._vrDisplay.getFrameData) {
                Avatar._vrDisplay.getFrameData(Avatar._frameData);
                pose = Avatar._frameData.pose;
            } else if (Avatar._vrDisplay.getPose) {
                pose = Avatar._vrDisplay.getPose();
            }
        }

        if (!pose)
            return;

        if (pose.orientation !== null) {
            Avatar.trackingSculpt.quaternion.fromArray(pose.orientation);
        }

        if (pose.position !== null) {
            Avatar.trackingSculpt.position.fromArray(pose.position);
        } else {
            Avatar.trackingSculpt.position.set(0, 0, 0);
        }

        if (Avatar.standing) {
            if (Avatar._vrDisplay.stageParameters) {
                Avatar.standingMatrix = new THREE.Matrix4().fromArray(Avatar._vrDisplay.stageParameters.sittingToStandingTransform);

                Avatar.trackingSculpt.matrix.compose(Avatar.trackingSculpt._threeObject.position, Avatar.trackingSculpt.quaternion, Avatar.trackingSculpt.scale);
                Avatar.trackingSculpt.matrix = Avatar.trackingSculpt.matrix.multiplyMatrices(Avatar.standingMatrix, Avatar.trackingSculpt._threeObject.matrix);
                Avatar.trackingSculpt._threeObject.matrixWorldNeedsUpdate = true;
            } else {
                Avatar.trackingSculpt.position.y += Avatar.userHeight;
            }
        }

        /**
         * update positions and rotations of the activeAvatar
         */
        if (activeAvatar.trackPosition) {
            activeAvatar._setSuperPosition(Avatar.trackingSculpt.position);
            activeAvatar.HMDCamera.position.y = Avatar.trackingSculpt.position.y;
        }
        if (activeAvatar.trackRotation) {
            activeAvatar.HMDCamera.quaternion.copy(Avatar.trackingSculpt.quaternion);
            activeAvatar.HMDCamera.updateProjectionMatrix();
        }
    }
    _setSuperPosition (position) {
        const vec = new Vector3().copy(this._shiftPos);
        vec.x += position.x;
        vec.z += position.z;
        super.position = vec;
    }

    get HMDCamera() {
        return this._hmdCamera;
    }

    /**
     * Gets position of the avatar relative to its parent
     * @return {Vector3}
     */
    get position() {
        return super.position;
    }

    /**
     * "Resets" the avatar position, and then sets it to the given point
     * Calling this function will reset users movement in the real world
     * @param position {Vector3}
     */
    set position(position) {
        this._shiftPos = new Vector3().copy(position);
        this._shiftPos.x -= Avatar.trackingSculpt.position.x;
        this._shiftPos.z -= Avatar.trackingSculpt.position.z;
        super.position = this._shiftPos;
    }

    /**
     * Gets position of the avatar relative to the scene
     * @return {Vector3}
     */
    get globalPosition() {
        return super.globalPosition;
    }

    /**
     * "Resets" the avatar position, and then sets the global position to the given point
     * Calling this function will reset users movement in the real world
     * @param position {Vector3}
     */
    set globalPosition(position) {
        super.globalPosition = position;
        this.position = super.position;
    }
}

/**
 * STATICS
 * @private
 */
Avatar._frameData = null;
Avatar._vrDisplay = null;

Avatar.isRunning = false;

/**
 * This is the Sculpt object that carries the position and the rotation of the HMDCamera (headset perspective)
 * @type {Sculpt}
 */
Avatar.trackingSculpt = new Sculpt();

Avatar.isStanding = false;

// We need to figure out if this is really static, or per avatar property
Avatar.userHeight = 1.6;

Avatar.standingMatrix = new THREE.Matrix4().setPosition(new Vector3(0, Avatar.userHeight, 0));

Avatar.standing = true;
/**
 * End STATICS
 * @type {Avatar}
 */

activeAvatar = new Avatar();

messenger.post(CONST.REQUEST_ACTIVE_SCENE, {});

messenger.on(CONST.ACTIVE_SCENE, (scene) => {
    const sceneId = utils.object.getId(scene);
    if (!instances[sceneId]) {
        instances[sceneId] = new Avatar();
        activeAvatar = instances[sceneId];
        scene.add(activeAvatar);
    }
});

messenger.on(CONST.TICK, () => {
    Avatar.update();

    if (useWebVRPose && poseRequesters.length !== 0) {
        messenger.post(CONST.HMD_POSE, {
            destination: poseRequesters,
            pose: {
                position: pose.position ? Array.from(pose.position) : null,
                orientation: pose.orientation ? Array.from(pose.orientation) : null
            }
        }, postMessageTransport);
    }
});

Avatar.init();
Avatar.isRunning = true;

/**
 * if a child is requesting position
 * register it to send updates later
 */
messenger.on(CONST.REQUEST_HMD_POSE, (data, transport) => {
    if (transport === postMessageTransport) {
        poseRequesters.push(data.path[data.path.length - 1]);
    }
});

/**
 * if we are on ios and inside an iframe
 * orientation change events don't work
 * so we request hmd pose from parent iframe
 */
if (device.isIOS && device.isIframe) {
    useWebVRPose = false;

    // requesting updates on position and orientation
    messenger.on(CONST.POST_MESSAGE_TRANSPORT_PARENT_ID, () => {
        messenger.post(CONST.REQUEST_HMD_POSE, {destination: CONST.PARENT}, postMessageTransport);
    });

    // processing updates
    messenger.on(CONST.HMD_POSE, (data, transport) => {
        if (transport === postMessageTransport) {
            pose = data.body.pose;
            messenger.post(CONST.HMD_POSE, {
                destination: poseRequesters,
                pose: pose
            }, postMessageTransport);
        }
    });
}