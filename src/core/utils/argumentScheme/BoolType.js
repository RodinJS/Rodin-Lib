import {Type} from './Type';

export class BoolType extends Type {
    constructor() {
        super();
    }

    validate(val) {
        if (!super.validate(val))
            return false;
        return typeof val === 'boolean';
    }
}