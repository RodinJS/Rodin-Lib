import { Raycastables } from '../controllers/objects';
import { ErrorNoSceneProvided } from '../error';

import {Scene} from '../scene';

/**
 * Class Raycaster, just an easier way to use THREE.JS raycasting
 * @param {!THREE.Scene} _scene - the scene where the raycasting happens
 */
export class Raycaster extends THREE.Raycaster {
    constructor(_scene) {
        super();
        let scene = _scene;
        this.setScene = _scene => scene = _scene;
        this.getScene = () => scene;
    }

    /**
     * Raycast
     * @returns [Sculpt] all raycasted objects from the Raycastables array, that ar appended to the scene (directly or not).
     */
    raycast() {
        let scene = this.getScene();
        if (!scene) {
            throw new ErrorNoSceneProvided();
        }

        let ret = [];
        let intersects = this.intersectObjects(Raycastables);

        for (let i = 0; i < intersects.length; i++) {
            let centerObj = intersects[i].object;
            if (!centerObj) continue;

            while (centerObj && !centerObj.Sculpt && centerObj.parent !== scene) {
                if (centerObj.stopPropagation) {
                    break;
                }
                centerObj = centerObj.parent;
            }

            if (!centerObj || !centerObj.Sculpt) continue;

            ret.push(intersects[i]);
            // let parentObj = centerObj.Sculpt._threeObject.parent;
            // while (parentObj) {
            //     if (parentObj === scene) {
            //         ret.push(intersects[i]);
            //         break;
            //     }
            //     parentObj = parentObj.parent;
            // }
        }

        return ret;
    }
}
