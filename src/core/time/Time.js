import {ErrorProtectedClassInstance, ErrorProtectedMethodCall} from '../error';
import {messenger} from '../messenger';
import * as CONSTANTS from '../constants';
import * as utils from '../utils';


let instance = null;
let enforce = function () {
};

let activeTime = null;
let instances = {};

/**
 * Time
 * Manages Time in scenes. There is a Time instance for each scene.
 * You can only access the active scene time using static methods
 */
export class Time {
    constructor (e) {
        if(e !== enforce) {
            throw new ErrorProtectedClassInstance('Time');
        }

        this._speed = 1;
        this.delta = 0;

        this.lastTeak = 0;
        this.msBeforeLastSpeedChange = 0;
        this.lastSpeedChange = Date.now();
        this.startTime = Date.now();
        this.currentFrameTimestamp = 0;
    }

    /**
     * Call this function on each render. It resets the this.delta value
     */
    tick () {
        this.delta = this.now - this.lastTeak;
        this.lastTeak = this.now;
    }

    /**
     * @returns {number} - milliseconds with speeds
     */
    get now() {
        return (Date.now() - this.lastSpeedChange) * this.speed + this.msBeforeLastSpeedChange;
    }

    /**
     * @return {number}
     */
    get speed () {
        return this._speed;
    }

    /**
     * @param value {number}
     */
    set speed (value) {
        this.msBeforeLastSpeedChange = this.now;
        this._speed = value;
        this.lastSpeedChange = Date.now();
    }

    /**
     * This method will change delta and lastTeak parameters.
     * @private
     */
    static tick(e) {
        if(e !== enforce) {
            throw new ErrorProtectedMethodCall('tick');
        }
        activeTime.tick();
    }

    /**
     * Active scene current time in milliseconds.
     * @type {number}
     */
    static get now() {
        return activeTime.now;
    }

    /**
     * Milliseconds between current frame and last frame.
     * @type {number}
     */
    static get delta() {
        return activeTime.delta
    }

    /**
     * Change active scene time speed
     * @type {number}
     */
    static set speed(value) {
        activeTime.speed = value;
        return value;
    }

    /**
     * Get active scene time speed
     * @type {number}
     */
    static get speed() {
        return activeTime.speed;
    }

    /**
     * Set current frame timestamp.
     * @param {function} e Enforce function
     * @param timestamp {number} current frame render timestamp.
     * @private
     */
    static setCurrentFrameTimestamp(e, timestamp) {
        if(e !== enforce) {
            throw new ErrorProtectedMethodCall('setCurrentFrameTimestamp');
        }

        activeTime.currentFrameTimestamp = timestamp;
    }

    /**
     * Get current frame render timestamp.
     * @type {number}
     */
    static get currentFrameTimestamp() {
        return activeTime.currentFrameTimestamp;
    }
}

activeTime = new Time(enforce);

messenger.post(CONSTANTS.REQUEST_ACTIVE_SCENE, {});

messenger.on(CONSTANTS.ACTIVE_SCENE, (scene) => {
    const sceneId = utils.object.getId(scene);
    if(!instances[sceneId]) {
        instances[sceneId] = new Time(enforce);
    }

    activeTime = instances[sceneId];
});

messenger.on(CONSTANTS.RENDER_START, () => {
    Time.tick(enforce);
    Time.setCurrentFrameTimestamp(enforce, Time.now);
});
