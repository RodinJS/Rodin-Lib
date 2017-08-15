import {Curve} from './shape/Curve';
import {Parabola} from './shape/Parabola';
import {Line} from './shape/Line';
import {Vector3} from './Vector3';
import {Quaternion} from './Quaternion';
import {Euler} from './Euler';


export function solveQuadratic(a, b, c) {
    if (a === 0) {
        if (b != 0) {
            const x = -c / b;
            return [x, x];
        } else {
            return [];
        }
    }
    const a2 = 2 * a;
    const ac = 4 * a * c;
    const dis = b * b - ac;
    if (dis < 0) {
        return [];
    }
    else {
        const dis_sqrt = Math.sqrt(dis);
        const x1 = (-b + dis_sqrt) / a2;
        const x2 = (-b - dis_sqrt) / a2;
        return [x1, x2]
    }
}

export function getIntersections(curve1, curve2) {
    if (curve1 instanceof Line && curve2 instanceof Parabola) {
        return getIntersectionsLineParabola(curve1, curve2);
    } else if (curve2 instanceof Line && curve1 instanceof Parabola) {
        return getIntersectionsLineParabola(curve2, curve1);
    }
}

export function pointInTriangle(p, p0, p1, p2) {
    const A = .5 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
    const sign = A < 0 ? -1 : 1;
    const s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
    const t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;
    return s > 0 && t > 0 && (s + t) < 2 * A * sign;
}

function getIntersectionsLineParabola(line, parabola) {
    if (parabola.mainAxis.y) {
        let t1 = [];
        if (line.a) {
            t1 = solveQuadratic(
                line.a * parabola.a,
                parabola.b * line.a + line.b * parabola.direction.x,
                line.a * (parabola.c + parabola.shift.y - line.initialPoint.y) + line.b * (line.initialPoint.x - parabola.shift.x)
            );
        }
        else {
            t1 = solveQuadratic(
                line.c * parabola.a,
                parabola.b * line.c + line.b * parabola.direction.z,
                line.c * (parabola.c + parabola.shift.y - line.initialPoint.y) + line.b * (line.initialPoint.z - parabola.shift.z)
            );
        }
        const t2 = new Array(2);
        if (line.a) {
            t2[0] = -(parabola.direction.x * t1[0] + line.initialPoint.x - parabola.shift.x) / line.a;
            t2[1] = -(parabola.direction.x * t1[1] + line.initialPoint.x - parabola.shift.x) / line.a;
        } else if (line.c) {
            t2[0] = -(parabola.direction.z * t1[0] + line.initialPoint.z - parabola.shift.z) / line.c;
            t2[1] = -(parabola.direction.z * t1[1] + line.initialPoint.z - parabola.shift.z) / line.c;
        } else if (line.b) {
            t2[0] = (parabola.a * t1[0] * t1[0] + parabola.b * t1[0] + parabola.c + parabola.shift.y - line.initialPoint.y) / line.b;
            t2[1] = (parabola.a * t1[1] * t1[1] + parabola.b * t1[1] + parabola.c + parabola.shift.y - line.initialPoint.y) / line.b;
        }

        const x1 = line.initialPoint.x + line.a * t2[0];
        const y1 = line.initialPoint.y + line.b * t2[0];
        const z1 = line.initialPoint.z + line.c * t2[0];

        const x2 = line.initialPoint.x + line.a * t2[1];
        const y2 = line.initialPoint.y + line.b * t2[1];
        const z2 = line.initialPoint.z + line.c * t2[1];


        return [{position: new Vector3(x1, y1, z1), distance: t1[0]}, {
            position: new Vector3(x2, y2, z2),
            distance: t1[1]
        }];

    }
    return [];
}

export function getIntersectionsPlaneParabola(plane, parabola) {
    if (parabola.mainAxis.y) {
        const t = solveQuadratic(
            plane.normal.y * parabola.a,
            plane.normal.y * parabola.b - plane.normal.x * parabola.direction.x - plane.normal.z * parabola.direction.z,
            plane.normal.x * parabola.shift.x + plane.normal.y * ( parabola.c + parabola.shift.y )
            + plane.normal.z * parabola.shift.z + plane.shift
        );
        const point1 = parabola.eval(t[0]);
        const point2 = parabola.eval(t[1]);
        return [{position: point1, distance: t[0]}, {position: point2, distance: t[1]}];
    }
    return [];
}

export function triangleArea(vertex1, vertex2, vertex3){
    const a = {x: vertex2.x - vertex1.x, y: vertex2.y - vertex1.y, z: vertex2.z - vertex1.z};
    const b = {x: vertex3.x - vertex1.x, y: vertex3.y - vertex1.y, z: vertex3.z - vertex1.z};
    const vCross ={x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x} ;
    return Math.sqrt(vCross.x*vCross.x + vCross.y*vCross.y + vCross.z*vCross.z)/2;
}
