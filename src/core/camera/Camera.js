import {Sculpt} from '../sculpt/Sculpt';

export class Camera extends Sculpt {
    constructor(threeCamera = new THREE.Camera()) {
        super(threeCamera);
        this._threeCamera = this._threeObject;
    }

    get isCamera() {
        return true;
    }

}
