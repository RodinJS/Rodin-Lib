import {AScheme} from '../utils/AScheme';
import {number} from '../utils';
import {Vector3} from '../utils/math/Vector3';

const contructorScheme = {
    r: AScheme.number().min(0).max(255).default(0),
    g: AScheme.number().min(0).max(255).default(0),
    b: AScheme.number().min(0).max(255).default(0),
    strValue: AScheme.string().default('')
};

export class Color extends THREE.Color {
    constructor(...args) {
        args = AScheme.validate(args, contructorScheme);
        let superArgs = [];
        if (args.strValue) {
            superArgs = [args.strValue];
        } else {
            if(args.r > 1 || args.g > 1 || args.b > 1) {
                args.r /= 255;
                args.g /= 255;
                args.b /= 255;
            }

            superArgs = [args.r, args.g, args.b]
        }

        super(...superArgs);
    }

    addNoise(color = new Color()) {
        let r = color.r || color.x;
        let g = color.g || color.y;
        let b = color.b || color.z;

        this.r = number.addNoise(this.r, r);
        this.g = number.addNoise(this.g, g);
        this.b = number.addNoise(this.b, b);
    }

    distanceTo(color) {
        return this.vector3.distanceTo(color.vector3);
    }

    get vector3() {
        return new Vector3(this.r, this.g, this.b);
    }
}

window.Color = Color;
