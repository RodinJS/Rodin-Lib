import {ListView} from './listView'
import {Vector3} from '../math'
import * as CONST from '../constants';
import {Plane} from '../sculpt'
import {Scene} from '../scene';
import {Quaternion} from "../math/Quaternion";
import {RodinEvent} from '../rodinEvent';

/**
 * VerticalGrid class creates vertical grid to represent info(thumbs, text etc.) in that grid.
 * @param [width=5] {Number} width of the main grid.
 * @param [height=5] {Number} height of the main grid.
 * @param [cellWidth=0.5] {Number} width of a single cell.
 * @param [cellHeight=0.5] {Number} height of a single cell.
 */
export class VerticalGrid extends ListView {
    constructor(width = 5, height = 5, cellWidth = 0.5, cellHeight = 0.5, sculpt) {

        sculpt = sculpt || new Plane(width * cellWidth, height * cellHeight * 1.2, 1, 1, new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0
                // wireframe: true
            }));

        super(width, height, cellWidth, cellHeight, sculpt);

        this.ButtonUpEvent = () => {
            this.dragUV = null;
            navigator.mouseGamePad.stopPropagationOnMouseMove = false;
            if (Math.abs(this.verticalOffset / this._cellHeight) - this._minVerticalScroll >= -0.7) {
                const absVal = Math.abs(this.verticalOffset / this._cellHeight);
                this.scroll(Math.sign(this.verticalOffset) * Math.ceil(absVal));
            }
            this.verticalOffset = 0;
        };

        Scene.active.on(CONST.GAMEPAD_BUTTON_UP, this.ButtonUpEvent);

        this.sculpt.on(CONST.GAMEPAD_MOVE, (evt) => {
            // check the case when things are already moving,
            // then you press again
            if (this.dragUV) {
                this.verticalOffset = this.sculpt.height * (evt.uv.y - this.dragUV.y);
            }

            if (Math.abs(this.verticalOffset) > 0.1 * this._cellWidth && !this._startEventEmited) {
                this.emit(CONST.SCROLL_START, new RodinEvent(this));
                this._startEventEmited = true;
            }
        });
    }

    /**
     * Thumbs scrolling speed/quantity.
     * @param val {Number} Setter for thumbs scrolling speed/quantity.
     */
    set minScroll(val) {
        this._minVerticalScroll = val;
    }

    /**
     * @param i {Number} index number
     * @param j {Number} index number
     * @param centerPos {Number}
     * @returns {Object} Object which contains Vector3 and Quaternion.
     */
    getIndexProperties(i, j, centerPos) {
        return {
            position: new Vector3(j * this._cellWidth - centerPos.x, centerPos.y - i * this._cellHeight, 0),
            quaternion: new Quaternion()
        };
    }
}