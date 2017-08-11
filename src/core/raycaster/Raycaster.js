import {Scene} from '../scene';
import {Sculpt} from '../sculpt';
import {Box} from '../sculpt/Box';
import {Sphere} from '../sculpt/Sphere';
import {Vector3} from '../math/Vector3';
import * as utils from '../utils';
import * as RodinMath from '../math';

// todo: remove this sheet.
let allChildren = (obj) => {
    // todo: fix this with one loop
    let currChildren = new Set(obj.children.filter(i => i.isReady).map(i => i._threeObject));
    for (let i = 0; i < obj.children.length; i++) {
        allChildren(obj.children[i]).forEach(child => {
            currChildren.add(child);
        });
    }

    // todo: remove this sheet later.
    if (obj._threeObject) {
        for (let i = 0; i < obj._threeObject.children.length; i++) {
            currChildren.add(obj._threeObject.children[i]);
        }
    }

    return currChildren;
};


/**
 * Raycaster, just an easier way to use THREE.JS raycasting
 */
export class Raycaster extends THREE.Raycaster {
    constructor() {
        super();
    }

    /**
     * Raycast
     * @param {number} [depth = Infinity] the raycasting layers depth
     * @returns {Sculpt[]} all raycasted objects from the gamepadVisibles array, that are children of the scene (directly or not).
     */
    raycast(depth = Infinity) {
        if (!Scene.isRendering) {
            return null;
        }

        const ret = [];
        const used = {};

        let intersects = this.intersectObjects(Sculpt.raycastables);

        for (let i = 0; i < intersects.length; i++) {
            let centerObj = intersects[i].object;
            if (!centerObj) continue;

            while (centerObj && !centerObj.Sculpt && (centerObj.parent && !centerObj.parent.isScene)) {
                centerObj = centerObj.parent;
            }
            if (centerObj.Sculpt && centerObj.Sculpt.globalVisible && centerObj.Sculpt.gamepadVisible && !used[utils.object.getId(centerObj.Sculpt)]) {
                used[utils.object.getId(centerObj.Sculpt)] = true;
                ret.push({
                    sculpt: centerObj.Sculpt,
                    uv: intersects[i].uv,
                    face: intersects[i].face,
                    faceIndex: intersects[i].faceIndex,
                    point: intersects[i].point,
                    distance: intersects[i].distance
                });
            }
        }

        ret.push({
            sculpt: Scene.active,
            uv: null,
            face: null,
            faceIndex: null,
            point: null,
            distance: Infinity
        });

        if (ret.length > depth) ret.length = depth; // ret.splice(depth, ret.length - 1 - depth);

        return ret;
    }

    setFromCamera(vec, camera) {
        super.setFromCamera(vec, camera._threeCamera);
    }

    setFromSculpt(sculpt) {
        this.sourceObject = sculpt;
    }


    /*
     distance : 3.316217652662681
     face : ct
     faceIndex : 1
     object : Et
     point : c
     uv : i
     */



    raycastCurve(curve, closestFace = true) {
        if (!Scene.isRendering) {
            return null;
        }

        const ret = [];
        const used = {};
        //console.log(curve)
        //debugger;

        //console.time("curve");
        let intersects = this.intersectObjectsWithCurve(curve, Sculpt.raycastables, closestFace);

        //console.timeEnd("curve");

        for (let i = 0; i < intersects.length; i++) {
            let centerObj = intersects[i].object;
            if (!centerObj) continue;

            while (centerObj && !centerObj.Sculpt && (centerObj.parent && !centerObj.parent.isScene)) {
                centerObj = centerObj.parent;
            }
            if (centerObj.Sculpt && centerObj.Sculpt.globalVisible && centerObj.Sculpt.gamepadVisible && !used[utils.object.getId(centerObj.Sculpt)]) {
                used[utils.object.getId(centerObj.Sculpt)] = true;
                ret.push({
                    sculpt: centerObj.Sculpt,
                    uv: intersects[i].uv,
                    face: intersects[i].face,
                    faceIndex: intersects[i].faceIndex,
                    point: intersects[i].point,
                    distance: intersects[i].distance
                });
            }
        }

        ret.push({
            sculpt: Scene.active,
            uv: null,
            face: null,
            faceIndex: null,
            point: null,
            distance: Infinity
        });

        //if (ret.length > depth) ret.length = depth; // ret.splice(depth, ret.length - 1 - depth);


        return ret;
    }


    intersectObjectsWithCurve(curve, objects) {
        //todo try to do loacaltoworld of the plane instead of three points
        const objLength = objects.length;
        let obj = null;
        let oi = 0;
        const ret = [];
        //let t = .0;
        while (oi < objLength) {
            obj = objects[oi];
            if (!obj.geometry.boundingSphere) {
                obj.geometry.computeBoundingSphere();
            }
            obj.updateMatrixWorld();
            const faces = obj.geometry.faces;
            const vertices = obj.geometry.vertices;
            const len = faces.length;

            let fi = 0;
            let intersected = false;
            const intersectedFaces = [];
            const intersectedFaceIds = [];
            const intersectedPoints = [];
            const intersectedDistances = [];
            const objNormalMat = new THREE.Matrix3().getNormalMatrix(obj.matrixWorld);
            const globalPos = obj.Sculpt.globalPosition;
            while (fi < len) {
                const face = faces[fi];
                const vertex1 = vertices[face.a];
                const vertex2 = vertices[face.b];
                const vertex3 = vertices[face.c];
                const globalNormal = face.normal.clone().applyMatrix3(objNormalMat);
                const plane = this.getPlaneEquation(obj.localToWorld(vertex1.clone()), null, null, globalNormal);
                const intersectionPoints = RodinMath.getIntersectionsPlaneParabola(plane, curve);
                let ii = 0;
                //let t_ = Date.now();
                const iLen = intersectionPoints.length;
                while(ii < iLen){
                    if (this.checkPoint(intersectionPoints[ii].position, obj, vertex1, vertex2, vertex3, globalPos)) {
                        intersected = true;
                        intersectedFaces.push(face);
                        intersectedFaceIds.push(fi);
                        intersectedPoints.push(intersectionPoints[ii].position);
                        intersectedDistances.push(Math.abs(intersectionPoints[ii].distance));
                        break;
                    }
                    ii++;
                }
                //t = t + Date.now() - t_;
                ++fi;
            }
            if (intersected) {
                let pointIter = intersectedFaces.length - 1;
                let d = intersectedDistances[pointIter];
                let closestId = pointIter;
                while (--pointIter >= 0) {
                    if (d > intersectedDistances[pointIter]) {
                        d = intersectedDistances[pointIter];
                        closestId = pointIter;
                    }
                }
                ret.push({
                    object: obj,
                    uv: null,
                    face: intersectedFaces[closestId],
                    faceIndex: intersectedFaceIds[closestId],
                    point: intersectedPoints[closestId],
                    distance: intersectedDistances[closestId]
                });
            }
            ++oi;
        }
        //console.log(t)
        return ret;
    }


    getPlaneEquation(point1, point2, point3, normal) {
        if (normal) {
            return {normal: normal, shift: -(normal.x * point1.x + normal.y * point1.y + normal.z * point1.z)};
        }
        const vecA = new Vector3(point2.x - point1.x, point2.y - point1.y, point2.z - point1.z);
        const vecB = new Vector3(point3.x - point1.x, point3.y - point1.y, point3.z - point1.z);
        const vecN = ((new Vector3()).crossVectors(vecA, vecB)).normalize();
        const d = -(vecN.x * point1.x + vecN.y * point1.y + vecN.z * point1.z);
        /*         let planeGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
         const plane = new Sculpt(new THREE.Mesh(planeGeometry, new THREE.MeshNormalMaterial({
         wireframe: false,
         transparent: true,
         opacity: 0.4,
         side: THREE.DoubleSide
         })));
         Scene.add(plane);
         plane._threeObject.lookAt(vecN);
         const planePos = (new Vector3(vecN.x, vecN.y, vecN.z)).multiplyScalar(-d);
         plane.position.set(planePos.x, planePos.y, planePos.z);*/
        return {normal: vecN, shift: d};
    }


    getIntersectionLine(plane1, plane2) {

        //console.log(plane2.normal.x, plane2.normal.y, plane2.normal.z);

        const a1 = plane1.normal.x;
        const c1 = plane1.normal.z;
        const d1 = plane1.shift;

        const a2 = plane2.normal.x;
        const c2 = plane2.normal.z;
        const d2 = plane2.shift;


        const z = (a1 * d2 - a2 * d1) / (a2 * c1 - a1 * c2);
        const x = -(d1 + c1 * z) / a1;
        const y = 0;

        const v1 = plane1.normal.normalize();
        const v2 = plane2.normal.normalize();
        const n = new Vector3().crossVectors(v2, v1).normalize();
        const p = new Vector3(x, y, z);

        // console.log("plane normal is: " + x + ", " + y + ", " + z);
        /*        const h1 = new THREE.ArrowHelper(n, p, 4, 0xffffff);
         Scene.add(new Sculpt(h1));*/

        return {n: n, p: p};
    }

    getIntersectionPoints(curve, lineP1, lineP2) {
        const line = new RodinMath.Line();
        line.fromTwoPoints(lineP1, lineP2);
        const points = RodinMath.getIntersections(line, curve);
        /*

         for (let i = -20; i < 20; i += 0.3) {
         const o = new Box(.08, new THREE.MeshNormalMaterial({wireframe: true}));
         Scene.add(o);
         o.position.copy(line.eval(i));
         }


         for (let i = -20; i < 20; i += 0.3) {
         const o = new Box(.08, new THREE.MeshNormalMaterial({wireframe: true}));
         Scene.add(o);
         o.position.copy(curve.eval(i));
         }



         const pointOBJ3 = new Box(.15, new THREE.MeshNormalMaterial({wireframe: false}));
         //this.sourceObject.add(pointOBJ3);
         //pointOBJ3.position.set(0, y[0], z[0]);
         Scene.add(pointOBJ3);
         pointOBJ3.position.copy(points[0]);


         const pointOBJ4 = new Box(.15, new THREE.MeshNormalMaterial({wireframe: false}));
         //this.sourceObject.add(pointOBJ4);
         //pointOBJ4.position.set(0, y[1], z[1]);
         Scene.add(pointOBJ4);
         pointOBJ4.position.copy(points[1]);
         //pointOBJ4.position.copy(new Vecto r3(-1 / 2, 1,-3));

         console.log(points);
         */
        return points;
    }

    checkPoint(point, object, vertex1, vertex2, vertex3, pos) {
        const dx = point.x - pos.x;
        const dy = point.y - pos.y;
        const dz = point.z - pos.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d > object.geometry.boundingSphere.radius) {
            return false;
        }
        const p2 = new Vector3(point.x, point.y, point.z);
        object.worldToLocal(p2);
        const vertex = {x: p2.x, y: p2.y};
        return RodinMath.pointInTriangle(vertex, vertex1, vertex2, vertex3);
    }

}


