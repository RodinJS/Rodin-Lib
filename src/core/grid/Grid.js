import {Sculpt} from '../sculpt/Sculpt'
import * as CONST from '../constants';
import {Vector3} from '../math'

export class Grid {
    constructor(sculpt = new Sculpt(), width = 5, height = 5, cellWidth = 0.5, cellHeight = 0.5) {
        this.sculpt = sculpt;
        this.sculpt._threeObject.renderOrder = 1;

        this._lastScroll = 0;

        this.sculpt.on(CONST.GAMEPAD_BUTTON_CHANGE, (evt) => {
            if (evt.gamepad.isMouseGamepad && evt.keyCode === CONST.MOUSE_WHEEL) {
                this.scroll(Math.sign(this._lastScroll - evt.button.value));
                this._lastScroll = evt.button.value;
            }
        });

        this.sculpt.on(CONST.GAMEPAD_BUTTON_DOWN, (evt) => {
            this.dragUV = evt.uv;
            navigator.mouseGamePad.stopPropagationOnMouseMove = true;
        });


        this._width = width;
        this._height = height;
        this._cellWidth = cellWidth;
        this._cellHeight = cellHeight;

        this._horizontalPadLength = 0;
        this._verticalPadLength = 0;

        this._pWidth = this._width + this._verticalPadLength * 2;
        this._pHeight = this._height + this._horizontalPadLength * 2;

        console.log(this.sculpt);
        window.sculpt = this.sculpt;

        this._targetPositions = [];

        this._center = width * height / 2;
        this._oldCenter = this._center;

        this._prevUpdated = [];

        this._verticalOffset = 0;
        this._horizontalOffset = 0;

        this.sculpt.on(CONST.UPDATE, (evt) => {
            this.update();
        });

        this._minHorizontalScroll = 1;
        this._minVerticalScroll = 1;

    }

    setGetElement(fcn) {
        this.getElement = fcn;
        this.updateTargetPositions();
    }

    scroll(val) {
        this.center += parseInt(val) * this._pWidth;
    }

    setShowHideFcn(fcn) {
        this.showhide = fcn;
    }

    onShow(fcn) {
        this.show = fcn;
    }

    onHide(fcn) {
        this.hide = fcn;
    }

    onMove(fcn) {
        this.move = fcn;
    }

    set horizontalOffset(val) {
        this._horizontalOffset = val;
        this.updateTargetPositions();
    }

    set verticalOffset(val) {
        this._verticalOffset = val;
        this.updateTargetPositions();
    }

    get horizontalOffset() {
        return this._horizontalOffset;
    }

    get verticalOffset() {
        return this._verticalOffset;
    }

    set center(val) {
        this._oldCenter = this._center;
        this._center = val;
        this.updateTargetPositions();
    }

    get center() {
        return this._center;
    }

    get start() {
        return this._center - this._width * this._height / 2
    }

    update() {
        const pWidth = this._width + this._verticalPadLength * 2;
        const pHeight = this._height + this._horizontalPadLength * 2;

        for (let i = 0; i < pHeight; i++) {
            for (let j = 0; j < pWidth; j++) {

                const index = (i * pWidth) + j + this.start;
                const elem = this.getElement(index);
                if (!this._targetPositions[index] || this._targetPositions[index].reached) {
                    continue;
                }

                const dist = elem.position.distanceTo(this._targetPositions[index]);
                elem.position.lerp(this._targetPositions[index], 0.1);

                this.move && this.move(elem, index, this._targetPositions[index]);

                if (dist < 0.0002) {
                    this._targetPositions[index].reached = true;
                }

            }
        }
    }

    updateTargetPositions() {
        const pWidth = this._width + this._verticalPadLength * 2;
        const pHeight = this._height + this._horizontalPadLength * 2;
        const centerPos = new Vector3(pWidth / 2 * this._cellWidth - this._cellWidth / 2 + this._horizontalOffset, pHeight / 2 * this._cellHeight - this._cellHeight / 2 + this._verticalOffset, 0);

        const updated = [];
        const missingRows = new Array(pHeight).fill(true);

        // we cant use the same cycles for both vertical and horizontal, but right now
        // we need to get this done quickly so here it is, in some places this causes
        // confusions with x and y like in HorizontalGrid.js I changed places of those
        // in order to get stuff working.
        // TODO: fix this later

        for (let i = 0; i < pHeight; i++) {
            let missingFullRow = true;

            for (let j = 0; j < pWidth; j++) {

                const index = (i * pWidth) + j + this.start;
                updated.push(index);
                const elem = this.getElement(index);
                if (elem)
                    missingRows[i] = false;
                else
                    continue;

                if (elem.parent !== this.sculpt) {
                    elem.parent = this.sculpt;
                }

                this._targetPositions[index] = this.getIndexPosition(i, j, centerPos);
                this._targetPositions[index].reached = false;

                if (i < this._horizontalPadLength || i >= this._height + this._horizontalPadLength) {
                    this._targetPositions[index].opacity = 0;
                }
                else {
                    this._targetPositions[index].opacity = 1;
                }
            }
        }

        if (missingRows.every(i => i)) {
            const lastScrollDirection = Math.sign(this._oldCenter - this.center);
            //console.log(lastScrollDirection);
            this.scroll(lastScrollDirection * this._height);
            return;
        }

        if (missingRows[0] === true) {
            let m = 0;
            while (missingRows[m++]) {
            }
            this.scroll(m - 1);
            return;
        }
        missingRows.reverse();
        if (missingRows[0] === true) {
            let m = 0;
            while (missingRows[m++]) {
            }
            this.scroll(-m + 1);
            return;
        }


        const removed = this._prevUpdated.filter(i => updated.indexOf(i) === -1);
        for (let i in removed) {
            if (this.getElement(removed[i]))
                this.hide(this.getElement(removed[i]), removed[i], 0);
        }
        for (let i in updated) {
            if (this.getElement(updated[i]))
                this.show(this.getElement(updated[i]), updated[i], 0);
        }

        this._prevUpdated = [...updated];
    }

}