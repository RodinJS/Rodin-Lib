import {ErrorProtectedClassInstance} from '../error';
import {messenger} from '../messenger';

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

    static delta() {
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

messenger.post('requestactivescene', {});

messenger.on('activescene', (scene) => {
    if(!instances[scene]) {
        instances[scene] = new Time();
    }
});

messenger.on('renderstart', () => {
    Time.tick();
    Time.currentFrameTimestamp = Time.now();
});
