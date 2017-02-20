import {GamePad} from "./gamePads/GamePad.js";
import {GazePoint} from '../sculpt/GazePoint.js';
import {ErrorCardboardControllerAlreadyExists, ErrorInvalidEventType} from '../error';
import * as CONST from '../constants';
import {Scene} from '../scene';

let controllerCreated = false;

/**
 * A controller class for describing event handlers for cardboard use.
 * @param {THREE.Scene} scene - the scene where the controller will be used.
 * @param {THREE.PerspectiveCamera} camera - the camera where the controller will be used.
 */
export class CardboardController extends GamePad {
    constructor(scene = null, camera = null) {
        if (controllerCreated) {
            throw new ErrorCardboardControllerAlreadyExists();
        }
        controllerCreated = true;
        super("cardboard", null, scene, camera, 1);

        this.setRaycasterScene(scene);
        this.setRaycasterCamera(camera);
        let gp = new GazePoint();
        this.vrOnly = true;
        gp.Sculpt.on("ready", () => {
            this.setGazePoint(gp);
            this.disable();
        });
    }

    /**
     * Get raycasted objects ({distance, point, face, faceIndex, indices, object}) that are in camera's center.
     * @returns {Object[]}
     */
    getIntersections() {
        this.raycaster.setScene(Scene.active);
        this.raycaster.set(Scene.active._camera.getWorldPosition(), Scene.active._camera.getWorldDirection());
        return this.raycaster.raycast();
    }

    /**
     * Set propagation value for standard events, recommended, when using custom handlers on mousedown(touchstart) or mouseup(touchend).
     * @param {string} eventName - 'mousedown', 'mouseup', mousemove'.
     * @param {boolean} value - true, false.
     */
    setPropagation(eventName, value) {
        let gamePad = CardboardController.getGamepad();
        value = !value;

        switch (eventName) {
            case CONST.MOUSE_DOWN:
                gamePad.stopPropagationOnMouseDown = value;
                return;

            case CONST.MOUSE_UP:
                gamePad.stopPropagationOnMouseUp = value;
                return;

            case CONST.MOUSE_MOVE:
                gamePad.stopPropagationOnMouseMove = value;
                return;
        }

        throw new ErrorInvalidEventType(eventName, 'setPropagation');
    }

    /**
     * Start propagation for event.
     * @param {string} eventName
     */
    startPropagation(eventName) {
        this.setPropagation(eventName, true);
    }

    /**
     * Stop propagation for event.
     * @param {string} eventName
     */
    stopPropagation(eventName) {
        this.setPropagation(eventName, false);
    }

    /**
     * Key down (cardboard button press) event handler.
     * @param {number} keyCode
     */
    onKeyDown(keyCode) {

        this.keyCode = keyCode;
        this.engaged = true;
        if (!this.pickedItems) {
            this.pickedItems = [];
        }

        if (this.intersected && this.intersected.length > 0) {
            this.stopPropagation(CONST.MOUSE_DOWN);
            this.stopPropagation(CONST.MOUSE_MOVE);
        }
    }

    /**
     * Key up (cardboard button up) event handler.
     * @param {Number} keyCode
     */
    onKeyUp(keyCode) {
        this.engaged = false;
        this.pickedItems = [];
        this.keyCode = null;

        this.startPropagation(CONST.MOUSE_DOWN);
        this.startPropagation(CONST.MOUSE_MOVE);
    }

    /**
     * Get gamepad from navigator.
     * @returns {CardboardGamePad}
     */
    static getGamepad() {
        return navigator.cardboardGamePad;
    }

    /**
     * Set GazePoint
     * @param {GazePoint} gazePoint object to add
     */
    setGazePoint(gazePoint) {
        gazePoint.controller = this;
        this.gazePoint = gazePoint;
        if(this.camera) {
            this.camera.add(this.gazePoint.Sculpt.object3D);
        }
    }
}