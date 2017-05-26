import {Grid} from './Grid'
import {Vector3} from '../math'
import * as CONST from '../constants';
import {Plane} from '../sculpt'
import {Scene} from '../scene';

export class HorizontalGrid extends Grid {
    constructor(width = 5, height = 5, cellWidth = 0.5, cellHeight = 0.5) {
        super(new Plane(width * cellWidth * 2, height * cellHeight, 1, 1, new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0
        })), width, height, cellWidth, cellHeight);


        Scene.active.on(CONST.GAMEPAD_BUTTON_UP, () => {
            this.dragUV = null;
            navigator.mouseGamePad.stopPropagationOnMouseMove = false;

            // again mixed vertical and horizontal, should be horizontal here, but since
            // the cycles in grid.js are in wrong order cant get it done any way
            // more efficiently. fix that, then come back here later
            if (Math.abs(this.verticalOffset / this._cellWidth) >= this._minHorizontalScroll) {
                this.scroll(this.verticalOffset / this._cellWidth);
            }
            this.verticalOffset = 0;
        });

        this.sculpt.on(CONST.GAMEPAD_MOVE, (evt) => {
            // check the case when things are already moving,
            // then you press again
            if (this.dragUV) {
                this.verticalOffset = this.sculpt.width * (this.dragUV.x - evt.uv.x);
            }
        });

    }

    set minScroll(val) {
        this._minHorizontalScroll = val;
    }

    /**
     * Not sure why we need to switch x and y places, will look into this later
     * @param i
     * @param j
     * @param centerPos
     * @returns {Vector3}
     */
    getIndexPosition(i, j, centerPos) {
        return new Vector3(i * this._cellWidth - centerPos.y, j * this._cellHeight - centerPos.x, 0);
    }
}