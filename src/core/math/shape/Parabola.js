import {Curve} from './Curve';
import {Vector3} from '../Vector3';

export class Parabola extends Curve {
    constructor(direction, a = -9.8, b = 0, c = 0, mainAxis = {x: 0, y: 1, z: 0}, shift = {x: 0, y: 0, z: 0}) {
        super();
        this._direction = direction;
        this._a = a;
        this._b = b;
        this._c = c;
        this._mainAxis = mainAxis;
        this._shift = shift;
    }

    eval(t) {
        let x = 0;
        let y = 0;
        let z = 0;
        if (this._mainAxis.x) {
            x = this._a * t * t + this._b * t + this._c + this._shift.x;
            y = t * (-this._direction.y) + this._shift.y;
            z = t * (-this._direction.z) + this._shift.z;
        } else if (this._mainAxis.y) {
            x = t * (-this._direction.x) + this._shift.x;
            y = this._a * t * t + this._b * t + this._c + this._shift.y;
            z = t * (-this._direction.z) + this._shift.z;
        } else {
            x = t * (-this._direction.x) + this._shift.x;
            y = t * (-this._direction.y) + this._shift.y;
            z = this._a * t * t + this._b * t + this._c + this._shift.z;
        }

        return {x: x, y: y, z: z};
    }

    set mainAxis(mainAxis) {
        this._mainAxis = mainAxis;
    }

    get mainAxis() {
        return this._mainAxis;
    }

    set direction(direction) {
        this._direction = direction;
    }

    get direction() {
        return this._direction;
    }

    set shift(shift) {
        this._shift = shift;
    }

    get shift() {
        return this._shift;
    }

    set a(a) {
        this._a = a;
    }

    get a() {
        return this._a;
    }

    set b(b) {
        this._b = b;
    }

    get b() {
        return this._b;
    }

    set c(c) {
        this._c = c;
    }

    get c() {
        return this._c;
    }
}
