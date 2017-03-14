import {Sculpt} from './Sculpt';
import {AScheme} from '../utils';

/**
 * Simple Box
 * @param width {number} box width
 * @param height {number} box height
 * @param depth {number} box depth
 * @param material {THREE.Material}
 */

const constructorScheme = {
    width: AScheme.number().default(.5),
    height: AScheme.number().default('$width'),
    depth: AScheme.number().default('$width'),
    material: AScheme.any().hasProperty('isMaterial').default(() => new THREE.MeshBasicMaterial({color: 336699}))
};

export class Box extends Sculpt {
    constructor(...args) {
        args = AScheme.validate(args, constructorScheme);

        const threeBox = new THREE.Mesh(new THREE.BoxGeometry(args.width, args.height, args.depth), args.material);
        super(threeBox);

        this._width = args.width;
        this._height = args.height;
        this._depth = args.depth
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get depth() {
        return this._depth;
    }

    // todo: add setters
}
