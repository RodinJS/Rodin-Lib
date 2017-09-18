import {Camera} from './Camera.js';
import {AScheme} from '../utils/AScheme.js'


const constructorScheme = {
    fov: AScheme.number().min(1).max(180).default(70),
    aspect: AScheme.number().default(() => {
        return window.innerWidth / window.innerHeight
    }),
    near: AScheme.number().min(0.001).default(0.01),
    far: AScheme.number().default(100)
};

export class PerspectiveCamera extends Camera {
    constructor(...args) {
        args = AScheme.validate(args, constructorScheme);
        super(new THREE.PerspectiveCamera(args.fov, args.aspect, args.near, args.far));
    }

    get isPerspectiveCamera() {
        return true;
    }

    get aspect() {
        return this._threeCamera.aspect;
    }

    set aspect(val) {
        this._threeCamera.aspect = val;
    }

    set focalLength(val) {
        this._threeCamera.setFocalLength(val);
    }

    get focalLength() {
        return this._threeCamera.getFocalLength();
    }

    get effectiveFov() {
        return this._threeCamera.getEffectiveFOV();
    }

    get filmWidth() {
        return this._threeCamera.getFilmWidth();
    }

    get filmHeight() {
        return this._threeCamera.getFilmHeight();
    }

    get worldDirection() {
        return this._threeCamera.getWorldDirection();
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