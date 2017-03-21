import {AScheme} from './AScheme';
import * as number from './number';

const addNoiseScheme = {
    vec: AScheme.any().hasProperty('isVector3').default(new THREE.Vector3(0, 0, 0)),
    e: AScheme.any().hasProperty('isVector3').default(new THREE.Vector3(1, 1, 1))
};

export const addNoise = (...args) => {
    args = AScheme.validate(args, addNoiseScheme);

    args.e = toVector3(args.e);

    const x = number.randomIn(-args.e.x / 2, args.e.x / 2);
    const y = number.randomIn(-args.e.y / 2, args.e.y / 2);
    const z = number.randomIn(-args.e.z / 2, args.e.z / 2);
    return args.vec.clone().add(new THREE.Vector3(x, y, z));
};

export const toVector3 = (r = null) => {
    if (r == null) return new THREE.Vector3(0, 0, 0);
    return r.isVector3 ? r : new THREE.Vector3(r, r, r);
};