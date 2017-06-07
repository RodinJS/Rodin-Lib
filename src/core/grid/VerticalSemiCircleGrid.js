import {VerticalGrid} from './VerticalGrid'
import {Vector3} from '../math'
import * as CONST from '../constants';
import {Cylinder} from '../sculpt'
import {Scene} from '../scene';
import {Quaternion} from "../math/Quaternion";
import {RodinEvent} from '../rodinEvent';

/**
 * VerticalSemiCircleGrid class creates vertical semicircle grid to represent info(thumbs, text etc.) in that grid.
 * @param [width=5] {Number} width of the main grid.
 * @param [height=5] {Number} height of the main grid.
 * @param [cellWidth=0.5] {Number} width of a single cell.
 * @param [cellHeight=0.5] {Number} height of a single cell.
 * @param [radius=3] {Number} radius of the main grid.
 */
export class VerticalSemiCircleGrid extends VerticalGrid {
    constructor(width = 5, height = 5, cellWidth = 0.5, cellHeight = 0.5, radius = 3, sculpt) {

        sculpt = sculpt || new Cylinder(radius, radius, height * cellHeight * 1.2, width, height, true, -Math.PI / 2, -Math.PI, new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0
                // wireframe: true
            }));

        super(width, height, cellWidth, cellHeight, sculpt);
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
     * @returns {Object} Object which contains Vector3 and Quaternion.
     */
    getIndexProperties(i, j, centerPos) {
        const pwidth = this._width + this._verticalPadLength * 2;

        j = (j / (pwidth - 1) - 1) * Math.PI - Math.PI / 2;

        const alpha = j;// * this._cellWidth - centerPos.x;
        const x = this._radius * Math.sin(-alpha);// + centerPos.x;
        const y = centerPos.y - i * this._cellHeight;


        const z = this._radius * Math.cos(alpha);
        return {
            position: new Vector3(x, y, z),
            quaternion: new Quaternion().setFromAxisAngle({x: 0, y: 1, z: 0}, Math.PI - alpha)
        };
    }
}