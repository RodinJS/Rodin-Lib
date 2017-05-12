/**
 * Euler representing class, with some extra features.
 * @param {number} [x = 0] - the angle of the x axis in radians, whenever this parameter is changed, onChangeCallback() methods will be called
 * @param {number} [y = 0] - the angle of the y axis in radians, whenever this parameter is changed, onChangeCallback() methods will be called
 * @param {number} [z = 0] - the angle of the z axis in radians, whenever this parameter is changed, onChangeCallback() methods will be called
 * @param {string} [order = 'XYZ'] - a string representing the order that the rotations are applied (for example 'XYZ'), whenever this parameter is changed, onChangeCallback() methods will be called
 */
export class Euler extends THREE.Euler {
	constructor(...args) {
		super(...args);
		this._callbacks = [];
	}

	/**
	 * An overridden method of adding callback (instead of setting)
	 * @param {function} callback
	 */
	onChange(callback) {
		this._callbacks.push(callback);
	}

	/**
	 * An overridden method for calling all callbacks
	 */
	onChangeCallback() {
		for (let i = 0; i < this._callbacks.length; i++) {
			this._callbacks[i](this);
		}
	}

	/**
	 * Sets the x, y, z angles and the order of the given object to this Euler and returns this.
	 * @param {object} val - with x, y, z, order numeric parameters
	 * @returns {WrappedEuler}
	 */
	silentCopy(val) {
		this._x = val.x;
		this._y = val.y;
		this._z = val.z;
		this._order = val.order;
		return this;
	}

	/**
	 * Gets the values of this Euler as an object with angles and order.
	 * @returns {{x: number, y: number, z: number, order: string}}
	 */
	valueOf() {
		return {x: this._x, y: this._y, z: this._z, order: this._order};
	}
}