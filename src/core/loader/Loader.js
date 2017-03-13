import {ErrorInstantiationFailed, ErrorUnsupportedModelType} from '../error';
import {loadOBJ} from './loadOBJ';

const supportedTypes = {
    'obj': loadOBJ
};

export class Loader {
    constructor() {
        throw new ErrorInstantiationFailed('Loader');
    }

    static loadModel(url, callback) {
        const urlSplitted = url.split('.');
        const type = urlSplitted[urlSplitted.length - 1].toLowerCase();

        if (Object.keys(supportedTypes).indexOf(type) !== -1) {
            return loadOBJ(url, callback);
        } else {
            throw new ErrorUnsupportedModelType(type);
        }
    }
}