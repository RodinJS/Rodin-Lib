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
        this.add(this._hmdCamera);

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

    // we need to figure out if this is really static, or per avatar property
    static userHeight = 1.6;

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

        let pose = null;

        // to support different versions of webvr api
        if (Avatar._vrDisplay.getFrameData) {
            Avatar._vrDisplay.getFrameData(Avatar._frameData);
            pose = Avatar._frameData.pose;
        } else if (Avatar._vrDisplay.getPose) {
            pose = Avatar._vrDisplay.getPose();
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
         * update positions and rotations of all the instances
         */
        for (let i = 0; i < Avatar.instances.length; i++) {
            if (Avatar.instances[i].trackPosition) {
                Avatar.instances[i].position.copy(Avatar.trackingSculpt.position);
            }

            if (Avatar.instances[i].trackRotation) {
                Avatar.instances[i].HMDCamera.quaternion.copy(Avatar.trackingSculpt.quaternion);
                Avatar.instances[i].HMDCamera.updateProjectionMatrix();
            }
        }

    }

    static get active() {
        //TODO: THIS IS NOT RIGHT
        //TODO: FIX THIS LATER, NO TIME NOW
        return Avatar.instances[0];
    }
}

messenger.on(CONST.RENDER_START, () => {
    Avatar.update();
});

Avatar.init();
Avatar.isRunning = true;