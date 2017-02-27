import {GamePad} from './GamePad';
import {messenger} from '../messenger';
import * as CONST from '../constants';
import * as Buttons from '../button';

// todo: implement with messenger
import {Scene} from '../scene';

/**
 * Custom (virtual) gamepad class, for CardboardController.
 */
export class CardboardNavigatorGamePad {

    constructor() {
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
}

/**
 * A controller class for describing event handlers for cardboard use.
 * @param {THREE.Scene} scene - the scene where the controller will be used.
 * @param {THREE.PerspectiveCamera} camera - the camera where the controller will be used.
 */
export class CardboardGamePad extends GamePad {
    constructor() {
        super("cardboard", null, CONST.VR);
        // this.vrOnly = true;

        this.buttons = [Buttons.cardboardTrigger];
    }

    /**
     * Get raycasted objects ({distance, point, face, faceIndex, indices, object}) that are in camera's center.
     * @returns {Object[]}
     */
    getIntersections() {
        // todo: use our custom camera later
        this.raycaster.set(Scene.active._camera.getWorldPosition(), Scene.active._camera.getWorldDirection());
        return this.raycaster.raycast();
    }
}

messenger.post(CONST.REQUEST_RODIN_STARTED);

messenger.once(CONST.RODIN_STARTED, () => {
    navigator.cardboardGamePad = new CardboardNavigatorGamePad();
    GamePad.cardboard = new CardboardGamePad();
});