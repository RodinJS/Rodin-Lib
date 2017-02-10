import {messenger} from '../messenger';

export const start = (params) => {
    messenger.post('rodinstarted', params);
};