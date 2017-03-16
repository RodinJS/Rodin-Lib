import {AScheme} from 'AScheme';

const addNoiseScheme = {
    vec: AScheme.any().hasProperty('isVector3').default(new THREE.Vector3(0, 0, 0)),
    e: AScheme.number().default(0),
    eVec:  AScheme.any().hasProperty('isVector3').default(new THREE.Vector3(1, 1, 1)),
};

export const addNoise = (...args) => {
    args = AScheme.validate(args, addNoiseScheme);

    const noise = Math.random() * 2 * args.e - args.e;
    args.eVec = args.eVec.clone().multiplyScalar(noise);
    return args.vec.clone().add(args.eVec);
};

export const toVector3 = (r = null) => {
    if (r == null) return new THREE.Vector3(0, 0, 0);
    return r.isVector3 ? r : new THREE.Vector3(r, r, r);
};