import {ErrorBadValueParameter} from '../error';
import {Set} from '../set';
import {EventEmitter} from '../eventEmitter';
import {string} from '../utils';
import {RodinEvent} from '../rodinEvent';
import * as CONSTANTS from '../constants';

function normalizeArguments(args) {
    switch (true) {
        case args.isSculpt:
            //if we get a Sculpt object
            //copy it into us
            args = {sculpt: args};
            break;
        case args.isObject3D:
            //if we get a three object 3D
            //use it as our base
            args = {threeObject: args};
            break;
        case typeof args === 'string':
            //assume we got a url to a model
            //todo: handle loading model from a url
            args = {url: args};
            break;
        case typeof args == 'object':
            break;
        default:
            args = {threeObject: new THREE.Object3D()};
    }

    return Object.assign({
        name: undefined,
        url: undefined,
        threeObject: undefined,
        sculpt: undefined
    }, args);
}

/**
 * Sculpt
 */
export class Sculpt extends EventEmitter {
    constructor(args) {
        super();

        args = normalizeArguments(args);

        /**
         * Three object
         * @type {null}
         * @private
         */
        this._threeObject = null;

        /**
         * Parent Sculpt
         * @type {null}
         * @private
         */
        this._parent = null;

        /**
         * Object's children
         * @type {Set}
         * @private
         */
        this._children = new Set();

        /**
         * name
         */
        this.name = args.name;

        // process arguments
        switch (true) {
            case !!args.sculpt:
                this.copy(args.sculpt);
                this.emitAsync(CONSTANTS.READY, new RodinEvent(this));
                break;

            case !!args.threeObject:
                this._threeObject = args.threeObject;
                this.emitAsync(CONSTANTS.READY, new RodinEvent(this));
                break;
        }

        /**
         * @type {Set}
         */
        this.children = new Set();

        /**
         * parent
         * @type {Sculpt}
         * @private
         */
        this._parent = undefined;

        /**
         * check if sculpt is ready
         * @type {boolean}
         * @private
         */
        this._ready = false;

        this.on('ready', () => {
            this._ready = true;
        })
    }

    /**
     * to check if an object is of sculpt type
     * @returns {boolean} true
     */
    get isSculpt() {
        return true;
    }

    /**
     * to check if our sculpt is ready
     * @returns {boolean}
     */
    get isReady() {
        return this._ready
    }

    /**
     * gets our parent
     */
    get parent() {
        return this._parent;
    }

    /**
     * Set new parent
     */
    set parent(parent) {
        parent.add(this);
    }

    /**
     * Sets the position of our object with respect to its parent (local)
     * @param position {THREE.Vector3}
     */
    set position(position) {
        this._threeObject.position.copy(position);
    }

    /**
     * Gets the position of our object with respect to its parent (local)
     * @return {THREE.Vector3}
     */
    get position() {
        return this._threeObject.position;
    }


    /**
     * Sets the scale of our object
     * @param scale {THREE.Vector3}
     */
    set scale(scale) {
        this._threeObject.scale.copy(scale);
    }

    /**
     * Gets the scale of our object
     * @return {THREE.Vector3}
     */
    get scale() {
        return this._threeObject.scale;
    }

    /**
     * Sets the matrix of out object with respect to its parent (local)
     * @param matrix {THREE.Matrix4}
     */
    set matrix(matrix) {
        this._threeObject.matrix = matrix;
    }

    /**
     * Gets the matrix of our object with respect to its parent (local)
     * @return {THREE.Matrix4} [recursive=true]
     */
    get matrix() {
        this._threeObject.updateMatrix(true);
        return this._threeObject.matrix;
    }

    /**
     * Set the matrix of out object with respect to the scene it is in (global)
     * if our object doesn't have a parent same as .matrix
     * @param matrix {THREE.Matrix4}
     */
    set globalMatrix(matrix) {
        if (!this.parent) {
            this.matrix = matrix;
            return;
        }

        let inverseParentMatrix = new THREE.Matrix4();
        let newGlobalMatrix = matrix.clone();

        inverseParentMatrix.getInverse(this.parent.globalMatrix);
        newGlobalMatrix.multiplyMatrices(inverseParentMatrix, newGlobalMatrix);

        this._threeObject.matrixAutoUpdate = false;
        this._threeObject.matrix = newGlobalMatrix;
        this._threeObject.updateMatrixWorld(true);
    }

    /**
     * Gets the matrix of our object with respect to the scene it is in (global)
     * if our object doesn't have a parent same as .matrix
     * @return {THREE.Matrix4}
     */
    get globalMatrix() {
        this._threeObject.updateMatrixWorld(true);
        return this._threeObject.matrixWorld;
    }

    /**
     * Copies obj into our object
     * @param {Sculpt} sculpt
     * @param {boolean} [recursive=true]
     */
    copy(sculpt, recursive = true) {
        if (!sculpt.isSculpt) {
            throw new ErrorBadValueParameter('Sculpt');
        }

        this.name = sculpt.name;
        this._threeObject = sculpt._threeObject.clone();

        return this;
    }

    /**
     * Creates a new sculpt object that is a clone of our object
     * @param {boolean} [recursive=true]
     */
    clone(recursive = true) {
        return new this.constructor().copy(this, recursive);
    }

    /**
     * Add object(s) to this object.
     * Call with multiple arguments of Sculpt objects
     */
    add() {
        for (let i = 0; i < arguments.length; i++) {
            if (!arguments[i].isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
            }

            let globalMatrix = arguments[i].globalMatrix;
            let currParent = arguments[i].parent;
            currParent && currParent.remove(arguments[i]);

            arguments[i]._parent = this;
            this._threeObject.add(arguments[i]._threeObject);
            this.children.push(arguments[i]);

            arguments[i].globalMatrix = globalMatrix;
        }
    }

    /**
     * Remove object(s) from
     * Call with multiple arguments of Sculpt objects
     */
    remove() {
        for (let i = 0; i < arguments.length; i++) {
            if (!arguments[i].isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
            }

            //todo: stugel te et object@ et sculpti vra ka te che
            this.children.splice(this.children.indexOf(arguments[i]), 1);
            this._threeObject.remove(arguments[i]._threeObject);
        }
    }
}
