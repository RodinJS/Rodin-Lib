import {VerticalGrid} from './VerticalGrid'
import {Vector3} from '../math'
import * as CONST from '../constants';
import {Plane} from '../sculpt'
import {Scene} from '../scene';

export class VerticalSemiCircleGrid extends VerticalGrid {
    constructor(width = 5, height = 5, cellWidth = 0.5, cellHeight = 0.5, radius) {
        super(width, height, cellWidth, cellHeight);
        this._radius = radius;
    }


    getIndexPosition(i, j, centerPos) {
        const pwidth = this._width + this._verticalPadLength * 2;

        j = (j / pwidth - 1) * Math.PI * 2;

        const alpha = j * this._cellWidth - centerPos.x;
        const x = this._radius * Math.sin(alpha);
        const y = centerPos.y - i * this._cellHeight;


        const z = this._radius * Math.cos(alpha);
        return new Vector3(x, y, z);
    }
}