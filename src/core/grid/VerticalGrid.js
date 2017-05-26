import {Grid} from './Grid'
import {Vector3} from '../math'
import * as CONST from '../constants';
import {Plane} from '../sculpt'
import {Scene} from '../scene';

export class VerticalGrid extends Grid {
    constructor(width = 5, height = 5, cellWidth = 0.5, cellHeight = 0.5) {
        super(new Plane(width * cellWidth, height * cellHeight * 2, 1, 1, new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0
        })), width, height, cellWidth, cellHeight);

        this.sculpt.transparent = true;
        this.sculpt.opacity = 0;


        Scene.active.on(CONST.GAMEPAD_BUTTON_UP, () => {
            this.dragUV = null;
            navigator.mouseGamePad.stopPropagationOnMouseMove = false;
            if (Math.abs(this.verticalOffset / this._cellHeight) >= this._minVerticalScroll) {
                this.scroll(this.verticalOffset / this._cellHeight);
            }
            this.verticalOffset = 0;
        });

        this.sculpt.on(CONST.GAMEPAD_MOVE, (evt) => {
            // check the case when things are already moving,
            // then you press again
            if (this.dragUV) {
                this.verticalOffset = this.sculpt.height * (this.dragUV.y - evt.uv.y);
            }
        });

    }

    set minScroll(val) {
        this._minVerticalScroll = val;
    }

    getIndexPosition(i, j, centerPos) {
        return new Vector3(j * this._cellWidth - centerPos.x, i * this._cellHeight - centerPos.y, 0);
    }

}