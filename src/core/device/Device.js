import {EventEmitter} from '../eventEmitter';
import * as CONST from '../constants';
import {ErrorUnknownDevice} from '../error';
import {messenger} from '../messenger';
import {localTransport} from '../transport';
import {RodinEvent} from '../rodinEvent';

/**
 * Class for getting current device information such as
 * checking device type, vr mode, ...
 * This class should not be instantiated
 */
class Device extends EventEmitter {
    constructor() {
        super();
        this._isVR = false;

        this.on(CONST.ENTER_VR, (evt) => {
            this._isVR = true;
            this.emit(CONST.VR_MODE_CHANGE, evt);
        });

        this.on(CONST.EXIT_VR, (evt) => {
            this._isVR = false;
            this.emit(CONST.VR_MODE_CHANGE, evt);
        });
    }

    /**
     * Checks if the current device is an iPhone
     * @returns {boolean}
     */
    get isIPhone() {
        return /iPhone/.test(navigator.userAgent) && !window.MSStream
    }

    /**
     * Checks if the current device is an iPad
     * @returns {boolean}
     */
    get isIPad() {
        return /iPad/.test(navigator.userAgent) && !window.MSStream
    }

    /**
     * Checks if the current device is an iPod
     * @returns {boolean}
     */
    get isIPod() {
        return /iPod/.test(navigator.userAgent) && !window.MSStream
    }

    /**
     * Checks if the current device runs iOS (iPhone, iPad, iPod)
     * @returns {boolean}
     */
    get isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    /**
     * Gets the current version of iOS
     * returns null if not iOS
     * @returns {string|null}
     */
    get iOSVersion() {
        if (!this.isIOS)
            return null;

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

    /**
     * Checks if we are running inside an iframe
     * @returns {boolean}
     */
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

    /**
     * Checks if current session is in VR mode
     * @returns {boolean}
     */
    get isVR() {
        return this._isVR;
    }
}

/**
 * Main and only instance of Device class
 * @type {Device}
 */
export const device = new Device();

messenger.on(CONST.VR_DISPLAY_PRESENT_CHANGE, (data, transport) => {
    if(transport === localTransport && device._isVR !== data) {
        device._isVR = data;
        if(device._isVR)
            device.emit(CONST.ENTER_VR, new RodinEvent(this));
        else
            device.emit(CONST.EXIT_VR, new RodinEvent(this));
    }
});
