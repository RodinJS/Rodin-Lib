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
 * Manage Time in scenes. There are one Time instance for each scene.
 * You can only access to active scene time using static methods
 */
export class Time {
    constructor (e) {
        if(e !== enforce) {
            throw new ErrorProtectedClassInstance('Time');
        }

        this.speed = 1;
        this.delta = 0;

        this.lastTeak = 0;
        this.msBeforeLastSpeedChange = 0;
        this.lastSpeedChange = Date.now();
        this.startTime = Date.now();
        this.currentFrameTimestamp = 0;
    }

    /**
     * call this function on each render
     */
    tick () {
        this.delta = this.now() - this.lastTeak;
        this.lastTeak = this.now();
    }

    /**
     * @returns {number} - milliseconds with speeds
     */
    now () {
        return (Date.now() - this.lastSpeedChange) * this.speed + this.msBeforeLastSpeedChange;
    }

    /**
     * This method will change delta and lastTeak parameters.
     * Not available for user
     */
    static tick(e) {
        if(e !== enforce) {
            throw new ErrorProtectedMethodCall('tick');
        }
        activeTime.tick();
    }

    /**
     * Active scene current time in milliseconds.
     * @returns {number}
     */
    static get now() {
        return activeTime.now();
    }

    /**
     * Milliseconds between current frame and last frame.
     * @returns {number}
     */
    static get delta() {
        return activeTime.delta
    }

    /**
     * Change active scene time speed
     */
    static set speed(value) {
        activeTime.speed = value;
        return value;
    }

    /**
     * Get active scene time speed
     */
    static get speed() {
        return activeTime.speed;
    }

    /**
     * Set current frame timestamp.
     * Not available for user
     * @param {function} e Enforce function
     * @param {number} timestamp current frame render timestamp.
     */
    static setCurrentFrameTimestamp(e, timestamp) {
        if(e !== enforce) {
            throw new ErrorProtectedMethodCall('setCurrentFrameTimestamp');
        }

        activeTime.currentFrameTimestamp = timestamp;
    }

    /**
     * Get current frame render timestamp.
     * @returns {number}
     */
    static get currentFrameTimestamp() {
        return activeTime.currentFrameTimestamp;
    }
}

messenger.post(CONSTANTS.REQUEST_ACTIVE_SCENE, {});

messenger.on(CONSTANTS.ACTIVE_SCENE, (scene) => {
    const sceneId = utils.object.getObjectId(scene);
    if(!instances[sceneId]) {
        instances[sceneId] = new Time(enforce);
    }

    activeTime = instances[sceneId];
});

messenger.on(CONSTANTS.RENDER_START, () => {
    Time.tick(enforce);
    Time.setCurrentFrameTimestamp(enforce, Time.now);
});
