import {EventEmitter} from '../eventEmitter';
import * as CONST from '../constants';
import {ErrorUnknownDevice} from '../error';

/**
 * TODO: @serg fix comments
 * Class for getting current device information and ee
 */
class Device extends EventEmitter {
    constructor() {
        super();

        /**
         * TODO: @serg please review this
         * karoxa urish dzev es implement arel?
         */
        window.addEventListener('vrdisplaypresentchange', () => {

        });
    }

    get isIPhone() {
        return /iPhone/.test(navigator.userAgent) && !window.MSStream
    }

    get isIPad() {
        return /iPad/.test(navigator.userAgent) && !window.MSStream
    }

    get isIPod() {
        return /iPod/.test(navigator.userAgent) && !window.MSStream
    }

    get isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    /**
     * Get version of IOS
     * @returns {string|boolean}
     */

    get iOSVersion() {
        if (!this.isIOS)
            return false;

        if (!!window.indexedDB)
            return CONST.IOS8PLUS;

        if (!!window.SpeechSynthesisUtterance)
            return CONST.IOS7;

        if (!!window.webkitAudioContext)
            return CONST.IOS6;

        if (!!window.matchMedia)
            return CONST.IOS5;

        if (!!window.history && 'pushState' in window.history)
            return CONST.IOS4;
    }

    get isIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    /**
     * Check device by name
     * @param deviceName
     * @returns {boolean}
     */
    is(deviceName) {
        switch (deviceName) {
            case CONST.IPHONE:
                return this.isIPhone;

            case CONST.IPAD:
                return this.isIPad;

            case CONST.IPOD:
                return this.isIPod;

            case CONST.IOS:
                return this.isIOS;

            case CONST.IOS4:
                return this.iOSVersion === CONST.IOS4;

            case CONST.IOS5:
                return this.iOSVersion === CONST.IOS5;

            case CONST.IOS6:
                return this.iOSVersion === CONST.IOS6;

            case CONST.IOS7:
                return this.iOSVersion === CONST.IOS7;

            case CONST.IOS8PLUS:
                return this.iOSVersion === CONST.IOS8PLUS;

            case CONST.IFRAME:
                return this.isIframe;

            default:
                throw new ErrorUnknownDevice(deviceName);
        }
    }
}

export const device = new Device();