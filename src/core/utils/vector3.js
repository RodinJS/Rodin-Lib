import {AScheme} from './AScheme';
import * as number from './number';
import {Vector3} from '../math'

const addNoiseScheme = {
    vec: AScheme.any().hasProperty('isVector3').default(new Vector3(0, 0, 0)),
    e: AScheme.any().hasProperty('isVector3').default(new Vector3(1, 1, 1))
};

export const addNoise = (...args) => {
    console.warn('utils vector3.addNoise is deprecated, use Vector3.addNoise method');
    args = AScheme.validate(args, addNoiseScheme);

    args.e = toVector3(args.e);

    const x = number.randomIn(-args.e.x / 2, args.e.x / 2);
    const y = number.randomIn(-args.e.y / 2, args.e.y / 2);
    const z = number.randomIn(-args.e.z / 2, args.e.z / 2);
    return args.vec.clone().add(new Vector3(x, y, z));
};

export const toVector3 = (r = null) => {
    if (r == null) return new Vector3(0, 0, 0);
    return r.isVector3 ? r : new Vector3(r, r, r);
};