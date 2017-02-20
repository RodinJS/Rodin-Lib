import {ErrorSingletonClass} from '../../error';

const enforce = function () {
};

let instance = null;
/**
 * Custom gamepad class, for MouseController, by default the navigator does not see mouse as a gamepad device.
 */
export class MouseGamePad {
    /**
     * Constructor - only for inherited classes
     */
    constructor(e) {
        if (e !== enforce) {
            throw new ErrorSingletonClass();
        }
        /**
         * Mouse XY coordinates in the document.
         * @type {number[]}
         */
        this.axes = [-1, -1];

        /**
         * Mouse buttons states.
         * @type {Object}
         */
        this.buttons = [
            {
                pressed: false,
                touched: false,
                value: 0
            },
            {
                pressed: false,
                touched: false,
                value: 0
            },
            {
                pressed: false,
                touched: false,
                value: 0
            }
        ];
        /**
         * Mouse connection state.
         * @type {boolean}
         */
        this.connected = true;
        /**
         * A bulk id, not used at the moment.
         * @type {number}
         */
        this.displayId = 0;

        /**
         * Mouse hand (left/right), not used at the moment.
         * @type {string}
         */
        this.hand = "";

        /**
         * Mouse gamepad ID.
         * @type {string}
         */
        this.id = "Mouse Gamepad";
        /**
         * Indicates whether the mousedown event should propagate to the document or not.
         * @type {boolean}
         */
        this.stopPropagationOnMouseDown = false;
        /**
         * Indicates whether the mousemove event should propagate to the document or not.
         * @type {boolean}
         */
        this.stopPropagationOnMouseMove = false;
        /**
         * Indicates whether the mouseup event should propagate to the document or not.
         * @type {boolean}
         */
        this.stopPropagationOnMouseUp = false;
        /**
         * Indicates whether the scroll event should propagate to the document or not.
         * @type {boolean}
         */
        this.stopPropagationOnScroll = false;

        let mouseMove = (event) => {
            this.axes[0] = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.axes[1] = -( event.clientY / window.innerHeight ) * 2 + 1;


            if (this.stopPropagationOnMouseMove) {
                event.stopPropagation();
            }
        };

        let mouseDown = (event) => {
            //alert(event.button);
            switch (event.button) {
                case 0:
                    this.buttons[0].pressed = true;
                    break;
                case 1:
                    this.buttons[1].pressed = true;
                    break;
                case 2:
                    this.buttons[2].pressed = true;
                    break;
                default:
                    break;
            }
            if (this.stopPropagationOnMouseDown) {
                event.stopPropagation();
            }
        };

        let mouseUp = (event) => {
            switch (event.button) {
                case 0:
                    this.buttons[0].pressed = false;
                    break;
                case 1:
                    this.buttons[1].pressed = false;
                    break;
                case 2:
                    this.buttons[2].pressed = false;
                    break;
                default:
                    break;
            }
            if (this.stopPropagationOnMouseUp) {
                event.stopPropagation();
            }
        };

        let scroll = (event) => {
            this.buttons[1].value += event.deltaY;
            //console.log(this.buttons[1].value);
            if (this.stopPropagationOnScroll) {
                event.stopPropagation();
            }
        };

        document.body.addEventListener('mousemove', mouseMove, false);
        document.body.addEventListener('mousedown', mouseDown, false);
        document.body.addEventListener('mouseup', mouseUp, false);

      document.body.addEventListener('touchmove', (evt)=> {
            // console.log("evt", evt);
            evt.clientX = evt.touches[0].clientX;
            evt.clientY = evt.touches[0].clientY;
            mouseMove(evt);
        }, false);
        document.body.addEventListener('touchstart', (evt)=> {
            evt.button = 0;
            evt.clientX = evt.touches[0].clientX;
            evt.clientY = evt.touches[0].clientY;
            mouseMove(evt);
            mouseDown(evt);
        }, false);
        document.body.addEventListener('touchend', (evt)=> {
            evt.button = 0;
            mouseUp(evt);
        }, false);

        document.body.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        }, false);
        document.body.addEventListener('wheel', scroll, false);
    }
    /**
     * Get gamepad instance
     * @returns {MouseGamePad} mouseGamePad
     */
    static getInstance() {
        if (!instance) {
            instance = new MouseGamePad(enforce);
        }

        return instance;
    }
}