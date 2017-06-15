import {Vector3} from '../math';
import {AScheme} from '../utils';

const constructorScheme = {
    r: AScheme.number().default(1),
    g: AScheme.number().default('$r'),
    b: AScheme.number().default('$g')
};

export class Color extends Vector3 {
    constructor(...args) {
        args = AScheme.validate(args, constructorScheme, true);

        super();

        this.r = args.r;
        this.g = args.g;
        this.b = args.b;
    }

    /**
     * To check if current object is Color
     * @return {boolean}
     */
    get isColor() {
        return true;
    }

    /**
     * Get R channel for color
     * @return {number}
     */
    get r() {
        return this.x;
    }

    /**
     * Set R channel for color
     * @param value {number}
     */
    set r(value) {
        this.x = value;
    }

    /**
     * Get G channel for color
     * @return {number}
     */
    get g() {
        return this.y;
    }

    /**
     * Set R channel for color
     * @param value {number}
     */
    set g(value) {
        this.y = value;
    }

    /**
     * Get B channel for color
     * @return {number}
     */
    get b() {
        return this.z;
    }

    /**
     * Set R channel for color
     * @param value {number}
     */
    set b(value) {
        this.z = value;
    }

    /**
     * Set all channels
     * @param value {number}
     */
    set scalar(value) {
        this.r = value;
        this.g = value;
        this.b = value;
    }

    /**
     * Set color from hex value
     * @param value
     */
    set hex(value) {
        value = Math.floor(value);

        this.r = ( value >> 16 & 255 ) / 255;
        this.g = ( value >> 8 & 255 ) / 255;
        this.b = ( value & 255 ) / 255;

        return this;
    }

    /**
     * Copy given color to this
     * @param color {Color}
     */
    copy(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
    }

    /**
     * Clone this color
     * @return {Color}
     */
    clone() {
        return new Color().copy(this);
    }
}
