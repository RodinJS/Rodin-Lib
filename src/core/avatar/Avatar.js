import {Sculpt} from '../sculpt';
import {HMDCamera} from '../camera'
import {messenger} from '../messenger';
import {AScheme} from '../utils/AScheme'
import * as CONST from "../constants/";

const constructorScheme = {
    trackPosition: AScheme.bool().default(true),
    trackRotation: AScheme.bool().default('$trackPosition'),
    HMDCamera: AScheme.any().hasProperty('isHMDCamera').default(new HMDCamera)
};

export class Avatar extends Sculpt {
    constructor(...args) {
        args = AScheme.validate(args, constructorScheme);

        super();
        this._hmdCamera = args.HMDCamera;

        this.trackPosition = args.trackPosition;
        this.trackRotation = args.trackRotation;

        Avatar.instances.push(this);
    }

    get HMDCamera() {
        return this._hmdCamera;
    }

    static _frameData = null;
    static _vrDisplay = null;

    static standingMatrix = new THREE.Matrix4();
    static isRunning = false;

    static trackingSculpt = new Sculpt();

    static isStanding = false;

    static instances = [];

    static init() {
        if ('VRFrameData' in window) {
            Avatar._frameData = new VRFrameData();
        }
    }

    static pause() {
        Avatar.isRunning = false;
    }

    static resume() {
        Avatar.isRunning = true;
    }

    static update() {
        if (!Avatar.isRunning)
            return;

        if (!Avatar.vrDisplay) {
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
        }

        let pose = null;

        // to support different versions of webvr api
        if (Avatar.vrDisplay.getFrameData) {
            Avatar.vrDisplay.getFrameData(Avatar._frameData);
            pose = Avatar._frameData.pose;
        } else if (Avatar.vrDisplay.getPose) {
            pose = Avatar.vrDisplay.getPose();
        }

        if (pose.orientation !== null) {
            Avatar.trackingSculpt.quaternion.fromArray(pose.orientation);
        }

        if (pose.position !== null) {
            Avatar.trackingSculpt.position.fromArray(pose.position);
        } else {
            Avatar.trackingSculpt.position.set(0, 0, 0);
        }

        if (Avatar.standing) {
            if (Avatar.vrDisplay.stageParameters) {
                const standingMatrix = new THREE.Matrix4().fromArray(Avatar.vrDisplay.stageParameters.sittingToStandingTransform);
                Avatar.trackingSculpt.matrix.multiplyMatrices(standingMatrix, Avatar.trackingSculpt.matrix);
            } else {
                Avatar.trackingSculpt.position.y += this.userHeight;
            }
        }

        /**
         * update positions and rotations of all the instances
         */
        for (let i = 0; i < Avatar.instances.length; i++) {
            if (Avatar.instances[i].trackPosition) {
                Avatar.instances[i].position.copy(Avatar.trackingSculpt.position);
            }

            if (Avatar.instances[i].trackRotation) {
                Avatar.instances[i].quaternion.copy(Avatar.trackingSculpt.quaternion);
            }
        }

    }
}

messenger.on(CONST.UPDATE, () => {
    Avatar.update();
});