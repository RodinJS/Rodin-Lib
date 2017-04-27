import {Scene} from '../scene';

let allChildren = (obj) => {
    // todo: fix this with one loop
    let currChilds = obj.children.filter(i => i.isReady).map(i => i._threeObject);
    for (let i = 0; i < obj.children.length; i++) {
        currChilds = currChilds.concat(allChildren(obj.children[i]));
    }

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
        let ret = [];
        // todo: implement gamepadVisibles logic with messenger
        let intersects = this.intersectObjects(allChildren(Scene.active));

        for (let i = 0; i < intersects.length; i++) {
            let centerObj = intersects[i].object;
            if (!centerObj) continue;

            while (centerObj && !centerObj.Sculpt && centerObj.parent !== Scene.active) {
                centerObj = centerObj.parent;
            }

            if (centerObj.Sculpt.globalVisible && centerObj.Sculpt.gamepadVisible) {
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