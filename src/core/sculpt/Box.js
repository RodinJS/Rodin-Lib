import {Sculpt} from './Sculpt';

/**
 * Simple Box
 * @param width {number} box width
 * @param height {number} box height
 * @param depth {number} box depth
 * @param material {THREE.Material}
 */
export class Box extends Sculpt {
    constructor(width = .5, height = .5, depth = .5, material = new THREE.MeshBasicMaterial({color: 336699})) {
        const threeBox = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
        super(threeBox);
    }
}
