import {PerspectiveCamera} from './PerspectiveCamera';
import {Sculpt} from '../sculpt';
import {messenger} from '../messenger';
import * as CONST from '../constants';

// just a polyfill for now
// will implement when RO-678 gets done

export class HMDCamera extends PerspectiveCamera {

    constructor(...args) {
        super(...args);
    }

    get isHMDCamera() {
        return true;
    }
}