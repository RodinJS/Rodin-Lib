import {Time} from '../time';

export class RodinEvent {
    //TODO: we also need key value in params, for examplefor touch event on vive controller we need coordinates as well.
    /**
     * Event Class
     * @param {Sculpt} target
     * @param {Object} params
     * @param {Event} params.domEvent
     * @param {string} params.type
     * @param {number} params.keyCode
     * @param {string} params.hand
     * @param {GamePad} params.controller
     * @constructor
     */
    constructor (target, params) {
        //todo: JOI
        params = Object.assign({type: 'event', domEvent: null, keyCode: null, hand: '', controller: null}, params);

        this.target = target;
        this.domEvent = params.domEvent;
        this.keyCode = params.keyCode;
        this.hand = params.hand;
        this.controller = params.controller;
        this.type = params.type;

        this.keys = [];

        this.timestamp = Time.now;
        this.realTimestamp = Date.now();
        this.propagation = true;
    }


    //TODO: not clear what this function does. getKey is not the best name for this function, maybe hasKey or byKey ???
    /**
     * getKey function.
     * @param keyCode {number}
     * @returns {boolean} true if controller key is pressed, false otherwise
     */
    getKey(keyCode) {
        return this.keys.indexOf(keyCode) !== -1
    }

    stopPropagation() {
        this.propagation = false;
    }
}