import {Sculpt} from './Sculpt';
import {AScheme} from '../utils';

const constructorScheme = {
    width: AScheme.number().default(.4),
    height: AScheme.number().default('$width'),
    depth: AScheme.number().default('$width'),
    material: AScheme.any().hasProperty('isMaterial').default(() => new THREE.MeshBasicMaterial({color: 0x336699}))
};

/**
 * Simple Box
 * @param width {number} box width
 * @param height {number} box height
 * @param depth {number} box depth
 * @param material {THREE.Material}
 */
export class Box extends Sculpt {
    constructor(...args) {
        args = AScheme.validate(args, constructorScheme);

        const threeBox = new THREE.Mesh(new THREE.BoxGeometry(args.width, args.height, args.depth), args.material);
        super(threeBox);

        this._width = args.width;
        this._height = args.height;
        this._depth = args.depth;
    }

    /**
     * Gets width of current box
     * @returns {Number}
     */
    get width() {
        return this._width;
    }

    /**
     * Gets height of current box
     * @returns {Number}
     */
    get height() {
        return this._height;
    }

    /**
     * Gets depth of current box
     * @returns {Number}
     */
    get depth() {
        return this._depth;
    }

    // todo: add setters
}
