import {Scene} from '../scene/index.js';
import {Sculpt} from '../sculpt/index.js';
import {Vector3} from '../math/Vector3.js';
import * as utils from '../utils/index.js';
import * as RodinMath from '../math/index.js';

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
    raycast(depth = Infinity, objects) {
        if (!Scene.isRendering) {
            return null;
        }

        const ret = [];
        const used = {};
        const raycastableMeshes = [];
        let intersects = [];
        if(objects){
            for (let i = 0; i < objects.length; i++) {
                if(objects[i]._threeObject && objects[i].scene === Scene.active) {
                    raycastableMeshes.push(objects[i]._threeObject);
                }
            }
            intersects = this.intersectObjects(raycastableMeshes);
        } else {
            intersects = this.intersectObjects(Sculpt.raycastables.filter(s => s.Sculpt.scene === Scene.active));
        }


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

        if (ret.length > depth) ret.length = depth;

        return ret;
    }

    setFromCamera(vec, camera) {
        super.setFromCamera(vec, camera._threeCamera);
    }

    set distance(distance) {
        this._distance = distance;
        this.closest = distance;
    }

    get distance(){
        return this._distance
    }

    raycastCurve(curve, objects) {
        if (!Scene.isRendering) {
            return null;
        }
        const ret = [];
        const used = {};

        //console.time("curve");
        let intersects = this.intersectObjectsWithCurve(curve.clone(), objects ? objects.filter(s => s.scene === Scene.active) : Sculpt.raycastables.filter(s => s.Sculpt.scene === Scene.active));
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
        return ret;
    }

    intersectObjectsWithCurve(curve, objects) {
        const objLength = objects.length;
        let obj = null;
        let oi = 0;
        const ret = [];
        let closest = this._distance;
        while (oi < objLength) {
            obj = objects[oi];
            if(obj.hasOwnProperty("_threeObject")){
                obj =  obj._threeObject;
            }
            if (!obj.geometry.boundingSphere) {
                obj.geometry.computeBoundingSphere();
            }
            obj.updateMatrixWorld();
            const faces = obj.geometry.faces;
            const vertices = obj.geometry.vertices;
            const fLen = faces.length;
            let intersected = false;
            const intersectedFaces = [];
            const intersectedFaceIds = [];
            const intersectedPoints = [];
            const intersectedDistances = [];
            curve.matrix = new THREE.Matrix4().getInverse(obj.matrixWorld).elements;
            let fi = 0;
            while (fi < fLen) {
                const face = faces[fi];
                const vertex1 = vertices[face.a];
                const vertex2 = vertices[face.b];
                const vertex3 = vertices[face.c];
                const plane = this.getPlaneEquation(vertex1, null, null, face.normal, obj);
                const intersectionPoints = curve.intersectWithPlane(plane);
                let ii = 0;
                const iLen = intersectionPoints.length;

                while (ii < iLen) {
                    if (intersectionPoints[ii].distance > 0 && this.checkPoint(intersectionPoints[ii].position, obj, vertex1, vertex2, vertex3, face.normal)) {
                        intersected = true;
                        intersectedFaces.push(face);
                        intersectedFaceIds.push(fi);
                        intersectedPoints.push(intersectionPoints[ii].position);
                        intersectedDistances.push(intersectionPoints[ii].distance);
                        break;
                    }
                    ii++;
                }
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
                    point: (new Vector3(intersectedPoints[closestId].x, intersectedPoints[closestId].y, intersectedPoints[closestId].z)),
                    distance: intersectedDistances[closestId]
                });

                if(intersectedDistances[closestId] < closest) {
                    closest = intersectedDistances[closestId];
                }
            }
            ++oi;
        }
        this.closest = closest;
        return ret;
    }


    getPlaneEquation(point1, point2, point3, normal) {
        if (normal) {
            const d = (normal.x * point1.x + normal.y * point1.y + normal.z * point1.z);
            return {normal: normal, shift: d};
        }
        const vecA = new Vector3(point2.x - point1.x, point2.y - point1.y, point2.z - point1.z);
        const vecB = new Vector3(point3.x - point1.x, point3.y - point1.y, point3.z - point1.z);
        const vecN = ((new Vector3()).crossVectors(vecA, vecB)).normalize();
        const d = -(vecN.x * point1.x + vecN.y * point1.y + vecN.z * point1.z);
        return {normal: vecN, shift: d};
    }


    getIntersectionLine(plane1, plane2) {

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

        return {n: n, p: p};
    }


    checkPoint(point, object, vertex1, vertex2, vertex3) {
        const dx = point.x;
        const dy = point.y;
        const dz = point.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (isNaN(d) || d > object.geometry.boundingSphere.radius) {
            return false;
        }

        const S = RodinMath.triangleArea(vertex1, vertex2, vertex3);
        const S1 = RodinMath.triangleArea(vertex1, vertex2, point);
        const S2 = RodinMath.triangleArea(vertex1, point, vertex3);
        const S3 = RodinMath.triangleArea(point, vertex2, vertex3);
        return S - (S1 + S2 + S3) > -0.01;
    }

}

