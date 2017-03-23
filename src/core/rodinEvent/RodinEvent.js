import {Time} from '../time';

export class RodinEvent {
    /**
     * Event Class
     * @param {Sculpt} target
     * @param {Object} [params]
     * @param {Event} params.domEvent
     * @param {string} params.type
     * @param {number} params.button
     * @param {string} params.hand
     * @param {GamePad} params.controller
     * @constructor
     */
    constructor (target, params) {
        //todo: JOI
        //todo: maybe just assign all the params to this?
        params = Object.assign({type: 'event', domEvent: null, button: null, hand: '', gamepad: null}, params);

        /**
         * The scene object, this event is targeted to.
         * @type {Sculpt}
         */
        this.target = target;

        /**
         * The HTML Dom Event.
         * @type {Event}
         */
        this.domEvent = params.domEvent;

        /**
         * The number ID of the button that has triggered this event.
         * @type {number}
         */
        this.button = params.button;

        if(this.button) {
            this.keyCode = this.button.keyCode;
        }

        /**
         * The hand of the gamepad.
         * @type {string}
         */
        this.hand = params.hand;

        /**
         * The GamePad object, triggering this event.
         * @type {GamePad}
         */
        this.gamepad = params.gamepad;

        /**
         * Event type, refer to core/constants/events.js
         * @type {string}
         */
        this.type = params.type;

        /**
         * Event timestamp in Rodin Time
         * @type {number}
         */
        this.timestamp = Time.now;

        /**
         * Event Timestamp, original
         * @type {number}
         */
        this.realTimestamp = Date.now();

        /**
         * Allow or stop the propagation of this event to the underlying layers of intersections, if any.
         * @type {boolean}
         */
        this.propagation = true;
    }

    /**
     * Stops the propagation of this event to the underlying layers of intersections, if any.
     * @type {boolean}
     */
    stopPropagation() {
        this.propagation = false;
    }
}