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
 * Enter VR when someone requests
 */
messenger.on(CONST.ENTER_VR, (data, transport) => {
    if (transport === postMessageTransport) {
        const status = enterVR();
        const channel = status ? CONST.ENTER_VR_SUCCESS : CONST.ENTER_VR_ERROR;
        messenger.post(channel, {
            destination: [data.path[data.path.length - 1]],
            timestamp: Date.now()
        }, postMessageTransport);
    }
});

/**
 * Exit VR when someone requests
 */
messenger.on(CONST.EXIT_VR, (data, transport) => {
    if(transport === postMessageTransport) {
        const status = exitVR();
        const channel = status ? CONST.EXIT_VR_SUCCESS : CONST.EXIT_VR_ERROR;
        messenger.post(channel, {
            destination: [data.path[data.path.length - 1]],
            timestamp: Date.now()
        }, postMessageTransport);
    }
});
