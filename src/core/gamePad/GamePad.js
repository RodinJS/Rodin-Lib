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

messenger.on(CONST.RENDER_START, () => {
    buttonsDown = new Set();
    buttonsUp = new Set();
});

export class GamePad extends EventEmitter {
    constructor(navigatorGamePadId = "", hand = null, type = CONST.BOTH) {
        super();

        this.type = type;

        this._enabled = false;

        this.navigatorGamePadId = navigatorGamePadId;
        this.hand = hand;
        this.navigatorGamePad = null;

        //todo: Why we need this ?
        this.raycastLayers = Infinity;
        this.intersected = new Set();

        this.raycaster = new Raycaster();

        // todo: use button pressed and touched methods
        this.buttons = [];

        // todo: replace with sculpt
        this.sculpt = new Sculpt();

        this.standingMatrix = new THREE.Matrix4().identity();

        this.sculpt.on(CONST.READY, () => {
            // todo: fix this later
            this.sculpt._threeObject.matrixAutoUpdate = false;
            messenger.post(CONST.REQUEST_ACTIVE_SCENE);

            messenger.on(CONST.ACTIVE_SCENE, () => {
                Scene.active.add(this.sculpt);
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
            if (hmd && re.test(hmd.displayName)) {
                hmd.isPresenting ? this.enable() : this.disable();
                if(hmd.isPresenting && this.type === CONST.VR || !hmd.isPresenting && this.type === CONST.NON_VR) {
                    this.enable();
                } else {
                    this.disable();
                }
            }
        });
    }

    enable() {
        this._enabled = true;
    }

    disable() {
        this._enabled = false;
    }

    static getControllerFromNavigator(id, hand) {
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

    update() {
        this.navigatorGamePad = GamePad.getControllerFromNavigator(this.navigatorGamePadId, this.hand);

        if (!this.navigatorGamePad) {
            return;
        }

        this.intersectObjects();

        let buttonDownDetected = false;
        let valueChangeDetected = false;
        let buttonUpDetected = false;

        for (let i = 0; i < this.navigatorGamePad.buttons.length; i++) {
            if(!this.buttons[i]) continue;

            if (this.buttons[i].pressed !== this.navigatorGamePad.buttons[i].pressed) {
                this.buttons[i].pressed = this.navigatorGamePad.buttons[i].pressed;
                this.buttons[i].pressed ? this.buttonDown(this.buttons[i]) : this.buttonUp(this.buttons[i]);
                this.buttons[i].pressed ? buttonDownDetected = true : buttonUpDetected = true;

                buttonsPressed.push(this.buttons[i]);
            }

            if (this.buttons[i].value !== this.navigatorGamePad.buttons[i].value) {
                this.valueChange(this.buttons[i]);
                this.buttons[i].value = this.navigatorGamePad.buttons[i].value;
                valueChangeDetected = true;
            }

            if (this.buttons[i].touched !== this.navigatorGamePad.buttons[i].touched) {
                this.buttons[i].touched = this.navigatorGamePad.buttons[i].touched;
                this.buttons[i].touched ? this.touchStart(this.buttons[i]) : this.touchEnd(this.buttons[i]);
            }
        }

        buttonDownDetected && this.emit(CONST.GAMEPAD_BUTTON_DOWN, new RodinEvent(this));
        valueChangeDetected && this.emit(CONST.GAMEPAD_BUTTON_CHANGE, new RodinEvent(this));
        buttonUpDetected && this.emit(CONST.GAMEPAD_BUTTON_UP, new RodinEvent(this));

    }

    intersectObjects() {
        if (!this.getIntersections) {
            // todo: return all sculpts that are visible for controllers
            return [];
        }

        let intersections = this.getIntersections();

        // todo: why we need this ?
        // if (intersections.length > 0) {
        //     if (intersections.length > this.raycastLayers) {
        //         intersections.splice(this.raycastLayers, (intersections.length - this.raycastLayers));
        //     }
        // }

        let hoveredOutSculpts = intersections.filter(intersect => {
            for (let i = 0; i < this.intersected.length; i++) {
                if (this.intersected[i].sculpt === intersect.sculpt) {
                    return false;
                }
            }

            return true;
        });

        this.emitAll(enforce, hoveredOutSculpts, CONST.GAMEPAD_HOVER, null);
        if (hoveredOutSculpts.length > 0) {
            this.emit(CONST.GAMEPAD_HOVER_OUT, new RodinEvent(this));
        }

        let hoveredSculpts = this.intersected.filter(intersect => {
            for (let i = 0; i < intersections.length; i++) {
                if (intersections[i].sculpt === intersect.sculpt) {
                    return false;
                }
            }

            return true;
        });

        this.emitAll(enforce, hoveredSculpts, CONST.GAMEPAD_HOVER_OUT, null);
        if(hoveredSculpts.length > 0) {
            this.emit(CONST.GAMEPAD_HOVER, new RodinEvent(this));
        }

        this.intersected = [...intersections];
    }

    updateObject() {
        let pose = this.navigatorGamePad.pose;

        if(!pose) return;

        // todo: check this logic
        if (pose.position !== null) this.sculpt.position.fromArray(pose.position);
        if (pose.orientation !== null) this.sculpt.quaternion.fromArray(pose.orientation);
        this.sculpt.matrix.compose(this.sculpt._threeObject.position, this.sculpt.quaternion, this.sculpt.scale);
        this.sculpt.matrix.multiplyMatrices(this.standingMatrix, this.sculpt._threeObject.matrix);
        this.sculpt._threeObject.matrixWorldNeedsUpdate = true;
    }

    emitAll(e, objects, eventName, DOMEvent, button) {
        if (e !== enforce) {
            // todo: change this
            throw new Error();
        }

        if (objects.length === 0)
            return;

        let currentEvent = null;
        let i = 0;
        do {
            currentEvent = new RodinEvent(objects[i].sculpt, {domEvent: DOMEvent, button: button, controller: this});
            currentEvent.distance = objects[i].distance;
            currentEvent.uv = objects[i].uv;
            objects[i].sculpt.emit(eventName, currentEvent);
            i ++;
        } while (currentEvent.propagation === true && i < objects.length);
    }

    emitIntersected(e, eventName, DOMEvent, button) {
        this.emitAll(e, this.intersected, eventName, DOMEvent, button)
    }

    buttonDown(button) {
        buttonsDown.push(button);
        buttonsPressed.push(button);
        this.emitIntersected(enforce, CONST.GAMEPAD_BUTTON_DOWN, null, button, this);
    }

    buttonUp(button) {
        buttonsUp.push(button);
        this.emitIntersected(enforce, CONST.GAMEPAD_BUTTON_UP, null, button, this);
    }

    // todo: implement this feature when firefox api or serghov will send data about touch
    touchStart() {

    }

    touchEnd() {

    }

    valueChange(button) {
        this.emitIntersected(enforce, CONST.GAMEPAD_BUTTON_CHANGE, null, button, this);
    }

    static getButtonDown(btn) {
        return buttonsDown.indexOf(btn) !== -1;
    }

    static getButtonUp(btn) {
        return buttonsUp.indexOf(btn) !== -1;
    }

    static getButton(btn) {
        return buttonsPressed.indexOf(btn) !== -1;
    }
}