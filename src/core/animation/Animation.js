import {TWEEN} from '../tween/Tween';
import {RodinEvent} from '../rodinEvent';
import * as CONST from '../constants';
import {ErrorProtectedMethodCall} from '../error';
import {Sculpt} from '../sculpt/Sculpt';

import {object} from '../utils';

function enforce () {
}
//TODO: Gor jan, mi hat nkaragri inch parametra astanum u inchi hamar

/**
 * Animation Class, used to create animations on Sculpt objects
 * @param {!String} name
 * @param {Object} params
 */
export class Animation {
    constructor (name, params) {
        this._loop = false;
        /**
         * The host Sculpt object.
         * @type {Sculpt}
         */
        this.sculpt = {};

        /**
         * Animation parameters.
         * @type {Object}
         */
        this.params = Object.clone(params);

        /**
         * Animation name.
         * @type {string}
         */
        this.name = name;
        this._duration = 2000;
        this._delay = 0;
        this._easing = TWEEN.Easing.Linear.None;

        /**
         * Shows the current state of animation.
         * @type {boolean}
         */
        this.playing = false;
    }


    /**
     * Get a cloned animation object
     * @returns {Animation}
     */
    copy () {
        let newAnimation = new Animation(this.name, this.params);
        return newAnimation.duration(this.duration()).easing(this.easing()).delay(this.delay()).loop(this.loop());
    }


    /**
     * Start animation
     * @param {boolean} [forceStart] - stops this animation (if currently playing) and starts again
     * @returns {boolean}
     */
    start (forceStart = false) {
        if (!this.sculpt instanceof Sculpt) {
            return console.warn('animation cannot be played without adding in object');
        }

        if (this.isPlaying()) {
            if (forceStart) {
                this.stop();
                this.start();
                return true;
            } else {
                return false;
            }
        }

        let normalizedParams = Animation.normalizeParams(enforce, this.params, this.sculpt._threeObject);
        let startValues = normalizedParams.from;
        let endValues = normalizedParams.to;

        this.playing = true;
        this.initialProps = Object.clone(startValues);
        let _this = this;
        this.tween = new TWEEN.Tween(startValues)
            .to(endValues, this._duration)
            .delay(this._delay)
            .onStart(function () {
                let evt = new RodinEvent(_this.sculpt);
                evt.animation = _this.name;
                _this.sculpt.emit(CONST.ANIMATION_START, evt);
            })
            .onUpdate(function () {
                for (let i in this) {
                    Object.setProperty(_this.sculpt._threeObject, i, this[i]);
                }
            })
            .easing(this._easing)
            .start()
            .onComplete(function () {
                if (_this._loop) {
                    _this.playing = false;
                    _this.reset();
                    _this.start();
                } else {
                    _this.playing = false;
                    delete this.tween;
                }

                let evt = new RodinEvent(_this.sculpt);
                evt.animation = _this.name;
                _this.sculpt.emit(CONST.ANIMATION_COMPLETE, evt);
            });
    }

    /**
     * Play animation
     * @param {boolean} [forceStart] - stops this animation (if currently playing) and starts again
     * @returns {boolean}
     */
    play (forceStart = false) {
        return this.start(forceStart);
    }

    /**
     * Stop animation
     * @param {boolean} [reset] - run reset() method after stopping the animation.
     * @returns {boolean} - success
     */
    stop (reset = true) {
        if (this.isPlaying()) {
            this.tween.stop();
            delete this.tween;
            this.playing = false;

            if (reset) {
                this.reset();
            }

            let evt = new RodinEvent(this.sculpt);
            evt.animation = this.name;
            this.sculpt.emit(CONST.ANIMATION_STOP, evt);
            return true;
        }

        return false;
    }

    /**
     * Reset all to initial values.
     * <p>This function reverts all affected values to "before animation" state</p>
     */
    reset () {
        for (let i in this.initialProps) {
            Object.setProperty(this.sculpt._threeObject, i, this.initialProps[i]);
        }
    }

    /**
     * Check animation playing status
     * @returns {boolean}
     */
    isPlaying () {
        return this.playing;
    }

    /**
     * set/get loop
     * <p>Sets loop value if provided as param, otherwise returns current loop value</p>
     * @param [loop]
     * @returns {Animation}
     */
    loop (loop = null) {
        if (loop === null) {
            return this._loop;
        }

        this._loop = loop;
        return this;
    }

    /**
     * set/get duration
     * <p>Sets duration value if provided as param, otherwise returns current duration value</p>
     * @param {number} [duration]
     * @returns {Animation}
     */
    duration (duration = null) {
        if (duration === null) {
            return this._duration;
        }

        this._duration = duration;
        return this;
    }

    /**
     * set/get delay.
     * <p>Sets delay value if provided as param, otherwise returns current delay value</p>
     * @param {number} [delay]
     * @returns {Animation}
     */
    delay (delay = null) {
        if (delay === null) {
            return this._delay;
        }
        this._delay = delay;
        return this;
    }

    /**
     * set/get easing.
     * <p>Sets easing value if provided as param, otherwise returns current easing value</p>
     * @param {TWEEN.Easing} [easing]
     * @returns {Animation}
     */
    easing (easing = null) {
        if (easing === null) {
            return this._easing;
        }

        this._easing = easing;
        return this;
    }


    /**
     * Set sculpt object for this animation to play on.
     * @param {!Sculpt}  sculpt
     * @returns {Animation}
     */
    setSculpt (sculpt) {
        this.initialProps = {};
        this.sculpt = sculpt;
        return this;
    }

    /**
     * Converts animation parameters to normalized
     * <p>parameters containing {from: , to: }</p>
     * @param {Function} e enforce
     * @param {Object} params
     * @param {Sculpt} obj
     * @returns {Object} normalized params
     */
    static normalizeParams (e, params, obj) {
        if (e !== enforce) {
            throw new ErrorProtectedMethodCall('normalizeParams');
        }

        let _params = Object.joinParams(params, ['from', 'to']);
        let res = { from: {}, to: {} };
        for (let i in _params) {
            if (_params[i].hasOwnProperty('from')) {
                res.from[i] = _params[i].from;
                res.to[i] = _params[i].to;
            }
            else {
                res.from[i] = Object.getProperty(obj, i);
                res.to[i] = _params[i];
            }
        }
        return res;
    }
}
