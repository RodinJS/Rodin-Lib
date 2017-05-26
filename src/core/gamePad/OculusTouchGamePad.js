import {GamePad} from "./GamePad";
import * as CONST from '../constants';
import {Sculpt} from '../sculpt';
import {messenger} from '../messenger';
import * as Buttons from '../button';
import {Vector3} from '../math';

/**
 * A controller class for describing Oculus Rift Touch controllers event handlers.
 * @param {string} hand Required - "left" or "right".
 */
export class OculusTouchGamePad extends GamePad {
    constructor(hand) {
        super('oculus', hand, CONST.VR);
        /**
         * An array with Button objects.
         * @type {Button[]}
         */
        this.buttons = [];
        if (hand === CONST.LEFT) {
            this.buttons = [Buttons.oculusTouchLeftThumbstick, Buttons.oculusTouchX, Buttons.oculusTouchY, Buttons.oculusTouchLeftTrigger, Buttons.oculusTouchLeftGrip];
        } else {
            this.buttons = [Buttons.oculusTouchRightThumbstick, Buttons.oculusTouchA, Buttons.oculusTouchB, Buttons.oculusTouchRightTrigger, Buttons.oculusTouchRightGrip];
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
        this.standingMatrix = new THREE.Matrix4().setPosition(new Vector3(0, 1.6, 0));
    }

    /**
     * Returns true to indicate that this is an instance of OculusTouchGamePad.
     * @returns {boolean} - true
     */
    get isOculusTouchGamePad() {
        //todo: raname GamePad to Gamepad with lower case p
        return true;
    }

    /**
     * Get raycasted objects ({distance, point, face, faceIndex, indices, object})of the controller's pointer ray.
     * @returns {Sculpt[]}
     */
    getIntersections() {
        const tempMatrix = new THREE.Matrix4().identity().extractRotation(this.sculpt.globalMatrix);
        this.raycaster.ray.origin.setFromMatrixPosition(this.sculpt.globalMatrix);
        this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        return this.raycaster.raycast(this.raycastLayers);
    }

    /**
     * Set Controller model to Oculus touch controller model.
     * @param {string} [url] - url to .obj model of the controller.
     */
    initControllerModel(url = `https://cdn.rodin.io/resources/models/OculusTouchController_v4/${this.hand}_oculus_controller.obj`) {
        this.controllerModel = new Sculpt(url);

        this.controllerModel.on(CONST.READY, () => {
            this.controllerModel.parent = this.sculpt;
        });
    }

    /**
     * Init raycasting line. Create a line for controller direction
     *
     * @param {number} [color=0xff0000]
     */
    initRaycastingLine(color = 0xff0000) {
        let targetGeometry = new THREE.Geometry();
        targetGeometry.vertices.push(
            new Vector3(0, 0, 0),
            new Vector3(0, 0, -1)
        );

        let targetLine = new THREE.Line(targetGeometry, new THREE.LineBasicMaterial({color: color}));
        targetLine.geometry.vertices[1].z = -1000;
        /**
         * The raycasting line Sculpt.
         * @type {Sculpt}
         */
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
