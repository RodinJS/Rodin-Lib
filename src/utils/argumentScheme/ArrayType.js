import {Type} from './Type.js';

export class ArrayType extends Type {
    constructor() {
        super();
        this._minLength = 0;
        this._maxLength = Infinity;
        this._length = null;
    }

    minLength(val) {
        this._minLength = val;
        return this;
    }

    maxLength(val) {
        this._maxLength = val;
        return this;
    }

    length(val) {
        this._length = val;
        return this;
    }

    validate(val) {
        if (!super.validate(val))
            return false;

        if (val.constructor !== Array || val.length < this._minLength || val.length > this._maxLength)
            return false;

        if (this._length && val.length !== this._length)
            return false;
        return true;
    }
}