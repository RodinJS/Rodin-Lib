import {AnimationClip} from './AnimationClip';
import {SculptPlugin} from '../plugin';
import {Set} from '../set';
import * as CONST from '../constants';
import {object} from '../utils';

/**
 * Class Animation
 * Each Sculpt object have its own Animation.
 * @param {!Sculpt} sculpt - Sculpt object
 */
export class Animation {
    constructor(sculpt = null) {

        /**
         * The host Sculpt object.
         * @type {Sculpt}
         */
        this.sculpt = sculpt;

        /**
         * Set of clips (animations) to be played.
         * @type {Set.<Animation>}
         */
        this.clips = new Set();
    }

    /**
     * Get clip by name or index
     * @param {!*} key
     * @returns {Animation}
     */
    getClip(key) {
        if (Number.isInteger(key)) {
            return this.clips[key];
        }

        for (let i = 0; i < this.clips.length; i++) {
            if (this.clips[i].name === key) {
                return this.clips[i];
            }
        }

        return null;
    }

    /**
     * Add new animation clip to Animation
     * @param {...Animation}
     * @returns {Animation}
     */
    add() {
        for (let i = 0; i < arguments.length; i++) {
            let animation = arguments[i];

            if (animation instanceof AnimationClip) {
                this.clips.push(animation.copy().setSculpt(this.sculpt));
            }
        }
    }

    /**
     * Remove animations from Animation
     * @params {...string}
     */
    remove() {
        for (let i = 0; i < arguments.length; i++) {
            const animation = this.getClip(arguments[i]);
            if (!animation) {
                throw new Error(`AnimationClip with name ${arguments[i]} does not exist`);
            }

            this.clips.splice(this.clips.indexOf(animation), 1);
        }
    }

    /**
     * Get all current clips
     * @returns {Set.<Animation>}
     */
    getClips() {
        return this.clips;
    }

    /**
     * Check if Animation is busy
     * @param {*} [key] -  check the state for a specific animation/clip
     * @returns {boolean}
     */
    isPlaying(key = null) {
        if (key === null) {
            for (let i = 0; i < this.clips.length; i++) {
                if (this.clips[i].isPlaying()) {
                    return true;
                }
            }

            return false;
        }

        return this.getClip(key).isPlaying();
    }

    /**
     * Start animation by name or id
     * @param {!*} key - Animation name or id
     * @param {boolean} [forceStart] - kills this animation (if currently playing) and starts again
     * @returns {boolean}
     */
    start(key, forceStart = false) {
        let clip = this.getClip(key);

        if (!clip) {
            return false;
        }

        clip.play(0);
    }

    /**
     * Stop animation by name or id
     * @param {!*} key - Animation name or id
     * @param {boolean} [reset] - run animation.reset() method after stopping the animation.
     * @returns {boolean} - success
     */
    stop(key, reset = true) {
        let clip = this.getClip(key);

        if (!clip) {
            return false;
        }

        return clip.stop(reset);
    }
}


export class AnimationPlugin extends SculptPlugin {
    constructor() {
        super();
        this.animation = new Animation();
    }

    update() {
        if (!this.isEnabled) return;

        this.animation.clips.map(clip => {
            // todo: replace with get method
            if (!clip.isPlaying()) return;

            for (let i in clip.animatedValues) {
                object.setProperty(this.sculpt._threeObject, i, clip.animatedValues[i]);
            }
        });
    }

    applyTo(sculpt) {
        super.applyTo(sculpt);

        this.animation.sculpt = sculpt;
        sculpt.animation = this.animation;
        sculpt.on(CONST.UPDATE, () => {
            this.update();
        });
    }
}