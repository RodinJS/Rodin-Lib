import {ErrorInstantiationFailed, ErrorUnsupportedModelType} from '../error/index.js';
import {loadOBJ} from './loadOBJ.js';
import {loadFile} from './loadFile.js';

const supportedTypes = {
    'obj': loadOBJ
};

const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin('anonymous');


/**
 * Loader class.
 * Use for loading 3d models,
 * currently supports only .obj format
 */
export class Loader {
    constructor() {
        throw new ErrorInstantiationFailed('Loader');
    }

    /**
     * A static method for loading .obj file from the provided url, your callback function will receive the loaded mesh as an argument.
     * @param url {string}
     * @param callback {Function}
     */
    static loadModel(url, callback) {
        const urlSplitted = url.split('.');
        const type = urlSplitted[urlSplitted.length - 1].toLowerCase();

        if (Object.keys(supportedTypes).indexOf(type) !== -1) {
            return loadOBJ(url, callback);
        } else {
            throw new ErrorUnsupportedModelType(type);
        }
    }

    /**
     * A static method for loading textures from provided url.
     * @param url {string}
     * @param onLoad {Function}
     * @param onProgress {Function}
     * @param onError {Function}
     */
    static loadTexture(url, onLoad, onProgress, onError) {
        // todo: implement with event emitter!!!!!!
        return textureLoader.load(url, onLoad, onProgress, onError);
    }
    static loadFont(url, onLoad) {
        return loadFile(url, null, onLoad, "arraybuffer");
    }
}