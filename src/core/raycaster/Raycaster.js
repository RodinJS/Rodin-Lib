import {Scene} from '../scene';

let allChilds = (obj) => {
    let currChilds = obj.children.map(i => i._threeObject);
    for(let i = 0; i < obj.children.length; i ++) {
        currChilds = currChilds.concat(allChilds(obj.children[i]));
    }

    return currChilds;
};


/**
 * Class Raycaster, just an easier way to use THREE.JS raycasting
 * @param {!THREE.Scene} _scene - the scene where the raycasting happens
 */
export class Raycaster extends THREE.Raycaster {
    constructor() {
        super();
    }

    /**
     * Raycast
     * @returns [Sculpt] all raycasted objects from the Raycastables array, that ar appended to the scene (directly or not).
     */
    raycast() {
        let ret = [];
        // todo: implement raycastables logic with messenger
        let intersects = this.intersectObjects(allChilds(Scene.active));

        for (let i = 0; i < intersects.length; i++) {
            let centerObj = intersects[i].object;
            if (!centerObj) continue;

            while (centerObj && !centerObj.Sculpt && centerObj.parent !== Scene.active) {
                centerObj = centerObj.parent;
            }

            ret.push({
                sculpt: centerObj.Sculpt,
                uv: intersects[i].uv,
                distance: intersects[i].distance
            });
        }

        ret.push({
            sculpt: Scene.active,
            uv: null,
            distance: Infinity
        });

        return ret;
    }
}