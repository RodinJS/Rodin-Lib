import {AScheme} from './AScheme';

const addNoiseScheme = {
    n: AScheme.number().default(0),
    e: AScheme.number().default(0)
};

export const addNoise = (...args) => {
    args = AScheme.validate(args, addNoiseScheme);

    const noise = Math.random() * 2 * args.e - args.e;
    return args.n + noise;
};