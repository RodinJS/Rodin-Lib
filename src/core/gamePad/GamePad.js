import {EventEmitter} from '../eventEmitter';
import {messenger} from '../messenger';
import * as CONST from '../constants';
import {Sculpt} from '../sculpt';
import {RodinEvent} from '../rodinEvent';
import {Raycaster} from '../raycaster';
import {Scene} from '../scene';

function enforce() {
}

let buttonsPressed = new Set();
let buttonsDown = new Set();
let buttonsUp = new Set();
let buttonsChanged = new Set();

messenger.on(CONST.RENDER_START, () => {
    buttonsChanged.clear();
    buttonsDown.clear();
    buttonsUp.clear();
});

/**
 * General GamePad class, custom gamepads should extend this class.
 * @param {string} [navigatorGamePadId] - custom ID for the gamepad instance in navigator.
 * @param {string} [hand] - gamepad holding hand (left/right).
 * @param {string} [type] - VR, NON-VR or both
 */
export class GamePad extends EventEmitter {
    constructor(navigatorGamePadId = "", hand = null, type = CONST.BOTH) {
        super();

        /**
         * Defines the type of the gamepad (CONST.VR, CONST.NON_VR, CONST.BOTH).
         * @type {string}
         */
        this.type = type;

        /**
         * The gamepad state (enabled/disabled).
         * @type {boolean}
         */
        this._enabled = false;

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
         * The actual gamePad object link from navigator.
         * @type {object}
         */
        this.navigatorGamePad = null;

        /**
         * Indicates how many objects can be raycasted by this gamepad in a row.
         * @type {Number}
         * @default
         */
        this.raycastLayers = Infinity;

        /**
         * Objects currently intersected by this gamepad.
         * @type {Set.<Sculpt>}
         */
        this.intersected = [];
        /**
         * Raycaster object used to pick/select items with current controller.
         * @type {Raycaster}
         */
        this.raycaster = new Raycaster();
        /**
         * Buttons array from current navigatorGamePad.
         * @type {Button[]}
         */
        this.buttons = [];
        /**
         * The gamePad mesh model (if any) in the scene.
         * @type {Sculpt}
         */
        this.sculpt = new Sculpt();
        /**
         * Matrix used to correctly position the controller object (if any) in the scene.
         * @type {THREE.Matrix4}
         */
        this.standingMatrix = new THREE.Matrix4().identity();

        this.sculpt.on(CONST.READY, () => {
            // todo: fix this later
            this.sculpt._threeObject.matrixAutoUpdate = false;
            messenger.post(CONST.REQUEST_ACTIVE_SCENE);

            messenger.on(CONST.ACTIVE_SCENE, () => {
                this.sculpt.parent = Scene.active;
            });
        });


        this.sculpt.on(CONST.UPDATE, () => {
            // todo: use enable and disable functions of sculpt
            if (this.navigatorGamePad && this.navigatorGamePad.pose) {
                this.sculpt.visible = true;
                this.updateObject();
            } else {
                this.sculpt.visible = false;
            }
        });

        messenger.on(CONST.RENDER_START, () => {
            if (this._enabled) {
                this.update();
            }
        });

        if (this.type === CONST.BOTH || this.type === CONST.NON_VR) {
            this.enable();
        }

        window.addEventListener('vrdisplaypresentchange', () => {
            if (this.type === CONST.BOTH) return;
            let re = new RegExp(this.navigatorGamePadId, 'gi');

            const hmd = Scene.webVRmanager.hmd;

            if (hmd) {
                if (hmd.isPresenting && this.type === CONST.VR && re.test(hmd.displayName) || !hmd.isPresenting && this.type === CONST.NON_VR) {
                    this.enable();
                } else {
                    this.disable();
                }
            }
        });
    }

    /**
     * enable gamepad
     */
    enable() {
        this._enabled = true;
    }

    /**
     * disable gamepad
     */
    disable() {
        this._enabled = false;
    }

    /**
     * Get controller from navigator
     * @param {string} id
     * @param {string} hand
     * @returns {Object} controller or null
     */
    static getControllerFromNavigator(id, hand = null) {
        let gamepads = [navigator.mouseGamePad, navigator.cardboardGamePad];
        let navigatorGamepads = [];
        try {
            navigatorGamepads = navigator.getGamepads();

        } catch (ex) {
        }

        for (let i = 0; i < navigatorGamepads.length; i++) {
            if (navigatorGamepads[i] === null)
                continue;
            gamepads.push(navigatorGamepads[i]);
        }

        for (let i = 0; i < gamepads.length; i++) {
            let controller = gamepads[i];
            if (controller && controller.id && controller.id.match(new RegExp(id, 'gi'))) {
                if (hand === null || (controller.hand && controller.hand.match(new RegExp(hand, 'gi')))) {
                    return controller;
                }
            }
        }

        return null;
    }

    /**
     * Checks the gamepad state, calls the appropriate methods
     */
    update() {
        this.navigatorGamePad = GamePad.getControllerFromNavigator(this.navigatorGamePadId, this.hand);

        if (!this.navigatorGamePad) {
            return;
        }

        this.emit(CONST.UPDATE, new RodinEvent(this, {gamePad: this}));

        this.intersectObjects();

        let buttonDownDetected = false;
        let valueChangeDetected = false;
        let buttonUpDetected = false;

        let buttonsToCheck = this.navigatorGamePad.buttons.concat(this.navigatorGamePad.polyfilledButtons || []);
        for (let i = 0; i < buttonsToCheck.length; i++) {
            if (!this.buttons[i]) continue;

            if (this.buttons[i].pressed !== buttonsToCheck[i].pressed) {
                this.buttons[i].pressed = buttonsToCheck[i].pressed;
                this.buttons[i].pressed ? this.buttonDown(this.buttons[i]) : this.buttonUp(this.buttons[i]);
                this.buttons[i].pressed ? buttonDownDetected = true : buttonUpDetected = true;
            }

            if (this.buttons[i].value !== buttonsToCheck[i].value) {
                this.valueChange(this.buttons[i]);
                this.buttons[i].value = buttonsToCheck[i].value;
                valueChangeDetected = true;
            }

            if (this.buttons[i].touched !== buttonsToCheck[i].touched) {
                this.buttons[i].touched = buttonsToCheck[i].touched;
                this.buttons[i].touched ? this.touchStart(this.buttons[i]) : this.touchEnd(this.buttons[i]);
            }
        }

        buttonDownDetected && this.emit(CONST.GAMEPAD_BUTTON_DOWN, new RodinEvent(this));
        valueChangeDetected && this.emit(CONST.GAMEPAD_BUTTON_CHANGE, new RodinEvent(this));
        buttonUpDetected && this.emit(CONST.GAMEPAD_BUTTON_UP, new RodinEvent(this));
    }

    /**
     * Checks all intersected objects and emits hover and hoverOut events.
     */
    intersectObjects() {
        if (!this.getIntersections) {
            // todo: return all sculpts that are visible for controllers
            return [];
        }

        let intersections = this.getIntersections();

        let hoveredOutSculpts = this.intersected.filter(intersect => {
            for (let i = 0; i < intersections.length; i++) {
                if (intersections[i].sculpt === intersect.sculpt) {
                    return false;
                }
            }

            return true;
        });


        this.emitAll(enforce, hoveredOutSculpts, CONST.GAMEPAD_HOVER_OUT, null);
        if (hoveredOutSculpts.length > 0) {
            this.emit(CONST.GAMEPAD_HOVER, new RodinEvent(this));
        }

        this.emitAll(enforce, intersections, CONST.GAMEPAD_MOVE, null);

        let hoveredSculpts = intersections.filter(intersect => {
            for (let i = 0; i < this.intersected.length; i++) {
                if (this.intersected[i].sculpt === intersect.sculpt) {
                    return false;
                }
            }

            return true;
        });


        this.emitAll(enforce, hoveredSculpts, CONST.GAMEPAD_HOVER, null);
        if (hoveredSculpts.length > 0) {
            this.emit(CONST.GAMEPAD_HOVER_OUT, new RodinEvent(this));
        }

        this.intersected = [...intersections];
    }

    /**
     * Updates controller object in scene, updates position and rotation.
     */
    updateObject() {
        let pose = this.navigatorGamePad.pose;

        if (!pose) return;

        // todo: check this logic
        if (pose.position !== null) this.sculpt.position.fromArray(pose.position);
        if (pose.orientation !== null) this.sculpt.quaternion.fromArray(pose.orientation);
        this.sculpt.matrix.compose(this.sculpt._threeObject.position, this.sculpt.quaternion, this.sculpt.scale);
        this.sculpt.matrix = this.sculpt.matrix.multiplyMatrices(this.standingMatrix, this.sculpt._threeObject.matrix);
        this.sculpt._threeObject.matrixWorldNeedsUpdate = true;
    }

    /**
     * Emits the given event for all provided objects til the last one, or til the one that stops the propagation.
     * @param e
     * @param objects
     * @param eventName
     * @param DOMEvent
     * @param button
     * @private
     */
    emitAll(e, objects, eventName, DOMEvent, button) {
        if (e !== enforce) {
            // todo: change this
            throw new Error();
        }

        if (objects.length === 0)
            return;

        let currentEvent = new RodinEvent(objects[0].sculpt, {domEvent: DOMEvent, button: button, gamepad: this});
        ;
        let i = 0;
        do {
            currentEvent.target = objects[i].sculpt;
            currentEvent.distance = objects[i].distance;
            currentEvent.uv = objects[i].uv;
            objects[i].sculpt.emit(eventName, currentEvent);
            i++;
        } while (currentEvent.propagation && i < objects.length);
    }

    /**
     * Emits the given event for all intersected objects til the last one, or til the one that stops the propagation.
     * @param e
     * @param eventName
     * @param DOMEvent
     * @param button
     */
    emitIntersected(e, eventName, DOMEvent, button) {
        this.emitAll(e, this.intersected, eventName, DOMEvent, button)
    }

    /**
     * Emits the  CONST.GAMEPAD_BUTTON_DOWN event
     * @param {object} button
     */
    buttonDown(button) {
        buttonsDown.add(button);
        buttonsPressed.add(button);
        this.emitIntersected(enforce, CONST.GAMEPAD_BUTTON_DOWN, null, button, this);
    }

    /**
     * Emits the CONST.GAMEPAD_BUTTON_UP event
     * @param {object} button
     */
    buttonUp(button) {
        buttonsUp.add(button);
        buttonsPressed.delete(button);
        this.emitIntersected(enforce, CONST.GAMEPAD_BUTTON_UP, null, button, this);
    }

    // todo: implement this feature when firefox api or serghov will send data about touch
    touchStart() {

    }

    touchEnd() {

    }

    /**
     * The button value change function emitter.
     * @param {object} button
     */
    valueChange(button) {
        buttonsChanged.add(button);
        this.emitIntersected(enforce, CONST.GAMEPAD_BUTTON_CHANGE, null, button, this);
    }

    /**
     * Shows if the provided button was pressed
     * between previous and current frames
     * @returns {boolean}
     */
    static getButtonDown(btn) {
        return buttonsDown.has(btn);
    }

    /**
     * Shows if the provided button was released
     * between previous and current frames
     * @returns {boolean}
     */
    static getButtonUp(btn) {
        return buttonsUp.has(btn);
    }

    /**
     * Shows if the provided button is currently pressed
     * @returns {boolean}
     */
    static getButton(btn) {
        return buttonsPressed.has(btn);
    }

    /**
     * Shows if the state of provided button has changed
     * between previous and current frames.
     * @returns {boolean}
     */
    static getButtonChanged(btn) {
        return buttonsChanged.has(btn);
    }
}