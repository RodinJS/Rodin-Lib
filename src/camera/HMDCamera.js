import {PerspectiveCamera} from './PerspectiveCamera.js';

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