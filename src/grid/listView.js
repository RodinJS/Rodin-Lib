import {Sculpt} from '../sculpt/Sculpt.js';
import * as CONST from '../constants/index.js';
import {Vector3} from '../math/index.js';
import {Time} from '../time/index.js';
import {EventEmitter} from '../eventEmitter/index.js';
import {RodinEvent} from '../rodinEvent/index.js';


export class ListView extends EventEmitter {
    constructor(width = 5, height = 5, cellWidth = 0.5, cellHeight = 0.5, sculpt) {
        super();
        // we need to set width height first, so _getMainSculpt can use those
        this._width = width;
        this._height = height;
        this._cellWidth = cellWidth;
        this._cellHeight = cellHeight;

        this._lastScroll = 0;

        sculpt = sculpt || new Sculpt();

        this.sculpt = sculpt;

        this._initEvents();

        this._horizontalPadLength = 0;
        this._verticalPadLength = 0;

        this._pWidth = this._width + this._verticalPadLength * 2;
        this._pHeight = this._height + this._horizontalPadLength * 2;

        window.sculpt = this.sculpt;

        this._targetPositions = [];
        this._targetQuaternions = [];

        this._center = Math.floor(width * height / 2);
        this._oldCenter = this._center;

        this._prevUpdated = [];

        this._verticalOffset = 0;
        this._horizontalOffset = 0;

        this.sculpt.on(CONST.UPDATE, (evt) => {
            this.update();
            //console.log(this.constructor);
        });

        this._minHorizontalScroll = 1;
        this._minVerticalScroll = 1;

        this._shouldUpdate = true;

        this._scrollStackSize = 0;
        this._lastGoodCenter = this._center;


        this._startEventEmited = false;
    }

    _initEvents() {
        this.sculpt._threeObject.renderOrder = 1;

        this.sculpt.on(CONST.GAMEPAD_BUTTON_CHANGE, (evt) => {
            if (evt.gamepad.isMouseGamepad && evt.keyCode === CONST.MOUSE_WHEEL) {
                this.scroll(-Math.sign(this._lastScroll - evt.button.value));
                this._lastScroll = evt.button.value;
            }
        });

        this.sculpt.on(CONST.GAMEPAD_BUTTON_DOWN, (evt) => {
            this.dragUV = evt.uv;
            navigator.mouseGamePad.stopPropagationOnMouseMove = true;
        });
    }


    setGetElement(fcn) {
        this.getElement = fcn;
        this.updateTargetPositions();
    }

    scroll(val) {
        if (!this._shouldUpdate) {
            this.emit(CONST.SCROLL_START, new RodinEvent(this));
            this._startEventEmited = true;
        }

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
        return this._center - Math.floor(this._width * this._height / 2);
    }

    get end() {
        return this._center + Math.ceil(this._width * this._height / 2);

    }

    update() {
        if (!this._shouldUpdate)
            return;
        let changedCount = 0;

        const pWidth = this._width + this._verticalPadLength * 2;
        const pHeight = this._height + this._horizontalPadLength * 2;

        for (let i = 0; i < pWidth * pHeight; i++) {
            const index = i + this.start;
            if (!this._targetPositions[index] || this._targetPositions[index].reached) {
                continue;
            }
            changedCount++;
            const elem = this.getElement(index);

            const dist = elem.position.distanceTo(this._targetPositions[index]);
            elem.position.lerp(this._targetPositions[index], 0.1 * Time.delta / 10);

            // we shouldn't implement each changable parameter in this parent class
            // TODO: expose a method and use it in children
            if (this._targetQuaternions[index]) {
                elem.quaternion.slerp(this._targetQuaternions[index], 0.1 * Time.delta / 10);
            }

            this.move && this.move(elem, index, this._targetPositions[index]);

            if (dist < 0.02) {
                this._targetPositions[index].reached = true;
            }
        }
        if (changedCount === 0) {
            if (this._startEventEmited) {
                this.emit(CONST.SCROLL_END, new RodinEvent(this));
                this._startEventEmited = false;
            }
            this._shouldUpdate = false;
        }
    }

    updateTargetPositions() {
        if (this._scrollStackSize > 100) {
            this._center = this._lastGoodCenter;
            return;
        }
        const pWidth = this._width + this._verticalPadLength * 2;
        const pHeight = this._height + this._horizontalPadLength * 2;
        const centerPos = this._getCenterPos(pWidth, pHeight);

        const updated = [];
        const missingRows = new Array(pHeight).fill(true);

        // we cant use the same cycles for both vertical and horizontal, but right now
        // we need to get this done quickly so here it is, in some places this causes
        // confusions with x and y like in HorizontalGrid.js I changed places of those
        // in order to get stuff working.
        // TODO: fix this later

        // to fix this we need to traverse not by height, width, but by index
        // no time right now will fix later
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
                const props = this.getIndexProperties(i, j, centerPos);
                this._targetPositions[index] = props.position;// this.getIndexPosition(i, j, centerPos);
                this._targetQuaternions[index] = props.quaternion;

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
            this._scrollStackSize++;
            this.scroll(lastScrollDirection * this._height);
            return;
        }

        if (missingRows[0] === true) {
            let m = 0;
            while (missingRows[m++]) {
            }
            this._scrollStackSize++;
            this.scroll(m - 1);
            return;
        }
        missingRows.reverse();
        if (missingRows[0] === true) {
            let m = 0;
            while (missingRows[m++]) {
            }
            this._scrollStackSize++;
            this.scroll(-m + 1);
            return;
        }

        this._scrollStackSize = 0;
        this._lastGoodCenter = this.center;

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
        this._shouldUpdate = true;
    }

    _getCenterPos(pWidth, pHeight) {
        return new Vector3(pWidth * this._cellWidth / 2 - this._cellWidth / 2 + this._horizontalOffset, pHeight * this._cellHeight / 2 - this._cellHeight / 2 + this._verticalOffset, 0);
    }

}