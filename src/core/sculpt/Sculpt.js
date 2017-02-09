import {ErrorInvalidArgument} from '../error';

export class Sculpt {

	constructor(arg) {

		switch (true) {
			case arg.isObject3D:
				//if we get a three object 3D
				//use it as our base
				this._threeObject = arg;
				break;
			case arg.isSculpt:
				//if we get a Sculpt object
				//copy it into us
				this.copy(arg);
				break;
			case typeof arg === 'string':
				//assume we got a url to a model
				//todo: handle loading model from a url
				break;
			case typeof arg == 'object':

				let args = Object.assign({
					name: undefined,
					url: undefined,
					THREEObject3D: undefined,
					Sculpt: undefined
				}, arg);

				this.name = args.name;
			//todo: handle url and stuff

			default:
				this._threeObject = new THREE.Object3D();
		}

		this.children = [];
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


	/*
	 * changes our parent
	 * returns the same object as passed (parent)
	 * @return {Sculpt}
	 */
	set parent(parent) {
		this._parent = parent;
		//todo: handle all the THREEJS parent stuff

		//this._threeObject

		return parent;
	}

	/*
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

	/*
	 * Creates a new sculpt object that is a clone of our object
	 * @param {boolean} [recursive=true]
	 */
	clone(recursive = true) {
		return new this.constructor().copy(this, recursive);
	}

	/*
	 * Gets the matrix of our object with respect to its parent (local)
	 * @return {THREE.matrix4} [recursive=true]
	 */
	get matrix() {
		//todo: check if this is updated
		return this._threeObject.matrix;
	}

	/*
	 * Gets the matrix of our object with respect to the scene it is in (global)
	 * if our object doesn't have a parent same as .matrix
	 * @return {THREE.matrix4} [recursive=true]
	 */
	get globalMatrix() {
		//todo: check if this is updated
		return this._threeObject.matrixWorld;
	}


}