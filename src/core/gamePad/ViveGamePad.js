import {GamePad} from "./GamePad";
import * as CONST from '../constants';
import {Sculpt} from '../sculpt';
import {messenger} from '../messenger';
import * as Buttons from '../button';
import {Vector3} from '../math';
import {Avatar} from '../avatar';

/**
 * A controller class for describing HTC Vive controllers event handlers.
 * @param {string} hand Required - "left" or "right".
 */
export class ViveController extends GamePad {
    constructor(hand) {
        super('openvr', hand, CONST.VR);
        /**
         * An array with Button objects.
         * @type {Button[]}
         */
        this.buttons = [];
        if (hand === CONST.LEFT) {
            this.buttons = [Buttons.viveLeftTouchpad, Buttons.viveLeftTrigger, Buttons.viveLeftGrip, Buttons.viveLeftMenu];
        } else {
            this.buttons = [Buttons.viveRightTouchpad, Buttons.viveRightTrigger, Buttons.viveRightGrip, Buttons.viveRightMenu];
        }

        this.initControllerModel();
        this.initRaycastingLine();

        messenger.post(CONST.REQUEST_ACTIVE_SCENE);

        messenger.on(CONST.ACTIVE_SCENE, () => {
            this.standingMatrix = Avatar.standingMatrix;
        });
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
     * Set Controller model to HTC Vive controller model.
     * @param {string} [url] - url to .obj model of the controller.
     */
    initControllerModel(url = 'https://cdn.rodin.io/resources/models/ViveController_v2/controller.obj') {
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
        this.raycastingLine.gamepadVisible = false;
        this.raycastingLine.parent = this.sculpt;
    }
}

messenger.post(CONST.REQUEST_RODIN_STARTED);

messenger.once(CONST.RODIN_STARTED, () => {
    GamePad.viveLeft = new ViveController(CONST.LEFT);
    GamePad.viveRight = new ViveController(CONST.RIGHT);
});
