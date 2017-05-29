import {VerticalGrid} from './VerticalGrid'
import {Vector3} from '../math'
import * as CONST from '../constants';
import {Cylinder} from '../sculpt'
import {Scene} from '../scene';
import {Quaternion} from "../math/Quaternion";

export class VerticalSemiCircleGrid extends VerticalGrid {
    constructor(width = 5, height = 5, cellWidth = 0.5, cellHeight = 0.5, radius = 3, sculpt) {

        sculpt = sculpt || new Cylinder(radius, radius, height * cellHeight * 2, width, height, true, -Math.PI / 2, -Math.PI, new THREE.MeshBasicMaterial({
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
        console.log(this._radius, this._radius, this._width * this._cellWidth);


        // return new Plane(this._width * this._cellWidth * 2, this._height * this._cellHeight, 1, 1, new THREE.MeshBasicMaterial({
        //     color: 0xffffff,
        //     transparent: true,
        //     opacity: 0
        //     // wireframe: true
        // }));
    }

    getIndexProperties(i, j, centerPos) {
        const pwidth = this._width + this._verticalPadLength * 2;

        j = (j / pwidth - 1) * Math.PI * 2;

        const alpha = j * this._cellWidth - centerPos.x;
        const x = this._radius * Math.sin(-alpha);
        const y = centerPos.y - i * this._cellHeight;


        const z = this._radius * Math.cos(alpha);
        return {
            position: new Vector3(x, y, z),
            quaternion: new Quaternion().setFromAxisAngle({x: 0, y: 1, z: 0}, Math.PI - alpha)
        };
    }
}