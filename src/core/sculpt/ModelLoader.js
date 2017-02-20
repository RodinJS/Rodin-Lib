import {ColladaModelObject} from './ModelObject/ColladaModelObject.js';
import {OBJModelObject} from './OBJModelObject.js';
import {JSONModelObject} from './JSONModelObject.js';
import {JDModelObject} from './ModelObject/JDModelObject.js';
import {ErrorInstantiationFailed, ErrorUnsupportedModelType} from '../error';

const supportedTypes = {
    'dae': ColladaModelObject,
    'obj': OBJModelObject,
    'json': JSONModelObject,
    'js': JSONModelObject,
    'jd': JDModelObject
};

/**
 * <p>Static Class ModelLoader.</p>
 * Loads 3D models .DAE .FBX .OBJ .JSON .JS .JD formats
 */
export class ModelLoader {
    /**
     * <p>Throws error.</p>
     * Use static method ModelLoader.load(url)
     */
    constructor() {
        throw new ErrorInstantiationFailed('ModelLoader');
    }

    /**
     * Load model form url, create Sculpt object.
     * @param {!string} url - url for model file
     * @returns {Sculpt} - created sculpt object from model
     */
    static load(url) {
        const urlSplitted = url.split('.');
        const type = urlSplitted[urlSplitted.length - 1].toLowerCase();

        if (Object.keys(supportedTypes).indexOf(type) !== -1) {
            return new supportedTypes[type](url);
        } else {
            throw new ErrorUnsupportedModelType(type);
        }
    }
}
