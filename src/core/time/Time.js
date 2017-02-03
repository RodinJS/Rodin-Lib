import {ErrorSingletonClass, ErrorInvalidArgument, ErrorProtectedFieldChange} from '../error';

let instance = null;
let enforce = function () {
};

/**
 * Time class
 */
export class Time {
    constructor (e) {
        if (e !== enforce) {
            throw new ErrorSingletonClass();
        }

        let speed = 1;
        this.setSpeed = value => {
            if (isNaN(value) || value < 0) {
                throw new ErrorInvalidArgument('number');
            }

            this.msBeforeLastSpeedChange = this.now();
            this.lastSpeedChange = Date.now();
            speed = value;
        };

        this.getSpeed = () => {
            return speed;
        };

        let delta = 0;
        this.setDelta = (value, e) => {
            if(e !== enforce) {
                throw new ErrorProtectedFieldChange('delta');
            }

            delta = value;
        };

        /**
         * @returns {number} - time between last two teaks
         */
        this.deltaTime = () => {
            return delta;
        };

        this.lastTeak = 0;
        this.msBeforeLastSpeedChange = 0;
        this.lastSpeedChange = Date.now();
        this.startTime = Date.now();
    }

    /**
     * @param {number} value - new speed
     */
    set speed (value) {
        this.setSpeed(value);
    }

    /**
     * @returns {number} - current speed
     */
    get speed () {
        return this.getSpeed();
    }

    /**
     * call this function on each render
     */
    tick () {
        this.setDelta(this.now() - this.lastTeak, enforce);
        this.lastTeak = this.now();
    }

    /**
     * @returns {number} - milliseconds with speeds
     */
    now () {
        return (Date.now() - this.lastSpeedChange) * this.speed + this.msBeforeLastSpeedChange;
    }

    static getInstance () {
        if (!instance) {
            instance = new Time(enforce);
        }

        return instance;
    }
}
