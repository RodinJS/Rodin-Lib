import {EventEmitter} from '../eventEmitter';

export class Plugin extends EventEmitter {
    constructor() {
        super();

        this._enabled = true;
    }

    get isEnabled() {
        return this._enabled;
    }

    enable() {
        this._enabled = true;
    }

    disable() {
        this._enabled = false;
    }

    applyTo() {

    }
}
