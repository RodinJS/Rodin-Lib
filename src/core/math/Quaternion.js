/**
 * Quaternion representing class, with some extra features.
 * @param {number} x - coordinate, whenever this parameter is changed, onChangeCallback() methods will be called
 * @param {number} y - coordinate, whenever this parameter is changed, onChangeCallback() methods will be called
 * @param {number} z - coordinate, whenever this parameter is changed, onChangeCallback() methods will be called
 * @param {number} w - coordinate, whenever this parameter is changed, onChangeCallback() methods will be called
 */
export class Quaternion extends THREE.Quaternion {
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
	 * Sets the x, y, z, w coordinates of the given object to this Quaternion and returns this.
	 * @param {object} val - with x, y, z, w numeric parameters
	 * @returns {Quaternion}
     */
	silentCopy(val) {
		this._x = val.x;
		this._y = val.y;
		this._z = val.z;
		this._w = val.w;
		return this;
	}

	/**
	 * Gets the values of this Quaternion as an object with coordinates.
	 * @returns {{x: number, y: number, z: number, w: number}}
     */
	valueOf() {
		return {x: this._x, y: this._y, z: this._z, w: this._w};
	}
}