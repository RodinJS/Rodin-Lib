import {ErrorProtectedClassInstance} from '../error';
import {messenger} from '../messenger';
import * as CONSTANTS from '../constants';


let instance = null;
let enforce = function () {
};

let activeTime = null;
let instances = {};

/**
 * Time class
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

    static tick() {
        activeTime.tick();
    }

    static get now() {
        return activeTime.now();
    }

    static get delta() {
        return activeTime.delta
    }

    static set speed(value) {
        activeTime.speed = value;
        return value;
    }

    static get speed() {
        return activeTime.speed;
    }

    static set currentFrameTimestamp(timestamp) {
        return activeTime.currentFrameTimestamp = timestamp;
    }

    static get currentFrameTimestamp() {
        return activeTime.currentFrameTimestamp;
    }
}

messenger.post(CONSTANTS.REQUEST_ACTIVE_SCENE, {});

messenger.on(CONSTANTS.ACTIVE_SCENE, (scene) => {
    if(!instances[scene.name]) {
        instances[scene.name] = new Time(enforce);
    }

    activeTime = instances[scene.name];
});

messenger.on(CONSTANTS.RENDER_START, () => {
    Time.tick();
    Time.currentFrameTimestamp = Time.now;
});
