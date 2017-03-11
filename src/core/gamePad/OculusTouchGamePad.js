import {GamePad} from "./GamePad";
import * as CONST from '../constants';
import {Sculpt} from '../sculpt';
import {messenger} from '../messenger';
import * as Buttons from '../button';

/**
 * A controller class for describing HTC Vive controllers event handlers.
 * @param {string} hand Required - "left" or "right".
 * @param {THREE.Scene} scene Required - the scene where the controller will be used.
 * @param {THREE.PerspectiveCamera} camera Required - the camera where the controller will be used.
 * @param {number} raycastLayers - the number of objects that can be reycasted by the same ray.
 */
export class OculusTouchGamePad extends GamePad {
    constructor(hand) {
        super('oculus', hand, CONST.VR);

        if (hand === CONST.LEFT) {
            this.buttons = [Buttons.oculusTouchLeftThumbstick, Buttons.oculusTouchX, Buttons.oculusTouchY, Buttons.oculusTouchLeftGrip, Buttons.oculusTouchLeftTrigger];
        } else {
            this.buttons = [Buttons.oculusTouchRightThumbstick, Buttons.oculusTouchA, Buttons.oculusTouchB, Buttons.oculusTouchRightGrip, Buttons.oculusTouchRightTrigger];
        }

        this.on(CONST.UPDATE, () => {
            if(!this.navigatorGamePad) {
                return;
            }

            if(!this.navigatorGamePad.polyfilledButtons) {
                this.navigatorGamePad.polyfilledButtons = [{value: 0, pressed: false}, {value: 0, pressed: false}];
            }

            this.navigatorGamePad.polyfilledButtons[0].value = this.navigatorGamePad.axes[2];
            this.navigatorGamePad.polyfilledButtons[0].pressed = this.navigatorGamePad.polyfilledButtons[0].value > .9;

            this.navigatorGamePad.polyfilledButtons[1].value = this.navigatorGamePad.axes[3];
            this.navigatorGamePad.polyfilledButtons[1].pressed = this.navigatorGamePad.polyfilledButtons[1].value > .9;
        });

        this.initControllerModel();
        this.initRaycastingLine();
        this.standingMatrix = new THREE.Matrix4().setPosition(new THREE.Vector3(0, 1.6, 0));
    }

    get isOculusTouchGamePad() {
        return true;
    }

    /**
     * Get raycasted objects ({distance, point, face, faceIndex, indices, object})of the controller's pointer ray.
     * @returns [Object]
     */
    getIntersections() {
        const tempMatrix = new THREE.Matrix4().identity().extractRotation(this.sculpt.globalMatrix);
        this.raycaster.ray.origin.setFromMatrixPosition(this.sculpt.globalMatrix);
        this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        return this.raycaster.raycast(this.raycastLayers, "Oc " + this.hand);
    }

    /**
     * Set Controller model
     */
    initControllerModel() {
        this.controllerModel = new Sculpt(`https://cdn.rodin.io/resources/models/OculusTouchController_v4/${this.hand}_oculus_controller.obj`);

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
    GamePad.oculusTouchLeft = new OculusTouchGamePad(CONST.LEFT);
    GamePad.oculusTouchRight = new OculusTouchGamePad(CONST.RIGHT);
});
