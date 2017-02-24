import {Button} from './Button';
import * as CONST from '../constants';

export class MouseR extends Button {
    constructor() {
        super(CONST.MOUSE_RIGHT);
    }
}

export class MouseL extends Button {
    constructor() {
        super(CONST.MOUSE_LEFT);
    }
}

export class MouseWheel extends Button {
    constructor() {
        super(CONST.MOUSE_WHEEL);
    }
}
