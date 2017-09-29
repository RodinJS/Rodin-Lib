
export class Button {
    /**
     * Button class.
     * Represents a single physical button on a GamePad (including keyboard and mouse)
     * @param [keyCode=0] {Number} KeyCode.
     * @param [navigatorButtonId=0] {Number} Navigator button ID.
     */
    constructor(keyCode = 0, navigatorButtonId = 0) {
        //TODO finish this
        /**
         * Button keyCode - used to differentiate the buttons from each other
         * @type {number}
         */
        this.keyCode = keyCode;
        /**
         * The button Id tha was assigned to this button by the browsers navigator. Just skip this for now :)
         * @type {number}
         */
        this.navigatorButtonId = navigatorButtonId;
        /**
         * Indicates if the button is in a pressed state or not.
         * @type {boolean}
         */
        this.pressed = false;
        /**
         * Indicates if the button is in a touched state or not.
         * @type {boolean}
         */
        this.touched = false;
        /**
         * Indicates if the button has a value (for example the pressure value, or 1/2/../n if its a switch... Anything that can have a numeric value).
         * @type {number}
         */
        this.value = 0;
    }

    /**
     * Checks if current object is Button.
     * @returns {boolean}
     */
    get isButton() {
        return true;
    }
}
