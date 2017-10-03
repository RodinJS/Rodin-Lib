import {Type} from './Type.js';

export class FunctionType extends Type {
	constructor() {
		super();
	}

	validate(val) {
		if (typeof val === 'function')
			return true;
	}
}