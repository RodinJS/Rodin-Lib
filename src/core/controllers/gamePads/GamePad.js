import {Raycaster} from '../../raycaster/Raycaster.js';
import {ErrorAbstractClassInstance, ErrorProtectedFieldChange} from '../../error';
import {RodinEvent} from '../../rodinEvent';
import {messenger} from '../../messenger';
import * as CONST from '../../constants';

import {MouseGamePad} from './MouseGamePad.js';
import {CardboardGamePad} from './CardboardGamePad.js';

import {Scene} from '../../scene';
import {Sculpt} from '../../sculpt';

const containsIntersect = function (interArray, inter) {
    for (let i = 0; i < interArray.length; i++) {
        let intersect = interArray[i];
        if (intersect.object.Sculpt === inter.object.Sculpt) {
            return true;
        }
    }
    return false;
};

const instances = [];

/**
 * General GamePad class, custom controllers extend this class.
 * @param {string} [navigatorGamePadId] - custom ID for the gamepad instance.
 * @param {string} [hand] - gamepad holding hand (left/right).
 * @param {THREE.Scene} [scene] - the scene where the gamepad will be used.
 * @param {THREE.PerspectiveCamera} [camera] - current camera... what else ?
 * @param {number} [raycastLayers] - number of objects to be simultaneously raycasted by the ray.
 */
export class GamePad extends THREE.Object3D {

    constructor(navigatorGamePadId = "", hand = null, scene = null, camera = null, raycastLayers = 1) {

        super();

        this._lastKeyDownTimestamp = {};
        /**
         * The maximum time (ms) that may pass between keydown and keyup events, in order to trigger CONTROLLER_KEY event.
         * @type {number}
         */
        this.keyHandleDelta = 200;

        this._lastToudhTimestamp = {};
        /**
         * The maximum time (ms) that may pass between touchstart and touchend events, in order to trigger CONTROLLER_TAP event.
         * @type {number}
         */
        this.touchHandleDelta = 200;

        navigator.mouseGamePad = MouseGamePad.getInstance();
        navigator.cardboardGamePad = CardboardGamePad.getInstance();

        /**
         * The id (name) of the gamePad of current instance.
         * @type {string}
         */
        this.navigatorGamePadId = navigatorGamePadId;

        /**
         * The name of the hand (left or right) of the gamePad of current instance.
         * @type {string}
         */
        this.hand = hand;

        /**
         * Raycaster object used to pick/select items with current controller.
         * @type {Raycaster}
         */
        this.raycaster = new Raycaster();
        this.raycaster.setScene(scene);

        /**
         * Camera object used to render current scene.
         * @type {THREE.PerspectiveCamera}
         */
        this.camera = camera;

        /**
         * The number of objects that can be reycasted by the same ray.
         * @type {numbers}
         */
        this.raycastLayers = raycastLayers;

        /**
         * Objects currently intersected by this gamepad.
         * @type {Object}
         */
        this.intersected = [];
        /**
         * Just a temporary matrix, used in extended controller classes, to perform raycasting.
         * @type {THREE.Matrix4}
         */
        this.tempMatrix = new THREE.Matrix4();
        // TODO: check if we need this shit
        this.matrixAutoUpdate = false;
        /**
         * Matrix used to correctly position the controller object (if any) in the scene.
         * @type {THREE.Matrix4}
         */
        this.standingMatrix = new THREE.Matrix4();
        /**
         * Shows if the controller is engaged in an event or not.
         * @type {boolean}
         */
        this.engaged = false;
        /**
         * A map, showing if a particular warning has already been fired or not.
         * @type {Object}
         */
        this.warningsFired = {};

        /**
         * An array of gamepad key names/ids.
         * @type {string[]}
         */
        this.buttons = [1,2,3,4,5,6];

        /**
         * An array, showing the Pressed state of the button.
         * @type {boolean[]}
         */
        this.buttonsPressed = new Array(this.buttons.length).fill(false);
        /**
         * An array, showing the Touched state of the button.
         * @type {boolean[]}
         */
        this.buttonsTouched = new Array(this.buttons.length).fill(false);
        /**
         * An array, showing the Value state of the button.
         * @type {number[]}
         */
        this.buttonsValues = new Array(this.buttons.length).fill(0);

        /**
         * The gamepad state (enabled/disabled).
         * @type {boolean}
         */
        this.enabled = true;

        /**
         * Gaze Point
         * @type {GazePoint}
         */
        this.gazePoint = null;

        /**
         * Indicates weather the gamepad must be enabled only in VR mode
         * @type {boolean} [vrOnly = false]
         */
        this.vrOnly = false;

        this.deviceDetected = false;

        window.addEventListener('vrdisplaypresentchange', (e) => {
            if (!this.vrOnly) return;
            let re = new RegExp(this.navigatorGamePadId, 'gi');

            const display = Scene.webVRmanager.hmd;

            if (display && re.test(display.displayName)) {
                display.isPresenting ? this.enable() : this.disable();
            }
        }, true);

        instances.push(this);

        this.Sculpt = new Sculpt(this);
        Scene.add(this.Sculpt);
    }

    /**
     * enable gamepad
     */
    enable() {
        this.enabled = true;
        this.onEnable();
        if (this.gazePoint && this.camera) {
            this.camera.add(this.gazePoint.Sculpt._threeObject);
        }
    }


    /**
     * disable gamepad
     */
    disable() {
        this.enabled = false;
        this.onDisable();
        if (this.gazePoint && this.gazePoint.Sculpt._threeObject.parent) {
            this.gazePoint.Sculpt._threeObject.parent.remove(this.gazePoint.Sculpt._threeObject);
        }
    }

    /**
     * get controller from navigator
     * @param {string} id
     * @param {string} hand
     * @returns {Object} controller or null
     */
    static getControllerFromNavigator(id, hand = null) {
        let controllers = [];
        try {
            controllers = [...navigator.getGamepads()];

            /// TODO by Lyov: add static array like: customGamePads for remote add custom game pads without change GamePad class

            controllers.push(navigator.mouseGamePad);
            controllers.push(navigator.cardboardGamePad);
        } catch (ex) {
            controllers = [navigator.mouseGamePad, navigator.cardboardGamePad];
        }
        if (!controllers || !controllers.length || controllers[0] === undefined) {
            controllers = [navigator.mouseGamePad, navigator.cardboardGamePad];
        }
        for (let i = 0; i < controllers.length; i++) {
            let controller = controllers[i];
            if (controller && controller.id && controller.id.match(new RegExp(id, 'gi'))) {
                if (hand === null) {
                    return controller;
                } else {
                    if (controller.hand && controller.hand.match(new RegExp(hand, 'gi'))) {
                        return controller;
                    }

                    const controllerIndexMap = {
                        right: 1,
                        left: 1
                    };

                    if(controller.index === controllerIndexMap[hand]) {
                        return controller;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Set scene for raycaster
     *
     * @param {THREE.Scene} scene
     */
    setRaycasterScene(scene) {
        this.raycaster.setScene(scene);
    }

    /**
     * Set camera for raycaster
     *
     * @param {THREE.PerspectiveCamera} camera
     */
    setRaycasterCamera(camera) {
        this.camera = camera;
        if (this.gazePoint) {
            if (this.gazePoint.Sculpt.object3D.parent) {
                this.gazePoint.Sculpt.object3D.parent.remove(this.gazePoint.Sculpt.object3D);
            }

            this.camera.add(this.gazePoint.Sculpt.object3D);
        }
    }

    /**
     * Getter for GamePad axes.
     * @returns {Array} An array of double values
     */
    get axes() {
        return GamePad.getControllerFromNavigator(this.navigatorGamePadId, this.hand).axes;
    }

    /**
     * Checks the gamepad state, calls the appropriate methods
     */
    update() {
        if (!this.enabled)
            return;

        let controller = GamePad.getControllerFromNavigator(this.navigatorGamePadId, this.hand);

        if (!controller) {
            if (!this.warningsFired[this.navigatorGamePadId]) {
                this.warningsFired[this.navigatorGamePadId] = true;
                console.warn(`Controller by id ${this.navigatorGamePadId} not found`);
            }

            this.deviceDetected = false;
            if (this.controllerModel && this.controllerModel.isReady && this.controllerModel.parent) {
                this.controllerModel && this.controllerModel.parent && this.remove(this.controllerModel._threeObject);
            }

            if (this.raycastingLine && this.raycastingLine.isReady && this.raycastingLine.parent) {
                this.raycastingLine && this.raycastingLine.parent && this.remove(this.raycastingLine._threeObject);
            }

            return;
        }

        this.deviceDetected = true;
        if (this.controllerModel && this.raycastingLine.isReady && !this.controllerModel.parent) {
            this.add(this.controllerModel._threeObject);
        }

        if (this.raycastingLine && this.raycastingLine.isReady && !this.raycastingLine.parent) {
            this.add(this.raycastingLine._threeObject);
        }

        this.onControllerUpdate();
        this.updateObject(controller);
        this.intersectObjects(controller);

        for (let i = 0; i < controller.buttons.length; i++) {

            // Handle controller button pressed event
            // Vibrate the gamepad using to the value of the button as
            // the vibration intensity.
            if (this.buttonsPressed[i] !== controller.buttons[i].pressed) {
                controller.buttons[i].pressed ? this.keyDown(this.buttons[i]) : this.keyUp(this.buttons[i]);
                this.buttonsPressed[i] = controller.buttons[i].pressed;
                if ("haptics" in controller && controller.haptics.length > 0) {
                    if (controller.buttons[i]) {
                        controller.haptics[0].vibrate(controller.buttons[i].value, 50);
                        break;
                    }
                }
            }

            // Handle controller button value change
            if (this.buttonsValues[i] !== controller.buttons[i].value) {
                this.valueChange(this.buttons[i]);
                this.buttonsValues[i] = controller.buttons[i].value;
            }

            // Handle controller button touch event
            // Vibrate the gamepad using to the value of the button as
            // the vibration intensity.
            if (this.buttonsTouched[i] !== controller.buttons[i].touched) {
                controller.buttons[i].touched ? this.touchDown(this.buttons[i], controller) : this.touchUp(this.buttons[i], controller);
                this.buttonsTouched[i] = controller.buttons[i].touched;
            }

            if (controller.buttons[i].touched) {
                this.onTouchDown(this.buttons[i], controller);
            }
        }
    }

    /**
     * Update controller object in scene, update position and rotation
     * @param {Object} controller
     */
    updateObject(controller) {
        if (controller.pose) {
            let pose = controller.pose;

            if (pose.position !== null) this.position.fromArray(pose.position);
            if (pose.orientation !== null) this.quaternion.fromArray(pose.orientation);
            this.matrix.compose(this.position, this.quaternion, this.scale);
            this.matrix.multiplyMatrices(this.standingMatrix, this.matrix);
            this.matrixWorldNeedsUpdate = true;
            this.visible = true;
        }
    }

    /**
     * Checks all intersect and emits hover and hoverOut events
     * @param {Object} controller
     */
    intersectObjects(controller) {
        if (!this.getIntersections) {
            console.warn(`getIntersections method is not defined`);
        }

        if (this.engaged)
            return;

        let intersections = this.getIntersections(controller);

        if (intersections.length > 0) {
            if (intersections.length > this.raycastLayers) {
                intersections.splice(this.raycastLayers, (intersections.length - this.raycastLayers));
            }
        }

        let currentEvent = null;
        let doGamePadHoverOut = false;
        this.intersected.map(intersect => {
            let found = false;
            for (let int = 0; int < intersections.length; int++) {
                if (intersections[int].object.Sculpt === intersect.object.Sculpt) {
                    found = true;
                }
            }
            if (!found) {
                if (currentEvent && !currentEvent.propagation)
                    return;

                doGamePadHoverOut = true;
                currentEvent = new RodinEvent(intersect.object.Sculpt, null, null, "", this);
                intersect.object.Sculpt.emit(CONST.CONTROLLER_HOVER_OUT, currentEvent);
            }
        });
        doGamePadHoverOut && this.gamepadHoverOut();

        if (intersections.length > 0) {
            let currentEvent = null;
            let doGamePadHovered = false;
            intersections.map(intersect => {
                if (!containsIntersect(this.intersected, intersect) || intersect.object.Sculpt.forceHover) {
                    if (currentEvent && !currentEvent.propagation)
                        return;

                    doGamePadHovered = true;
                    currentEvent = new RodinEvent(intersect.object.Sculpt, null, null, "", this);
                    currentEvent.distance = intersect.distance;
                    currentEvent.uv = intersect.uv;
                    intersect.object.Sculpt.emit(CONST.CONTROLLER_HOVER, currentEvent);
                }
            });
            doGamePadHovered && this.gamepadHover(intersections);
        }
        this.intersected = [...intersections];
    }

    /**
     * Emits the given event for currently raycasted objects.
     * @param {string} eventName
     * @param {*} DOMEvent
     * @param {number} keyCode
     * @param {GamePad} controller
     */
    raycastAndEmitEvent(eventName, DOMEvent, keyCode, controller = null) {
        let currentEvent = null;
        if (this.intersected && this.intersected.length > 0) {
            let i = 0;
            do {
                let intersect = this.intersected[i++];
                currentEvent = new RodinEvent(intersect.object.Sculpt, DOMEvent, keyCode, this.hand, controller);
                currentEvent.distance = intersect.distance;
                currentEvent.uv = intersect.uv;
                intersect.object.Sculpt.emit(eventName, currentEvent);
            } while (currentEvent.propagation === true && i < this.intersected.length);
        }
    }

    /**
     * Returns function(keyCode) to emit the valueChange event via raycastAndEmitEvent function.
     */
    get valueChange() {
        return (keyCode) => {
            this.onValueChange && this.onValueChange(keyCode);
            this.raycastAndEmitEvent(CONST.CONTROLLER_VALUE_CHANGE, null, keyCode, this);
        }
    }

    set valueChange(value) {
        throw new ErrorProtectedFieldChange('valueChange');
    }

    /**
     * Custom callback for gamepad key value change event.
     * @param {number} value
     */
    onValueChange(value) {
    }

    /**
     * Returns function(keyCode) to emit the keyDown event via raycastAndEmitEvent function.
     */
    get keyDown() {
        return (keyCode) => {
            this._lastKeyDownTimestamp[keyCode] = Date.now();
            this.onKeyDown && this.onKeyDown(keyCode);
            this.raycastAndEmitEvent(CONST.CONTROLLER_KEY_DOWN, null, keyCode, this);
        }
    }

    set keyDown(value) {
        throw new ErrorProtectedFieldChange('keyDown');
    }

    /**
     * Custom callback for gamepad keyDown event.
     * @param {number} keyCode
     */
    onKeyDown(keyCode) {
    }


    /**
     * Returns function(keyCode) to emit the keyUp event via raycastAndEmitEvent function.
     */
    get keyUp() {
        return (keyCode) => {
            this.onKeyUp && this.onKeyUp(keyCode);
            this.raycastAndEmitEvent(CONST.CONTROLLER_KEY_UP, null, keyCode, this);
            if (Date.now() - this._lastKeyDownTimestamp[keyCode] < this.keyHandleDelta) {
                this.raycastAndEmitEvent(CONST.CONTROLLER_KEY, null, keyCode, this);
            }
            this._lastKeyDownTimestamp[keyCode] = 0;
        }
    }

    set keyUp(value) {
        throw new ErrorProtectedFieldChange('keyUp');
    }

    /**
     * Custom callback for gamepad keyUp event.
     * @param {number} keyCode
     */
    onKeyUp(keyCode) {
    }

    /**
     * Returns function(keyCode, gamepad) to emit the touchDown event via raycastAndEmitEvent function.
     */
    get touchDown() {
        return (keyCode, gamepad) => {
            this._lastToudhTimestamp[keyCode] = Date.now();
            this.onTouchDown && this.onTouchDown(keyCode, gamepad);
            this.raycastAndEmitEvent(CONST.CONTROLLER_TOUCH_START, null, keyCode, this);
        }
    }

    set touchDown(value) {
        throw new ErrorProtectedFieldChange('touchDown');
    }

    /**
     * Custom callback for gamepad touchDown event.
     * @param {number} keyCode
     * @param {object} gamepad
     */
    onTouchDown(keyCode, gamepad) {
    }

    /**
     * Returns function(keyCode, gamepad) to emit the touchUp event via raycastAndEmitEvent function.
     */
    get touchUp() {
        return (keyCode, gamepad) => {
            this.onTouchUp && this.onTouchUp(keyCode, gamepad);
            this.raycastAndEmitEvent(CONST.CONTROLLER_TOUCH_END, null, keyCode, this);
            if (Date.now() - this._lastToudhTimestamp < this.touchHandleDelta) {
                this.raycastAndEmitEvent(CONST.CONTROLLER_TAP, null, keyCode, this);
            }
            this._lastToudhTimestamp[keyCode] = Date.now();
        }
    }

    set touchUp(value) {
        throw new ErrorProtectedFieldChange('touchUp');
    }

    /**
     * Custom callback for gamepad touchUp event.
     * @param {number} keyCode
     * @param {object} gamepad
     */
    onTouchUp(keyCode, gamepad) {
    }

    /**
     * Custom callback for gamepad disable event.
     */
    onDisable() {

    }

    /**
     * Custom callback for gamepad enable event.
     */
    onEnable() {

    }

    /**
     * Custom function for gamepad update (called on each animation frame).
     */
    onControllerUpdate() {
    }

    /**
     * Custom callback for gamepad hover event (when gamepada hovers a raycastable object).
     */
    gamepadHover(intersect) {
    }

    /**
     * Custom callback for gamepad hoverOut event (when gamepada hovers out of a raycastable object).
     */
    gamepadHoverOut() {
    }
}

messenger.on(CONST.RENDER_START, () => {
    for(let i = 0; i < instances.length; i ++) {
        instances[i].update();
    }
});

messenger.on(CONST.ACTIVE_SCENE, () => {
    for(let i = 0; i < instances.length; i ++) {
        Scene.add(instances[i].Sculpt);
    }
});