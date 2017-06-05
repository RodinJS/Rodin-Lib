import {ListView} from './listView'
import {Vector3} from '../math'
import * as CONST from '../constants';
import {Plane} from '../sculpt'
import {Scene} from '../scene';
import {Quaternion} from "../math/Quaternion";

/**
 * HorizontalGrid class creates horizontal grid to represent info(thumbs, text etc.) in that grid.
 * @param [width=5] {Number} height of main grid.
 * @param [height=5] {Number} width of main grid.
 * @param [cellWidth=0.5] {Number} width of single cell.
 * @param [cellHeight=0.5] {Number} height of single cell.
 * @param sculpt {Sculpt} Sculpt object.
 */
export class HorizontalGrid extends ListView {
    constructor(width = 5, height = 5, cellWidth = 0.5, cellHeight = 0.5, sculpt) {
        // switched places of width and hight again because of the
        // same issue as above
        sculpt = sculpt || new Plane(width * cellHeight * 1.5, height * cellWidth, 1, 1, new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0
                // wireframe: true
            }));

        super(height, width, cellHeight, cellWidth, sculpt);

        this.ButtonUpEvent = (evt) => {
            this.dragUV = null;
            navigator.mouseGamePad.stopPropagationOnMouseMove = false;

            // again mixed vertical and horizontal, should be horizontal here, but since
            // the cycles in grid.js are in wrong order cant get it done any way
            // more efficiently. fix that, then come back here later
            if (Math.abs(this.verticalOffset / this._cellWidth) - this._minHorizontalScroll >= -0.7) {
                const absVal = Math.abs(this.verticalOffset / this._cellWidth);
                this.scroll(Math.sign(this.verticalOffset) * Math.ceil(absVal));
            }
            this.verticalOffset = 0;
        };

        Scene.active.on(CONST.GAMEPAD_BUTTON_UP, (evt) => {
            this.ButtonUpEvent(evt);
        });

        this._gamepadMove = (evt) => {
            // check the case when things are already moving,
            // then you press again
            if (this.dragUV) {
                this.verticalOffset = this.sculpt.width * (this.dragUV.x - evt.uv.x);
            }
        };

        this.sculpt.on(CONST.GAMEPAD_MOVE, (evt) => {
            this._gamepadMove(evt);
        });

    }

    /**
     * Thumbs scrolling speed/quantity.
     * @param val {Number} Setter for thumbs scrolling speed/quantity.
     */
    set minScroll(val) {
        this._minHorizontalScroll = val;
    }

    /**
     * Not sure why we need to switch x and y places, will look into this later
     * @param i {Number} index number
     * @param j {Number} index number
     * @param centerPos {Number}
     * @returns {Vector3}
     */
    getIndexProperties(i, j, centerPos) {
        return {
            position: new Vector3(i * this._cellWidth - centerPos.y, centerPos.x - j * this._cellHeight, 0),
            quaternion: new Quaternion()
        };
    }

    _getCenterPos(pWidth, pHeight) {
        //return new Vector3(pHeight * this._cellHeight / 2 - this._cellHeight / 2 + this._verticalOffset, pWidth * this._cellWidth / 2 - this._cellWidth / 2 + this._horizontalOffset, 0);
        //return new Vector3(0, 0, 0);
        return new Vector3(pWidth * this._cellHeight / 2 - this._cellHeight / 2 + this._horizontalOffset, pHeight * this._cellWidth / 2 - this._cellWidth / 2 + this._verticalOffset, 0);
    }
}