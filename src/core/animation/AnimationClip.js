import {TWEEN} from './tween';
import {RodinEvent} from '../rodinEvent';
import * as CONST from '../constants';
import {ErrorProtectedMethodCall} from '../error';
import {Sculpt} from '../sculpt/Sculpt';

import {object} from '../utils';
function enforce () {
}
//TODO: Gor jan, mi hat nkaragri inch parametra astanum u inchi hamar

/**
 * AnimationClip Class, used to create animations on Sculpt objects
 * @param {!String} name
 * @param {Object} params
 */
export class AnimationClip {
    constructor (name, params) {
        this._loop = false;
        /**
         * The host Sculpt object.
         * @type {Sculpt}
         */
        this.sculpt = {};

        /**
         * AnimationClip parameters.
         * @type {Object}
         */
        this.params = object.clone(params);

        /**
         * AnimationClip name.
         * @type {string}
         */
        this.name = name;
        this._duration = 2000;
        this._delay = 0;
        this._easing = TWEEN.Easing.Linear.None;

        /**
         * Shows the current state of AnimationClip.
         * @type {boolean}
         */
        this.playing = false;
    }


    /**
     * Get a cloned AnimationClip object
     * @returns {AnimationClip}
     */
    copy () {
        let newAnimation = new AnimationClip(this.name, this.params);
        return newAnimation.duration(this.duration()).easing(this.easing()).delay(this.delay()).loop(this.loop());
    }


    /**
     * Start AnimationClip
     * @param {boolean} [forceStart] - stops this AnimationClip (if currently playing) and starts again
     * @returns {boolean}
     */
    start (forceStart = false) {
        if (!this.sculpt instanceof Sculpt) {
            return console.warn('AnimationClip cannot be played without adding in object');
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

        let normalizedParams = AnimationClip.normalizeParams(enforce, this.params, this.sculpt._threeObject);
        let startValues = normalizedParams.from;
        let endValues = normalizedParams.to;

        this.playing = true;
        this.initialProps = object.clone(startValues);
        let _this = this;
        this.tween = new TWEEN.Tween(startValues)
            .to(endValues, this._duration)
            .delay(this._delay)
            .onStart(function () {
                let evt = new RodinEvent(_this.sculpt);
                evt.AnimationClip = _this.name;
                _this.sculpt.emit(CONST.ANIMATION_START, evt);
            })
            .onUpdate(function () {
                for (let i in this) {
                    object.setProperty(_this.sculpt._threeObject, i, this[i]);
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
                evt.AnimationClip = _this.name;
                _this.sculpt.emit(CONST.ANIMATION_COMPLETE, evt);
            });
    }

    /**
     * Play AnimationClip
     * @param {boolean} [forceStart] - stops this AnimationClip (if currently playing) and starts again
     * @returns {boolean}
     */
    play (forceStart = false) {
        return this.start(forceStart);
    }

    /**
     * Stop AnimationClip
     * @param {boolean} [reset] - run reset() method after stopping the AnimationClip.
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
            evt.AnimationClip = this.name;
            this.sculpt.emit(CONST.ANIMATION_STOP, evt);
            return true;
        }

        return false;
    }

    /**
     * Reset all to initial values.
     * <p>This function reverts all affected values to "before AnimationClip" state</p>
     */
    reset () {
        for (let i in this.initialProps) {
            object.setProperty(this.sculpt._threeObject, i, this.initialProps[i]);
        }
    }

    /**
     * Check AnimationClip playing status
     * @returns {boolean}
     */
    isPlaying () {
        return this.playing;
    }

    /**
     * set/get loop
     * <p>Sets loop value if provided as param, otherwise returns current loop value</p>
     * @param [loop]
     * @returns {AnimationClip}
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
     * @returns {AnimationClip}
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
     * @returns {AnimationClip}
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
     * @returns {AnimationClip}
     */
    easing (easing = null) {
        if (easing === null) {
            return this._easing;
        }

        this._easing = easing;
        return this;
    }


    /**
     * Set sculpt object for this AnimationClip to play on.
     * @param {!Sculpt}  sculpt
     * @returns {AnimationClip}
     */
    setSculpt (sculpt) {
        this.initialProps = {};
        this.sculpt = sculpt;
        return this;
    }

    /**
     * Converts AnimationClip parameters to normalized
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

        let _params = object.joinParams(params, ['from', 'to']);
        let res = { from: {}, to: {} };
        for (let i in _params) {
            if(!_params.hasOwnProperty(i))
                continue;

            if (_params[i].hasOwnProperty('from')) {
                res.from[i] = _params[i].from;
                res.to[i] = _params[i].to;
            }
            else {
                res.from[i] = object.getProperty(obj, i);
                res.to[i] = _params[i];
            }
        }
        return res;
    }
}