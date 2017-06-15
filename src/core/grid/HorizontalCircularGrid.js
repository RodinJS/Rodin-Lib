import {HorizontalGrid} from './HorizontalGrid'
import {Vector3} from '../math'
import * as CONST from '../constants';
import {Cylinder} from '../sculpt'
import {Scene} from '../scene';
import {Quaternion} from "../math/Quaternion";
import {RodinEvent} from '../rodinEvent';

/**
 * HorizontalSemiCircleGrid class creates horizontal semicircle grid to represent info(thumbs, text etc.) in that grid.
 * @param [width=5] {Number} height of the main grid.
 * @param [height=5] {Number} width of the main grid.
 * @param [cellWidth=0.5] {Number} width of a single cell.
 * @param [cellHeight=0.5] {Number} height of a single cell.
 * @param [radius=3] {Number} radius of the main grid.
 * @param [angle=Math.PI] {Number} Angle of the grid.
 */
export class HorizontalCircularGrid extends HorizontalGrid {
    constructor(width = 5, height = 5, cellWidth = 0.5, cellHeight = 0.5, radius = 3, angle = Math.PI, sculpt) {

        sculpt = sculpt || new Cylinder(radius, radius, height * cellHeight, width, height, true, angle / 2 - Math.PI, -angle, new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0
                //wireframe: true
            }));

        super(width, height, cellHeight, cellWidth, sculpt);

        this._angle = angle;

        this._gamepadMove = (evt) => {
            if (this.dragUV) {
                this.horizontalOffset = this.dragUV.x - evt.uv.x;
            }

            if (Math.abs(this.horizontalOffset) > this._angle * 0.01 && !this._startEventEmited) {
                this.emit(CONST.SCROLL_START, new RodinEvent(this));
                this._startEventEmited = true;
            }
        };

        this.ButtonUpEvent = (evt) => {
            this.dragUV = null;
            navigator.mouseGamePad.stopPropagationOnMouseMove = false;

            const scrolledElementCount = this._radius * Math.sin(this.horizontalOffset * this._angle) / this._cellWidth;

            if (Math.abs(scrolledElementCount) - this._minHorizontalScroll >= -0.7) {
                const absVal = Math.abs(scrolledElementCount);
                this.scroll(Math.sign(scrolledElementCount) * Math.ceil(absVal));
            }
            this.horizontalOffset = 0;
        };

        this._radius = radius;
    }

    _getMainSculpt() {
        if (this.sculpt)
            return this.sculpt;


        // return new Plane(this._width * this._cellWidth * 2, this._height * this._cellHeight, 1, 1, new THREE.MeshBasicMaterial({
        //     color: 0xffffff,
        //     transparent: true,
        //     opacity: 0
        //     // wireframe: true
        // }));
    }

    /**
     * @param i {Number} index number
     * @param j {Number} index number
     * @param centerPos {Number}
     * @returns {Vector3}
     */
    getIndexProperties(i, j, centerPos) {
        const pheight = this._height + this._horizontalPadLength * 2;

        i = (i / (pheight - 1) - 1) * this._angle + this._angle / 2 - Math.PI - this.horizontalOffset * this._angle;

        const alpha = i;// * this._cellWidth - centerPos.x;
        const x = this._radius * Math.sin(-alpha);// + centerPos.x;
        const y = centerPos.x - j * this._cellHeight;


        const z = this._radius * Math.cos(alpha);
        return {
            position: new Vector3(x, y, z),
            quaternion: new Quaternion().setFromAxisAngle({x: 0, y: 1, z: 0}, Math.PI - alpha)
        };
    }

    _getCenterPos(pWidth, pHeight) {
        //return new Vector3(pHeight * this._cellHeight / 2 - this._cellHeight / 2 + this._verticalOffset, pWidth * this._cellWidth / 2 - this._cellWidth / 2 + this._horizontalOffset, 0);
        //return new Vector3(0, 0, 0);
        return new Vector3(pWidth * this._cellHeight / 2 - this._cellHeight / 2, pHeight * this._cellWidth / 2 - this._cellWidth / 2, 0);
    }

}