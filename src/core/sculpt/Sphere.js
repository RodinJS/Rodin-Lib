import {Sculpt} from './Sculpt';
import {AScheme} from '../utils';

/**
 * Simple Sphere
 * @param radius {number} sphere radius
 * @param widthSegments {number}
 * @param heightSegments {number}
 * @param material {THREE.Material}
 */

const constructorScheme = {
    radius: AScheme.number().default(.2),
    widthSegments: AScheme.number().default(10),
    heightSegments: AScheme.number().default(10),
    material: AScheme.any().hasProperty('isMaterial').default(() => new THREE.MeshBasicMaterial({color: 336699}))
};

export class Sphere extends Sculpt {
    constructor(...args) {
        args = AScheme.validate(args, constructorScheme);

        const threeSphere = new THREE.Mesh(new THREE.SphereGeometry(args.radius, args.widthSegments, args.heightSegments), args.material);
        super(threeSphere);

        this._radius = args.radius;
    }

    get isSphere() {
        return true
    }

    /**
     * Gets the radius of current Sphere
     * @returns {Number}
     */
    get radius() {
        return this._radius;
    }

    // todo: add setter for radius
}