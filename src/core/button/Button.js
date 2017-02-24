export class Button {
    constructor(keyCode = 0) {
        this.keyCode = keyCode;
    }

    //todo: make singleton base class or singleton function
    static get instance() {
        return new Button();
    }
}
