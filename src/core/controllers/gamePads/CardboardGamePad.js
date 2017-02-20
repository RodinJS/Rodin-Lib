import {ErrorSingletonClass} from '../../error';

const enforce = function () {
};

let instance = null;
/**
 * Custom (virtual) gamepad class, for CardboardController.
 */
export class CardboardGamePad {

    constructor(e) {
        if (e !== enforce) {
            throw new ErrorSingletonClass();
        }
        /**
         * Bulk XY coordinates in the document.
         * @type {number[]}
         */
        this.axes = [0, 0];
        /**
         * Cardboard button state.
         * @type {Object[]}
         */
        this.buttons = [
            {
                pressed: false,
                touched: false,
                value: 0
            }
        ];
        /**
         * Bulk connection state.
         * @type {boolean}
         */
        this.connected = true;
        /**
         * Bulk id, not used at the moment.
         * @type {number}
         */
        this.displayId = 0;
        /**
         * Hand (left/right), not used at the moment.
         * @type {string}
         */
        this.hand = "";
        /**
         * Gamepad ID.
         * @type {string}
         */
        this.id = "Cardboard Gamepad";
        /**
         * Indicates whether the mousedown event should propagate to the document or not.
         * @type {boolean}
         */
        this.stopPropagationOnMouseDown = false;
        /**
         * Indicates whether the mouseup event should propagate to the document or not.
         * @type {boolean}
         */
        this.stopPropagationOnMouseUp = false;


        let cardboardDown = () => {
            this.buttons[0].pressed = true;
            if (this.stopPropagationOnMouseDown) {
                event.stopPropagation();
            }
        };

        let cardboardUp = () => {
            this.buttons[0].pressed = false;
            if (this.stopPropagationOnMouseUp) {
                event.stopPropagation();
            }
        };

        document.body.addEventListener('touchstart', cardboardDown, false);
        document.body.addEventListener('touchend', cardboardUp, false);
        document.body.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        }, false);
    }

    /**
     * Get gamepad instance
     * @returns {CardboardGamePad} cardboardGamePad
     */
    static getInstance() {
        if (!instance) {
            instance = new CardboardGamePad(enforce);
        }

        return instance;
    }
}


