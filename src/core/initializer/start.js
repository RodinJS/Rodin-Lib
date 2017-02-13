import {messenger} from '../messenger';

/**
 * Call this method before setting up anything.
 * THis will create renderer, domElement and VR buttons
 * @param params
 */
export const start = (params) => {
    messenger.post('rodinstarted', params);
};