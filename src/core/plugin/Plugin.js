import {EventEmitter} from '../eventEmitter';
/**
 * Base class for plugins.
 * Extend plugin types from this class.
 */
export class Plugin extends EventEmitter {
    constructor() {
        super();

        this._enabled = true;
    }

    /**
     * Shows if the plugin is enabled
     * @returns {boolean}
     */
    get isEnabled() {
        return this._enabled;
    }

    /**
     * Enables the plugin
     */
    enable() {
        this._enabled = true;
    }

    /**
     * Disables the plugin
     */
    disable() {
        this._enabled = false;
    }

    /**
     * Applies plugin to an Object
     */
    applyTo() {

    }
}
