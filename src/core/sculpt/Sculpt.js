import {ErrorInvalidArgument} from '../error';
import {Set} from '../set';
import {EventEmitter} from '../eventEmitter';
import {string} from '../utils';

function normalizeArguments(args) {

}

export class Sculpt extends EventEmitter {

	constructor(arg) {
        super();

        //normalize imports into a single object
		switch (true) {
			case arg.isObject3D:
				//if we get a three object 3D
				//use it as our base
				arg = {threeObject: arg};
				break;
			case arg.isSculpt:
				//if we get a Sculpt object
				//copy it into us
				arg = {Sculpt: arg};
				break;
			case typeof arg === 'string':
				//assume we got a url to a model
				//todo: handle loading model from a url
                arg = {url: arg};
				break;
			case typeof arg == 'object':
                break;
			default:
			    arg = {threeObject: new THREE.Object3D()};
		}

        const args = Object.assign({
            name: undefined,
            // todo: figure out if we actually need a uid
            // if we don't use it by the time lib is ready remove it
            id: string.UID(),
            url: undefined,
            threeObject: undefined,
            Sculpt: undefined
        }, arg);


        this.name = args.name;
        //process object
        switch(true){
            case !!args.threeObject:
                this._threeObject = args.threeObject;
                break;
            case !!args.Sculpt:
                this.copy(args.Sculpt);
                break;
            case !!args.url:
                //load a model from a url
                break;
        }

		this.children = new Set();
		this._parent = undefined;
	}

	/*
	 * to check if an object is of sculpt type
	 * @returns {boolean} true
	 */
	get isSculpt() {
		return true;
	}

	/*
	 * gets our parent
	 * @return {Sculpt|undefined}
	 */
	get parent() {
		return this._parent;
	}


	/**
	 * changes our parent
	 * returns the same object as passed (parent)
	 */
	set parent(parent) {
		this._parent = parent;
		//todo: handle all the THREEJS parent stuff
		//this._threeObject
	}

	/**
	 * Copies obj into our object
	 * @param {Sculpt} sculpt
	 * @param {boolean} [recursive=true]
	 */
	copy(sculpt, recursive = true) {
		if (!sculpt.isSculpt) {
			throw new ErrorInvalidArgument('Sculpt');
			//todo: maybe accept THREE.Object3D too?
		}
		this.name = sculpt.name;
		//todo: handle all parameters

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
	 * Gets the matrix of our object with respect to its parent (local)
	 * @return {THREE.Matrix4} [recursive=true]
	 */
	get matrix() {
		//todo: check if this is updated
		return this._threeObject.matrix;
	}

	/**
	 * Gets the matrix of our object with respect to the scene it is in (global)
	 * if our object doesn't have a parent same as .matrix
	 * @return {THREE.Matrix4} [recursive=true]
	 */
	get globalMatrix() {
		//todo: check if this is updated
		return this._threeObject.matrixWorld;
	}


}