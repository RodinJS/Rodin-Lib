import {EventEmitter} from '../eventEmitter';
import {messenger} from '../messenger';
import * as CONST from '../constants';
import {Sculpt} from '../sculpt';
import {Set} from '../set';
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
    buttonsChanged = new Set();
    buttonsDown = new Set();
    buttonsUp = new Set();
});

/**
 * General GamePad class, custom controllers extend this class.
 * @param {string} [navigatorGamePadId] - custom ID for the gamepad instance.
 * @param {string} [hand] - gamepad holding hand (left/right).
 * @param {string} [type] - VR or non-VR
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

        //todo: Why we need this ?
        //todo: Because user may want to raycast on object or 3 in one line. The number of objects that can be reycasted by the same ray.
        this.raycastLayers = Infinity;

        /**
         * Objects currently intersected by this gamepad.
         * @type {Set}
         */
        this.intersected = new Set();
        /**
         * Raycaster object used to pick/select items with current controller.
         * @type {Raycaster}
         */
        this.raycaster = new Raycaster();
        /**
         * Buttons array from current navigatorGamePad.
         * @type {Array}
         */
        this.buttons = [];
        /**
         * The gamePad mesh model in the scene.
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
                // Scene.active.add(this.sculpt);
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

        if(this.type === CONST.BOTH || this.type === CONST.NON_VR) {
            this.enable();
        }

        window.addEventListener('vrdisplaypresentchange', () => {
            if(this.type === CONST.BOTH) return;
            let re = new RegExp(this.navigatorGamePadId, 'gi');

            const hmd = Scene.webVRmanager.hmd;

            if (hmd) {
                if(hmd.isPresenting && this.type === CONST.VR && re.test(hmd.displayName) || !hmd.isPresenting && this.type === CONST.NON_VR) {
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
     * get controller from navigator
     * @param {string} id
     * @param {string} hand
     * @returns {Object} controller or null
     */
    static getControllerFromNavigator(id, hand = null) {
        let controllers = [navigator.mouseGamePad, navigator.cardboardGamePad];
        try {
            controllers = controllers.concat(navigator.getGamepads());
        } catch (ex) {
        }

        for (let i = 0; i < controllers.length; i++) {
            let controller = controllers[i];
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
            if(!this.buttons[i]) continue;

            if (this.buttons[i].pressed !== buttonsToCheck[i].pressed) {
                this.buttons[i].pressed = buttonsToCheck[i].pressed;
                this.buttons[i].pressed ? this.buttonDown(this.buttons[i]) : this.buttonUp(this.buttons[i]);
                this.buttons[i].pressed ? buttonDownDetected = true : buttonUpDetected = true;

                buttonsPressed.push(this.buttons[i]);
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
     * Checks all intersect and emits hover and hoverOut events.
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
        if(hoveredOutSculpts.length > 0) {
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
     * Update controller object in scene, update position and rotation.
     */
    updateObject() {
        let pose = this.navigatorGamePad.pose;

        if(!pose) return;

        // todo: check this logic
        if (pose.position !== null) this.sculpt.position.fromArray(pose.position);
        if (pose.orientation !== null) this.sculpt.quaternion.fromArray(pose.orientation);
        this.sculpt.matrix.compose(this.sculpt._threeObject.position, this.sculpt.quaternion, this.sculpt.scale);
        this.sculpt.matrix = this.sculpt.matrix.multiplyMatrices(this.standingMatrix, this.sculpt._threeObject.matrix);
        this.sculpt._threeObject.matrixWorldNeedsUpdate = true;
    }

    emitAll(e, objects, eventName, DOMEvent, button) {
        if (e !== enforce) {
            // todo: change this
            throw new Error();
        }

        if (objects.length === 0)
            return;

        let currentEvent = new RodinEvent(objects[0].sculpt, {domEvent: DOMEvent, button: button, gamepad: this});;
        let i = 0;
        do {
            currentEvent.target = objects[i].sculpt;
            currentEvent.distance = objects[i].distance;
            currentEvent.uv = objects[i].uv;
            objects[i].sculpt.emit(eventName, currentEvent);
            i++;
        } while (currentEvent.propagation && i < objects.length);
    }

    emitIntersected(e, eventName, DOMEvent, button) {
        this.emitAll(e, this.intersected, eventName, DOMEvent, button)
    }

    /**
     * The keyDown function emitter.
     * @param {object} button
     */
    buttonDown(button) {
        buttonsDown.push(button);
        buttonsPressed.push(button);
        this.emitIntersected(enforce, CONST.GAMEPAD_BUTTON_DOWN, null, button, this);
    }

    /**
     * The keyUp function emitter.
     * @param {object} button
     */
    buttonUp(button) {
        buttonsUp.push(button);
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
        buttonsChanged.push(button);
        this.emitIntersected(enforce, CONST.GAMEPAD_BUTTON_CHANGE, null, button, this);
    }

    /**
     * Tells if the provided button is down or not.
     * @returns {boolrean}
     */
    static getButtonDown(btn) {
        return buttonsDown.indexOf(btn) !== -1;
    }

    /**
     * Tells if the provided button is up or not.
     * @returns {boolrean}
     */
    static getButtonUp(btn) {
        return buttonsUp.indexOf(btn) !== -1;
    }

    /**
     * Tells if the provided button is pressed or not.
     * @returns {boolrean}
     */
    static getButton(btn) {
        return buttonsPressed.indexOf(btn) !== -1;
    }

    /**
     * Tells if the provided button value is changed or not.
     * @returns {boolrean}
     */
    static getButtonChanged(btn) {
        return buttonsChanged.indexOf(btn) !== -1;
    }
}