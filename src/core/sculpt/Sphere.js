import {Sculpt} from './Sculpt';

/**
 * Simple Sphere
 * @param radius {number} sphere radius
 * @param widthSegments {number}
 * @param heightSegments {number}
 * @param material {THREE.Material}
 */
export class Sphere extends Sculpt {
    constructor(radius = .2, widthSegments = 10, heightSegments = 10, material = new THREE.MeshBasicMaterial({color: 336699})) {
        const threeSphere = new THREE.Mesh(new THREE.SphereGeometry(radius, widthSegments, heightSegments), material);
        super(threeSphere);
    }

    get isSphere() {
        return true
    }
}