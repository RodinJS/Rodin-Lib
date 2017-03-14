export class Type {
    constructor() {
        // do not set this.default in case you want it to be null
        // this._default
        this._properties = [];
    }

    default(val) {
        if(arguments.length === 0) {
            if (typeof this._default === 'function') {
                return this._default();
            }
            return this._default;
        }
        this._default = val;
        return this;
    }

    validate(val) {
        if (this._properties.length && !val.hasOwnProperty)
            return false;

        for (let i = 0; i < this._properties.length; i++)
            if (val[this._properties[i]] === undefined)
                return false;

        return true;
    }

    hasProperty(...args) {
        this._properties = this._properties.concat(args);
        return this;
    }
}