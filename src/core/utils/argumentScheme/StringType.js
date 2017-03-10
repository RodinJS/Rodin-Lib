import {Type} from './Type';

export class StringType extends Type {
	constructor() {
		super();
		this._minLength = 0;
		this._maxLength = Infinity;
		// todo: check if null is ok with regexes
		this._regex = null;
	}

	minLength(val) {
		this._minLength = val;
		return this;
	}

	maxLength(val) {
		this._maxLength = val;
		return this;
	}

	regex(val) {
		this._regex = val;
		if (this._regex.constructor !== RegExp)
			this._regex = new RegExp(this._regex, 'gi');
		return this;
	}

	validate(val) {
		if (!super.validate(val))
			return false;

		if (this._regex && !this._regex.test(val))
			return false;
		return val.constructor === String && val.length >= this._minLength && val.length <= this._maxLength;
	}
}