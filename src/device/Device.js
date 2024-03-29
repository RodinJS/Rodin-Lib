import {EventEmitter} from '../eventEmitter/index.js';
import * as CONST from '../constants/index.js';
import {ErrorUnknownDevice} from '../error/index.js';
import {messenger} from '../messenger/index.js';
import {localTransport} from '../transport/index.js';
import {RodinEvent} from '../rodinEvent/index.js';

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
     * Checks if the current device is mobile (Android, webOS, iPhone, iPad, iPod, BlackBerry, Windows Phone)
     * @returns {boolean}
     */
    get isMobile() {
        return /Android/i.test(navigator.userAgent) || /webOS/i.test(navigator.userAgent) || /iPhone/i.test(navigator.userAgent) || /iPad/i.test(navigator.userAgent) || /iPod/i.test(navigator.userAgent) || /BlackBerry/i.test(navigator.userAgent) || /Windows Phone/i.test(navigator.userAgent);
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
     * Checks if the device is Oculus
     * @returns {boolean}
     */
    get isOculus() {
        if (this.webVRmanager && this.webVRmanager.hmd) {
            return /oculus/i.test(this.webVRmanager.hmd.displayName);
        }
        return null;
    }

    /**
     * Checks if the device is HTC Vive
     * @returns {boolean}
     */
    get isVive() {
        if (this.webVRmanager && this.webVRmanager.hmd) {
            return /OpenVR/i.test(this.webVRmanager.hmd.displayName);
        }
        return null;
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

            case CONST.MOBILE:
                return this.isMobile;

            case CONST.OCULUS:
                return this.isOculus;

            case CONST.VIVE:
                return this.isVive;

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
    if (transport === localTransport && device._isVR !== data) {
        device._isVR = data;
        if (device._isVR)
            device.emit(CONST.ENTER_VR, new RodinEvent(this));
        else
            device.emit(CONST.EXIT_VR, new RodinEvent(this));
    }
});

device.on(CONST.ENTER_VR, () => {
    messenger.post(CONST.ENTER_VR_SUCCESS);
});

device.on(CONST.EXIT_VR, () => {
    messenger.post(CONST.EXIT_VR_SUCCESS);
});