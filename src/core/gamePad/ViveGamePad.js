import {GamePad} from "./GamePad";
import * as CONST from '../constants';
import {Sculpt} from '../sculpt';
import {messenger} from '../messenger';
import * as Buttons from '../button';

function enforce() {
}

/**
 * A controller class for describing HTC Vive controllers event handlers.
 * @param {string} hand Required - "left" or "right".
 * @param {THREE.Scene} scene Required - the scene where the controller will be used.
 * @param {THREE.PerspectiveCamera} camera Required - the camera where the controller will be used.
 * @param {number} raycastLayers - the number of objects that can be reycasted by the same ray.
 */
export class ViveController extends GamePad {
    constructor(hand) {
        super('openvr', hand, CONST.VR);

        if (hand === CONST.LEFT) {
            this.buttons = [Buttons.viveLeftTrackpad, Buttons.viveLeftTrigger, Buttons.viveLeftGrip, Buttons.viveLeftMenu];
        } else {
            this.buttons = [Buttons.viveRightTrackpad, Buttons.viveRightTrigger, Buttons.viverightGrip, Buttons.viverightMenu];
        }

        this.initControllerModel();
        this.initRaycastingLine();

        messenger.post(CONST.REQUEST_ACTIVE_SCENE);

        messenger.on(CONST.ACTIVE_SCENE, (scene) => {
            this.standingMatrix = scene._controls.getStandingMatrix();
        });
    }

    /**
     * Get raycasted objects ({distance, point, face, faceIndex, indices, object})of the controller's pointer ray.
     * @returns [Object]
     */
    getIntersections() {
        const tempMatrix = new THREE.Matrix4().identity().extractRotation(this.sculpt.globalMatrix);
        this.raycaster.ray.origin.setFromMatrixPosition(this.sculpt.globalMatrix);
        this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        return this.raycaster.raycast();
    }

    /**
     * Set Controller model
     */
    initControllerModel() {
        this.controllerModel = new Sculpt('https://cdn.rodin.io/resources/models/ViveController_v2/controller.obj');

        this.controllerModel.on(CONST.READY, () => {
            this.controllerModel.parent = this.sculpt;
        });
    }

    initRaycastingLine() {
        let targetGeometry = new THREE.Geometry();
        targetGeometry.vertices.push(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1)
        );

        let targetLine = new THREE.Line(targetGeometry, new THREE.LineBasicMaterial({color: 0xff0000}));
        targetLine.geometry.vertices[1].z = -10000;
        this.raycastingLine = new Sculpt(targetLine);

        this.raycastingLine.on(CONST.READY, () => {
            if (this.sculpt.isReady) {
                this.raycastingLine.parent = this.sculpt;
            } else {
                this.sculpt.on(CONST.READY, () => {
                    this.raycastingLine.parent = this.sculpt;
                })
            }
        });
    }
}

messenger.post(CONST.REQUEST_RODIN_STARTED);

messenger.once(CONST.RODIN_STARTED, () => {
    GamePad.viveLeft = new ViveController(CONST.LEFT);
    GamePad.viveRight = new ViveController(CONST.RIGHT);
});
