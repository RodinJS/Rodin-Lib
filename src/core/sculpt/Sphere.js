import {Sculpt} from './Sculpt';

export class Sphere extends Sculpt {
    constructor(radius = .2, widthSegments = 10, heightSegments = 10, material = new THREE.MeshBasicMaterial({color: 336699})) {
        const threeSphere = new THREE.Mesh(new THREE.SphereGeometry(radius, widthSegments, heightSegments), material);
        super(threeSphere);
    }
}