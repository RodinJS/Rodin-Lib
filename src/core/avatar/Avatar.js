import {Sculpt} from '../sculpt';
import {HMDCamera} from '../camera'
//import {ErrorProtectedClassInstance} from '../error';
import {messenger} from '../messenger';
import {AScheme} from '../utils/AScheme'
import * as utils from '../utils';
import * as CONST from "../constants/";
import {device} from '../device';
import {postMessageTransport} from '../transport';
import {Vector3} from "../math/Vector3";

const constructorScheme = {
    trackPosition: AScheme.bool().default(true),
    trackRotation: AScheme.bool().default('$trackPosition'),
    HMDCamera: AScheme.any().hasProperty('isHMDCamera').default(() => new HMDCamera())
};

// let enforce = function () {
// };

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
        this.shiftPos = new Vector3();
        this.offset = new Vector3();
    }

    static _frameData = null;
    static _vrDisplay = null;

    static isRunning = false;

    /**
     * This is the Sculpt object that carries the position and the rotation of the HMDCamera (headset perspective)
     * @type {Sculpt}
     */
    static trackingSculpt = new Sculpt();

    static isStanding = false;

    // we need to figure out if this is really static, or per avatar property
    static userHeight = 1.6;

    static standingMatrix = new THREE.Matrix4().setPosition(new Vector3(0, Avatar.userHeight, 0));

    static standing = true;

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
        const vec = new Vector3().copy(this.shiftPos);
        vec.x += position.x;
        vec.z += position.z;
        super.position = vec;
    }

    get HMDCamera() {
        return this._hmdCamera;
    }

    get position() {
        return super.position;
    }

    set position(position) {
        this.shiftPos = new Vector3().copy(position);
        this.shiftPos.x -= Avatar.trackingSculpt.position.x;
        this.shiftPos.z -= Avatar.trackingSculpt.position.z;
        super.position = this.shiftPos;
    }

    get globalPosition() {
        return super.globalPosition;
    }

    set globalPosition(position) {
        super.globalPosition = position;
        this.position = super.position;
    }
}

activeAvatar = new Avatar();

messenger.post(CONST.REQUEST_ACTIVE_SCENE, {});

messenger.on(CONST.ACTIVE_SCENE, (scene) => {
    const sceneId = utils.object.getId(scene);
    if (!instances[sceneId]) {
        instances[sceneId] = new Avatar();
    }
    activeAvatar = instances[sceneId];
    scene.add(activeAvatar);
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

