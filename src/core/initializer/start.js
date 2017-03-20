import {messenger} from '../messenger';
import * as CONST from '../constants';

/**
 * Call this method before setting up anything.
 * This will create renderer, domElement and VR buttons
 * @param params
 */

let rodinStarted = false;
export const start = (params) => {
    if (rodinStarted) {
        throw new Error('Rodin wal already started');
    }

    messenger.post(CONST.RODIN_STARTED, params);
};

messenger.on(CONST.REQUEST_RODIN_STARTED, () => {

    // todo: send all params
    messenger.post(CONST.RODIN_STARTED, true);
});