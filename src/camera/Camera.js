import {Sculpt} from '../sculpt/Sculpt.js';

export class Camera extends Sculpt {
    constructor(threeCamera = new THREE.Camera()) {
        super(threeCamera);
        this._threeCamera = this._threeObject;
    }

    get isCamera() {
        return true;
    }

}
