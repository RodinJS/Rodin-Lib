import {Time} from '../time';

export class RodinEvent {
    //TODO: we also need key value in params, for example for touch event on vive controller we need coordinates as well.
    /**
     * Event Class
     * @param {Sculpt} target
     * @param {Object} params
     * @param {Event} params.domEvent
     * @param {string} params.type
     * @param {number} params.button
     * @param {string} params.hand
     * @param {GamePad} params.controller
     * @constructor
     */
    constructor (target, params) {
        //todo: JOI
        //todo: maybe just assign all the params to this? @Gor
        params = Object.assign({type: 'event', domEvent: null, button: null, hand: '', gamepad: null}, params);

        this.target = target;
        this.domEvent = params.domEvent;
        this.button = params.button;

        if(this.button) {
            this.keyCode = this.button.keyCode;
        }

        this.hand = params.hand;
        this.gamepad = params.gamepad;
        this.type = params.type;

        this.timestamp = Time.now;
        this.realTimestamp = Date.now();
        this.propagation = true;
    }

    stopPropagation() {
        this.propagation = false;
    }
}