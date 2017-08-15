import {Curve} from './Curve';
import {Vector3} from '../Vector3';
import {solveQuadratic} from '../utils';

export class Parabola extends Curve {
    constructor(direction,
                a = -9.8,
                b = 0,
                c = 0,
                mainAxis = {x: 0, y: 1, z: 0},
                shift = {x: 0, y: 0, z: 0},
                matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) {
        super();
        this._direction = direction;
        this._a = a;
        this._b = b;
        this._c = c;
        this._mainAxis = mainAxis;
        this._shift = shift;
        this.matrix = matrix;
    }


    eval(t) {

        const dx = this.direction.x;
        const dy = this.direction.y;
        const dz = this.direction.z;
        const a = this._a;
        const b = this._b;
        const c = this._c;
        const sx = this._shift.x;
        const sy = this._shift.y;
        const sz = this._shift.z;
        let x;
        let y;
        let z;

        if (this._mainAxis.x) {
            x = this._a * t * t + this._b * t + this._c + this._shift.x;
            y = t * (-this._direction.y) + this._shift.y;
            z = t * (-this._direction.z) + this._shift.z;
        } else if (this._mainAxis.y) {
            const alpha = (sx - dx * t);
            const beta = (sz - dz * t);
            const gamma = (c + sy + b * t + a * t * t);
            x = (this.e12 + this.e0 * alpha + this.e8 * beta + this.e4 * gamma) /
                (this.e15 + this.e3 * alpha + this.e11 * beta + this.e7 * gamma);
            y = (this.e13 + this.e1 * alpha + this.e9 * beta + this.e5 * gamma) /
                (this.e15 + this.e3 * alpha + this.e11 * beta + this.e7 * gamma);
            z = (this.e14 + this.e2 * alpha + this.e10 * beta + this.e6 * gamma) /
                (this.e15 + this.e3 * alpha + this.e11 * beta + this.e7 * gamma);
        } else {
            x = t * (-this._direction.x) + this._shift.x;
            y = t * (-this._direction.y) + this._shift.y;
            z = this._a * t * t + this._b * t + this._c + this._shift.z;
        }
        return {x: x, y: y, z: z};
    }

    set matrix(matrix) {
        this._matrix = matrix;
        this.e0 = matrix[0];
        this.e1 = matrix[1];
        this.e2 = matrix[2];
        this.e3 = matrix[3];
        this.e4 = matrix[4];
        this.e5 = matrix[5];
        this.e6 = matrix[6];
        this.e7 = matrix[7];
        this.e8 = matrix[8];
        this.e9 = matrix[9];
        this.e10 = matrix[10];
        this.e11 = matrix[11];
        this.e12 = matrix[12];
        this.e13 = matrix[13];
        this.e14 = matrix[14];
        this.e15 = matrix[15];

        const dx = this.direction.x;
        const dy = this.direction.y;
        const dz = this.direction.z;
        const a = this._a;
        const b = this._b;
        const c = this._c;

        const sx = this._shift.x;
        const sy = this._shift.y;
        const sz = this._shift.z;

        this.BpaMul = (dx * this.e0 - b * this.e4 + dz * this.e8);
        this.BpbMul = (dx * this.e1 - b * this.e5 + dz * this.e9);
        this.BpcMul = (dz * this.e10 + dx * this.e2 - b * this.e6);
        this.BpdMul = (-(dz * this.e11) - dx * this.e3 + b * this.e7);

        this.CpaMul = (this.e12 + c * this.e4 + this.e0 * sx + this.e4 * sy + this.e8 * sz);
        this.CpbMul = (this.e13 + c * this.e5 + this.e1 * sx + this.e5 * sy + this.e9 * sz);
        this.CpcMul = (this.e14 + c * this.e6 + this.e2 * sx + this.e6 * sy + this.e10 * sz);
        this.CpdMul = (-this.e15 - c * this.e7 - this.e3 * sx - this.e7 * sy - this.e11 * sz);
    }

    get matrix() {
        return this._matrix;
    }


    intersectWithPlane(plane) {

        const a = this._a;
        const pa = plane.normal.x;
        const pb = plane.normal.y;
        const pc = plane.normal.z;
        const pd = plane.shift;




        if (this.mainAxis.y) {
            const A = a * this.e4 * pa + a * this.e5 * pb + a * this.e6 * pc - a * this.e7 * pd;
            const B = -(
            pa * this.BpaMul +
            pb * this.BpbMul +
            pc * this.BpcMul +
            pd * this.BpdMul);
            const C =
                pa * this.CpaMul +
                pb * this.CpbMul +
                pc * this.CpcMul +
                pd * this.CpdMul;
            const t = solveQuadratic(A, B, C);
            const point1 = this.eval(t[0]);
            const point2 = this.eval(t[1]);
            return [{position: point1, distance: t[0]}, {position: point2, distance: t[1]}];

            /*const sq = -(dx * e0 * pa) + b * e4 * pa - dz * e8 * pa - dx * e1 * pb + b * e5 * pb -
             dz * e9 * pb - dz * e10 * pc - dx * e2 * pc + b * e6 * pc + dz * e11 * pd + dx * e3 * pd -
             b * e7 * pd;

             const t1 = (dx * e0 * pa - b * e4 * pa + dz * e8 * pa + dx * e1 * pb - b * e5 * pb + dz * e9 * pb +
             dz * e10 * pc + dx * e2 * pc - b * e6 * pc - dz * e11 * pd - dx * e3 * pd + b * e7 * pd -
             Math.sqrt(sq * sq - 4 * (a * e4 * pa + a * e5 * pb + a * e6 * pc - a * e7 * pd) *
             (e12 * pa + c * e4 * pa + e13 * pb + c * e5 * pb + e14 * pc + c * e6 * pc - e15 * pd -
             c * e7 * pd + e0 * pa * sx + e1 * pb * sx + e2 * pc * sx - e3 * pd * sx + e4 * pa * sy +
             e5 * pb * sy + e6 * pc * sy - e7 * pd * sy + e8 * pa * sz + e9 * pb * sz + e10 * pc * sz -
             e11 * pd * sz)))
             /
             (2. * (a * e4 * pa + a * e5 * pb + a * e6 * pc - a * e7 * pd));


             const sqq = -(dx * e0 * pa) + b * e4 * pa - dz * e8 * pa - dx * e1 * pb + b * e5 * pb -
             dz * e9 * pb - dz * e10 * pc - dx * e2 * pc + b * e6 * pc + dz * e11 * pd + dx * e3 * pd -
             b * e7 * pd

             const t2 = (dx * e0 * pa - b * e4 * pa + dz * e8 * pa + dx * e1 * pb - b * e5 * pb + dz * e9 * pb +
             dz * e10 * pc + dx * e2 * pc - b * e6 * pc - dz * e11 * pd - dx * e3 * pd + b * e7 * pd +
             Math.sqrt(sqq * sqq - 4 * (a * e4 * pa + a * e5 * pb + a * e6 * pc - a * e7 * pd) *
             (e12 * pa + c * e4 * pa + e13 * pb + c * e5 * pb + e14 * pc + c * e6 * pc - e15 * pd -
             c * e7 * pd + e0 * pa * sx + e1 * pb * sx + e2 * pc * sx - e3 * pd * sx + e4 * pa * sy +
             e5 * pb * sy + e6 * pc * sy - e7 * pd * sy + e8 * pa * sz + e9 * pb * sz + e10 * pc * sz -
             e11 * pd * sz)))
             /
             (2. * (a * e4 * pa + a * e5 * pb + a * e6 * pc - a * e7 * pd));

             const point1 = this.eval(t1);
             const point2 = this.eval(t2);
             return [{position: point1, distance: t1}, {position: point2, distance: t2}];*/
        }
        return [];

    }

    clone() {
        return new Parabola(this._direction.clone(),
            this._a,
            this._b,
            this._c,
            {x: this._mainAxis.x, y: this._mainAxis.y, z: this._mainAxis.z},
            {x: this._shift.x, y: this._shift.y, z: this._shift.z}
        );
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
