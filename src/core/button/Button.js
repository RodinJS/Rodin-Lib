export class Button {
    constructor(keyCode = 0, navigatorButtonId = 0) {
        this.keyCode = keyCode;
        this.navigatorButtonId = navigatorButtonId;

        this.pressed = false;
        this.touched = false;

        this.value = 0;
    }
}
