import {Curve} from './Curve';
import {Vector3} from '../Vector3';

export class Line extends Curve{
    constructor(a = 1, b = 1, c = 1, initialPoint = {x : 0, y : 0, z : 0}) {
        super();
        this._a = a;
        this._b = b;
        this._c = c;
        this._initialPoint = initialPoint;
    }

    eval(t) {
        const x = this._initialPoint.x + t * this._a;
        const y = this._initialPoint.y + t * this._b;
        const z = this._initialPoint.z + t * this._c;

        return new Vector3(x, y, z);
    }

    fromTwoPoints(point1, point2){
        this._initialPoint.x = point1.x;
        this._initialPoint.y = point1.y;
        this._initialPoint.z = point1.z;
        this._a = point2.x - point1.x;
        this._b = point2.y - point1.y;
        this._c = point2.z - point1.z;
    }

    fromVector(vector){
        this.fromTwoPoints({x : 0, y : 0, z : 0}, vector );
    }

    set initialPoint(initialPoint) {
        this._initialPoint = initialPoint;
    }

    get initialPoint() {
        return this._initialPoint;
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
