
export class Button {
    /**
     * Button class.
     * Represents a single physical button on a GamePad (including keyboard and mouse)
     * @param keyCode
     * @param navigatorButtonId
     */
    constructor(keyCode = 0, navigatorButtonId = 0) {
        //TODO finish this
        /**
         *
         * @type {number}
         */
        this.keyCode = keyCode;
        this.navigatorButtonId = navigatorButtonId;

        this.pressed = false;
        this.touched = false;

        this.value = 0;
    }
}
