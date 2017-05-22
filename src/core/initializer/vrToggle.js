import {Scene} from '../scene';
import {device} from '../device';
import {messenger} from '../messenger';
import * as CONST from '../constants';
import {postMessageTransport} from '../transport';

/**
 * Enters VR mode
 */
export const enterVR = () => {
    if (device.isVR)
        return false;

    window.mustShowRotateInstructions = false;
    Scene.webVRmanager.enterVRMode_();
    Scene.webVRmanager.hmd.resetPose();
    return true;
};

/**
 * Exits VR mode
 */
export const exitVR = () => {
    if (!device.isVR)
        return false;

    Scene.webVRmanager.hmd.exitPresent();
    return true;
};

/**
 * Enter VR when someone asks
 */
messenger.on(CONST.ENTER_VR, (data, transport) => {
    if (transport === postMessageTransport)
        enterVR();
});

/**
 * Exit VR when someone asks
 */
messenger.on(CONST.EXIT_VR, (data, transport) => {
    if(transport === postMessageTransport)
        exitVR();
});