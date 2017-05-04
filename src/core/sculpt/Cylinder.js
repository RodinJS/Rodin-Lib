import {Sculpt} from './Sculpt';
import {AScheme} from '../utils';

const constructorScheme = {
    radiusTop: AScheme.number().default(.1),
    radiusBottom: AScheme.number().default('$radiusTop'),
    height: AScheme.number().default(.4),
    radiusSegments: AScheme.number().default(16),
    heightSegments: AScheme.number().default(1),
    openEnded: AScheme.bool().default(false),
    thetaStart: AScheme.number().default(0),
    thetaLength: AScheme.number().default(2 * Math.PI),
    material: AScheme.any().hasProperty('isMaterial').default(() => new THREE.MeshBasicMaterial({color: 0x336699}))
};

/**
 * Simple Box
 * @param width {number} box width
 * @param height {number} box height
 * @param depth {number} box depth
 * @param material {THREE.Material}
 */


export class Cylinder extends Sculpt {
    constructor(...args) {
        args = AScheme.validate(args, constructorScheme, true);

        const threeBox = new THREE.Mesh(new THREE.CylinderGeometry(...args), args[args.length - 1]);
        super(threeBox);

        this._radiusTop = args.radiusTop;
        this._radiusBottom = args.radiusBottom;
        this._height = args.height;
        this._radiusSegments = args.radiusSegments;
        this._heightSegments = args.heightSegments;
        this._openEnded = args.openEnded;
        this._thetaStart = args.thetaStart;
        this._thetaLength = args.thetaLength;
    }

    get radiusTop() {
        return this._radiusTop;
    }

    get radiusBottom() {
        return this._radiusBottom;
    }

    get height() {
        return this._height;
    }

    get radiusSegments() {
        return this._radiusSegments;
    }

    get heightSegments() {
        return this._heightSegments;
    }

    get openEnded() {
        return this._openEnded;
    }

    get thetaStart() {
        return this._thetaStart;
    }

    get thetaLength() {
        return this._thetaLength;
    }

    // todo: add setters
}
