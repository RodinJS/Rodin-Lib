import * as RODIN from 'rodin/core';

export class Parabola {
    constructor(direction, a, b, c) {
        this._direction = direction;
        this._a = a || -9.8;
        this._b = b || 0;
        this._c = c || 0;
    }

    eval(t) {
        const x = t * (-this._direction.x);
        const y = this._a * t * t + this._b * t + this._c;
        const z = t * (-this._direction.z);

        return new RODIN.Vector3(x, y, z);
    }

    set direction(direction) {
        return this._direction = direction;
    }

    set a(a) {
        return this._a = a;
    }

    get a() {
        return this._a;
    }

    set b(b) {
        return this._b = b;
    }

    get b() {
        return this._b;
    }

    set c(c) {
        return this._c = c;
    }

    get c() {
        return this._c;
    }
}
