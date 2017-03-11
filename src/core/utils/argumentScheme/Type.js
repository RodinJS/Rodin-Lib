export class Type {
	constructor() {
		// do not set this.default in case you want it to be null
		//this._default
	}

	default(val) {
		this._default = val;
		return this;
	}

	validate(val) {
		return true;
	}
}