export class WrappedQuaternion extends THREE.Quaternion {
	constructor(...args) {
		super(...args);
		this._callbacks = [];
	}

	onChange(callback) {
		this._callbacks.push(callback);
	}

	onChangeCallback() {
		for (let i = 0; i < this._callbacks.length; i++) {
			this._callbacks[i](this);
		}
	}

	silentCopy(val) {
		this._x = val.x;
		this._y = val.y;
		this._z = val.z;
		this._w = val.w;
		return this;
	}

	valueOf() {
		return {x: this._x, y: this._y, z: this._z, w: this._w};
	}
}