import {AnimationClip} from './AnimationClip';
import {SculptPlugin} from '../plugin';
import * as CONST from '../constants';
import {object} from '../utils';

/**
 * Each Sculpt object has its own Animation.
 * <p>Animation manages the clips that are assigned to the Sculpt object.</p>
 * @param {Sculpt} [sculpt=null] - Sculpt object
 */
export class Animation {
    constructor(sculpt = null) {

        /**
         * The host Sculpt object.
         * @type {Sculpt}
         */
        this.sculpt = sculpt;

        /**
         * A Set of clips to be played.
         * @type {Set.<AnimationClip>}
         */
        this.clips = [];
    }

    /**
     * Gets clip by name or index.
     * @param {!*} key
     * @returns {AnimationClip}
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
     * Adds new animation clip(s) to Animation object.
     * @param {...AnimationClip}
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
     * Removes animation clip(s) from Animation by name.
     * @params {...string} names
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
     * Gets all clips in current Animation object.
     * @returns {Set.<AnimationClip>}
     */
    getClips() {
        return this.clips;
    }

    /**
     * Checks if Animation Object is playing any (or specified) animation clip(s).
     * @param {*} [key=null] -  check the state for a specific animation clip
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
     * Starts animation clip by name or index.
     * @param {!*} key - Animation name or index
     * @returns {boolean}  false if the clip was not found
     */
    start(key) {
        let clip = this.getClip(key);

        if (!clip) {
            return false;
        }

        clip.play(0);
    }

    /**
     * Stops animation clip by name or index.
     * @param {!*} key - Animation name or index
     * @param {boolean} [reset=true] - run animationClip.reset() method after stopping the animation
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
 * Plugin class for Animation. Using this class you can apply animation to any Sculpt object.
 * This plugin is by default installed on Sculpt objects.
 */
export class AnimationPlugin extends SculptPlugin {
    constructor() {
        super();
        /**
         * The main Animation object to be connected to the Sculpt object.
         * @type {Animation}
         */
        this.animation = new Animation();
    }

    /**
     * Update function, Run on each render loop.
     * <p>On each call this function iterates through the currently playing clips of this.animation and </p>
     * <p>updates the host sculpt properties according to the values updated by those clips.</p>
     */
    update() {
        if (!this.isEnabled) return;

        for(let i = 0; i < this.animation.clips.length; i ++) {
            const clip = this.animation.clips[i];

            if (!clip.updatedInCurrentFrame) continue;

            for (let j in clip.animatedValues) {
                object.setProperty(this.sculpt, j, clip.animatedValues[j]);
            }
        }
    }

    /**
     * applyTo is called as the last step of installing a plugin to Sculpt.
     * <p>It sets the this.sculpt object and this.animation.sculpt object to the provided sculpt</p>
     * <p> and creates sculpt.animation parameter on the sculpt object, that back refers to this.animation.</p>
     * <p>This way this.animation.sculpt refers to the sculpt object, and sculpt.animation back-refers to this.animation. Tricky I know :)</p>
     * <p>After the references are set, this.update is added to the sculpts update event handlers, to be called in renderer loop.</p>
     * @param {!Sculpt} sculpt the sculpt object to apply this plugin to.
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
