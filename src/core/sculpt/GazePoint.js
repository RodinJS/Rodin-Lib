import {Sculpt} from './Sculpt';

/**
 * A simple gaze point class for cardboard controller or any other gazing selection based controller
 * @param point object {Sculpt}
 */
//TODO: @Aram, @Gor, This is not a place for gazepoint! if it is at least inherit it from sculpt
export class GazePoint {
    constructor (sculpt = null) {

        if (!sculpt) {
            const geometry = new THREE.RingGeometry(.001, 0.01, 32);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                depthTest: false,
                transparent: true
            });

            sculpt = new Sculpt(new THREE.Mesh(geometry, material));
            sculpt.on('ready', () => {
                sculpt._threeObject.renderOrder = 10000;
            });
            /**
             * The default distance from the camera, when not intersected with any object.
             * @type {number}
             */
            this.defaultDistance = 3;
            /**
             * Set to any value >0 to keep it on that fixed distance all the time.
             * @type {number}
             */
            this.fixedDistance = 0;
        }

        this.Sculpt = sculpt;
        sculpt._threeObject.renderOrder = 10000;

        this.Sculpt.on('update', (evt) => {
            if (!this.controller) return;
            if(this.fixedDistance) {
                evt.target.position.z = -this.fixedDistance;
                return;
            }

            if (this.controller.intersected.length === 0
                || this.controller.intersected.length ===1 && this.controller.intersected[0].distance === Infinity) {
                evt.target.position.z = -this.defaultDistance;
            } else {
                evt.target.position.z = -this.controller.intersected[0].distance + .02;
            }
        })
    }
}