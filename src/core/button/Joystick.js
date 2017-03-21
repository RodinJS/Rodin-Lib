import {Button} from './Button';
/**
 * Joystick
 * Represents a Joystick on a gamepad, with {x,y} coordinates as a value
 */
export class Joystick extends Button {
    constructor(keyCode = 0, navigatorButtonId = 0) {
        super(keyCode, navigatorButtonId);

        this.value = {
            x: 0,
            y: 0
        }
    }
}