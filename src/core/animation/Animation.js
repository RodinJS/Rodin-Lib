import {AnimationClip} from './AnimationClip';
import {SculptPlugin} from '../plugin';
import {Set} from '../set';
import * as CONST from '../constants';
import {object} from '../utils';

/**
 * Class Animation
 * Each Sculpt object has its own Animation.
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
     * Gets clip by name or index
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
     * Adds new animation clip to Animation Object
     * @param {...Animation}
     * @returns {Animation}
     */
    add() {
        const ret = [];
        for (let i = 0; i < arguments.length; i++) {
            let animation = arguments[i];

            if (animation instanceof AnimationClip) {
                const tmp = animation.clone().setSculpt(this.sculpt);
                this.clips.push(tmp);
                ret.push(tmp);
            }
        }
    }

    /**
     * Removes animations from Animation by name
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
     * Get all clips in current Animation Object
     * @returns {Set.<Animation>}
     */
    getClips() {
        return this.clips;
    }

    /**
     * Checks if Animation Object is playing any (or specified) animation clip(s)
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
     * Starts animation by name or index
     * @param {!*} key - Animation name or index
     * @returns {boolean}
     */
    start(key) {
        let clip = this.getClip(key);

        if (!clip) {
            return false;
        }

        clip.play(0);
    }

    /**
     * Stops animation by name or index
     * @param {!*} key - Animation name or index
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


/**
 * Plugin for Animation
 */
export class AnimationPlugin extends SculptPlugin {
    constructor() {
        super();
        this.animation = new Animation();
    }

    /**
     * Update function
     */
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

    /**
     * Apply to sculpt.
     * @param sculpt
     */
    applyTo(sculpt) {
        super.applyTo(sculpt);

        this.animation.sculpt = sculpt;
        sculpt.animation = this.animation;
        sculpt.on(CONST.UPDATE, () => {
            this.update();
        });
    }
}
