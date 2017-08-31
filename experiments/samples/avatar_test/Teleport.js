import * as RODIN from 'rodin/core';

export class Teleport {
    constructor(sourceObject, segmentsMaxNumber = 20, stepInterval = 0.3) {
        this.sourceObject = sourceObject;
        this.segmentsMaxNumber = segmentsMaxNumber;
        this.stepInterval = stepInterval;
        //this.raycaster = this.sourceObject.raycaster;

        this.rayPoints = [];
        this.sourceObject.on(RODIN.CONST.READY, () => {
            this.createLine();
        });

        this.center = new THREE.Vector2(0, 0);
        this.parabolaPoint = new THREE.Vector3(0, 0, 0);
        this.sourceObject.on(RODIN.CONST.UPDATE, () => {
            this.reDrawLine(this.sourceObject._threeObject.getWorldDirection());
        });
        this.parabolaArgs = {a: 0, b: 0, c: 0};
    }

    createLine() {
        const pointsSculpt = new RODIN.Sculpt();
        for (let i = 0; i < this.segmentsMaxNumber; i++) {
            const g = new RODIN.Sphere(0.02, new THREE.MeshBasicMaterial({color: 0x00FF00}));
            g.position.set(0, 0, 0);
            pointsSculpt.add(g);
            this.rayPoints.push({x: 0, y: 0, z: -i * this.stepInterval});
        }
        this.sourceObject.add(pointsSculpt);
        this.pointsSculpt = pointsSculpt;
    }

    reDrawLine(rayDirection) {
        rayDirection = rayDirection.normalize();
        // calculate angle between ray vector and XZ plane, for projection it in 2D
        let rayDirectionOnXZ = new THREE.Vector3(rayDirection.x, 0, rayDirection.z);
        let alpha = -rayDirectionOnXZ.angleTo(rayDirection) * Math.sign(rayDirection.y || 1);
        // calculate coefficient for start velocity
        this.parabolaArgs.b = -Math.tan(alpha);

        // calculate coefficient for acceleration, which is equal [0, 1] (lerpFactor)
        this.parabolaArgs.a = -Math.pow(alpha / Math.PI + 1 / 2, 3);

        for (let step = 0, i = 0; i < this.pointsSculpt.children.length; step += this.stepInterval, i++) {
            // calculate parabola points and rotate by ray
            const tmp = new THREE.Vector2(P2(this.parabolaArgs.a, this.parabolaArgs.b, 0, -step), -step);
            this.pointsSculpt.children[i].position.set(0, tmp.x, tmp.y);
            /*tmp.rotateAround(this.center, -alpha);

             this.parabolaPoint.set(0, tmp.x, tmp.y);
             this.pointsSculpt.children[i].position.copy(this.rayPoints[i]).lerp(this.parabolaPoint, this.parabolaArgs.a);*/




            // if (i > 0) {
            //     this.raycaster.ray.origin.copy(this.sourceObject.sculpt.globalPosition.add(this.pointsSculpt.children[i - 1].position));
            //     let curVertex = this.pointsSculpt.children[i - 1].position.clone();
            //     let nextVertex = this.pointsSculpt.children[i].position.clone();
            //     this.raycaster.ray.direction = nextVertex.sub(curVertex);
            //     //nextVertex is now the difference
            //     //vector of two points in our line
            //     this.raycaster.far = nextVertex.length();
            //
            //     let objs = this.raycaster.raycast();
            //     if (objs.length && objs[0].point) {
            //         //.log(objs);
            //         break;
            //     }
            // }
        }
    }

    getPlaneEquation(point1, point2, point3) {
        // first we create  two vectors using provided three points
        const vecA = new THREE.Vector3(point2.x - point1.x, point2.y - point1.y, point2.z - point1.z);
        const vecB = new THREE.Vector3(point3.x - point1.x, point3.y - point1.y, point3.z - point1.z);
        // here we calculate the normal vector of the surface passing through the mentioned two vectors
        const vecN = ((new THREE.Vector3()).crossVectors(vecA, vecB)).normalize();
        // and the shift of the surface by the normal vector
        const d = -(vecN.x * point1.x + vecN.y * point1.y + vecN.z * point1.z);

        // this is the final formula of the plane
        //console.log("plane = { " + vecN.x + "x + " + vecN.y + "y + " + vecN.z + "z + " + d + " }");


/*        let planeGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
        const plane = new RODIN.Sculpt(new THREE.Mesh(planeGeometry, new THREE.MeshNormalMaterial({
            wireframe: false,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        })));
        RODIN.Scene.add(plane);
        plane._threeObject.lookAt(vecN);
        const planePos = (new THREE.Vector3(vecN.x, vecN.y, vecN.z)).multiplyScalar(-d);
        plane.position.set(planePos.x, planePos.y, planePos.z);*/
        return {normal: vecN, shift: d};
    }

    projectOnPlane(vec, planeNormal) {
        const d = vec.dot(planeNormal) / planeNormal.length();
        planeNormal = planeNormal.clone().normalize();
        const p = planeNormal.multiplyScalar(d);
        return vec.clone().sub(p);
    }


    getIntersectionLine(plane1, plane2) {

        console.log(plane2.normal.x, plane2.normal.y, plane2.normal.z);

        const a1 = plane1.normal.x;
        const b1 = plane1.normal.y;
        const c1 = plane1.normal.z;
        const d1 = plane1.shift;

        const a2 = plane2.normal.x;
        const b2 = plane2.normal.y;
        const c2 = plane2.normal.z;
        const d2 = plane2.shift;


        const z = (a1 * d2 - a2 * d1) / (a2 * c1 - a1 * c2);
        const x = -(d1 + c1 * z) / a1;
        const y = 0;

        const v1 = plane1.normal.normalize();
        const v2 = plane2.normal.normalize();
        const n = new THREE.Vector3().crossVectors(v2, v1).normalize();
        const p = new THREE.Vector3(x, y, z);

/*        console.log("plane normal is: " + x + ", " + y + ", " + z);
        const h1 = new THREE.ArrowHelper(n, p, 4, 0xffffff);
        RODIN.Scene.add(new RODIN.Sculpt(h1));*/

        return {n: n, p: p};
    }

    getIntersectionPoint(planeNormal, quadratic, lineP1, lineP2) {
/*
        console.log("plane normal is: " + planeNormal.x + ", " + planeNormal.y + ", " + planeNormal.z);
        console.log("quadratic function is: x = " + quadratic.a + "y^2 + " + quadratic.b + "y + " + quadratic.c);
        console.log("point 1 is: " + lineP1.x + ", " + lineP1.y + ", " + lineP1.z);
        console.log("point 2 is: " + lineP2.x + ", " + lineP2.y + ", " + lineP2.z);
        console.log("1 is ", this.pointsSculpt.children[1].position);
*/

        this.sourceObject._threeObject.worldToLocal(lineP1);
        this.sourceObject._threeObject.worldToLocal(lineP2);

        const a = (lineP2.y - lineP1.y) / (lineP2.z - lineP1.z);
        const b = lineP1.y - a * lineP1.z;

        const z = calculateP2(quadratic.a, quadratic.b - a, quadratic.c - b);
        const y = [z[0]*a+b, z[1]*a+b];


        /*

        console.log(a, b);

        for (let i = -2; i < 1; i += 0.1) {
            const o = new RODIN.Box(.08, new THREE.MeshNormalMaterial({wireframe: true}));
            this.sourceObject.add(o);
            o.position.set(0, i, P1(a, b, i));
            console.log(0, i, P1(a, b, i));
        }

        for (let i = -2; i < 2; i += 0.1) {
            const o = new RODIN.Box(.08, new THREE.MeshNormalMaterial({wireframe: true}));
            this.sourceObject.add(o);
            o.position.set(0, P2(quadratic.a, quadratic.b,quadratic.c, i), i);
            console.log(0, P2(quadratic.a, quadratic.b,quadratic.c, i), i);
        }
        */




/*        const pointOBJ3 = new RODIN.Box(.05, new THREE.MeshNormalMaterial({wireframe: false}));
        this.sourceObject.add(pointOBJ3);
        pointOBJ3.position.set(0, y[0], z[0]);*/

    /*    const pointOBJ4 = new RODIN.Box(.05, new THREE.MeshNormalMaterial({wireframe: false}));
        this.sourceObject.add(pointOBJ4);
        pointOBJ4.position.set(0, y[1], z[1]);*/

        const v = new THREE.Vector3(0, y[0], z[0]);
        this.sourceObject._threeObject.localToWorld(v);
        return v;

        //for (let i = 0; i < this.segmentsMaxNumber; i++) {
        //    let y = -(i / 10 )*3;
        //
        //    console.log(this.pointsSculpt.children[i].position.x, this.pointsSculpt.children[i].position.z, this.pointsSculpt.children[i].position.y);
        //    console.log("curve at y = " + y, " x = " + (quadratic.a * y * y + quadratic.b * y + quadratic.c));
        //}

        //console.log(lineP1, lineP2);


    }


    checkPoint(point, object, vertex1, vertex2, vertex3) {

        object._threeObject.worldToLocal(point)
        const vertex4 = new THREE.Vector2(point.x, point.y);
        return ptInTriangle(vertex4, vertex1, vertex2, vertex3);
    }





}





function P2(a, b, c, x) {
    return a * x * x + b * x + c;
}


function calculateP2(a, b, c) {
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

function ptInTriangle(p, p0, p1, p2) {
    const A = .5 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
    const sign = A < 0 ? -1 : 1;
    const s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
    const t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;

    return s > 0 && t > 0 && (s + t) < 2 * A * sign;
}