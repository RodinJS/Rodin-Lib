import {Type} from './Type';

export class NumberType extends Type {
	constructor() {
		super();
		this._min = null;
		this._max = null;
	}

	min(val) {
		this.min = val;
		return this;
	}

	max(val) {
		this.max = val;
		return this;
	}

	validate(val) {
		if (!super.validate(val))
			return false;
		return typeof val === 'number';
	}
}