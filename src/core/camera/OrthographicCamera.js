import {Camera} from './Camera.js';

class OrthographicCamera extends Camera {
    constructor(...args) {
        super(new THREE.OrthographicCamera(...args));
    }

    get isOrthographicCamera() {
        return true;
    }

    setViewOffset(...args) {
        // todo: implement with AScheme
        this._threeCamera.setViewOffset(...args);
        return this;
    }

    clearViewOffset() {
        this._threeCamera.clearViewOffset();
    }

    updateProjectionMatrix() {
        // todo: we dont really need this, just call this wherever and make it private
        this._threeCamera.updateProjectionMatrix();
    }
}