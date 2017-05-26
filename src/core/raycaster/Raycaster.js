import {Scene} from '../scene';
import * as utils from '../utils';

let allChildren = (obj) => {
    // todo: fix this with one loop
    let currChilds = new Set(obj.children.filter(i => i.isReady).map(i => i._threeObject));
    for (let i = 0; i < obj.children.length; i++) {
        allChildren(obj.children[i]).forEach(child => {
            currChilds.add(child);
        });
    }

    // todo: remove this sheet later.
    if (obj._threeObject)
        for (let i = 0; i < obj._threeObject.children.length; i++)
            currChilds.add(obj._threeObject.children[i]);

    return currChilds;
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
        const ret = [];
        const used = {};

        // todo: implement gamepadVisibles logic with messenger
        let intersects = this.intersectObjects(Array.from(allChildren(Scene.active)));

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
                    distance: intersects[i].distance
                });
            }
        }

        ret.push({
            sculpt: Scene.active,
            uv: null,
            distance: Infinity
        });

        if (ret.length > depth) ret.splice(depth, ret.length - 1 - depth);

        return ret;
    }

    setFromCamera(vec, camera) {
        super.setFromCamera(vec, camera._threeCamera);
    }
}