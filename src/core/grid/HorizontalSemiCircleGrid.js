import {HorizontalGrid} from './HorizontalGrid'
import {Vector3} from '../math'
import * as CONST from '../constants';
import {Cylinder} from '../sculpt'
import {Scene} from '../scene';
import {Quaternion} from "../math/Quaternion";

export class HorizontalSemiCircleGrid extends HorizontalGrid {
    constructor(width = 5, height = 5, cellWidth = 0.5, cellHeight = 0.5, radius = 3, sculpt) {

        sculpt = sculpt || new Cylinder(radius, radius, height * cellHeight * 2, width, height, true, -Math.PI / 2, -Math.PI, new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0
                // wireframe: true
            }));

        super(width, height, cellWidth, cellHeight, sculpt);

        this._gamepadMove = (evt) => {
            // check the case when things are already moving,
            // then you press again
            if (this.dragUV) {
                this.horizontalOffset = this.dragUV.x - evt.uv.x;
            }
        };

        this.ButtonUpEvent = (evt) => {
            this.dragUV = null;
            navigator.mouseGamePad.stopPropagationOnMouseMove = false;

            const scrolledElementCount = this._radius * Math.sin(this.horizontalOffset * Math.PI) / this._cellWidth;

            if (Math.abs(scrolledElementCount) >= this._minHorizontalScroll) {
                this.scroll(scrolledElementCount);
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

    getIndexProperties(i, j, centerPos) {
        const pheight = this._height + this._horizontalPadLength * 2;

        i = (i / (pheight - 1) - 1) * Math.PI - Math.PI / 2 - this.horizontalOffset * Math.PI;

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