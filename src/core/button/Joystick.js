import {Button} from './Button';

export class Joystick extends Button {
    constructor(keyCode = 0, navigatorButtonId = 0) {
        super(keyCode, navigatorButtonId);

        this.value = {
            x: 0,
            y: 0
        }
    }
}