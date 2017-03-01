export class WrappedEuler extends THREE.Euler {
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
		this._order = val.order;
		return this;
	}
}