import {Type} from './Type.js';

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