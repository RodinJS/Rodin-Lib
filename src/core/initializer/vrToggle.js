import {Scene} from '../scene';
import {device} from '../device';

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
