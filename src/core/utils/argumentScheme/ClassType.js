import {Type} from './Type';

export class ClassType extends Type {
	constructor(_class) {
		super();
		this._class = _class;
	}

	validate(val) {
		if  (!super.validate(val))
			return false;
		return val.constructor === this._class;
	}
}