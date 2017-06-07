import {GamePad} from './GamePad';
import {Scene} from '../scene';
import {messenger} from '../messenger';
import * as CONST from '../constants';
import * as Buttons from '../button';

/**
 * Polyfilled mouse gamepad class, for MouseGamepad, by default the navigator does not see mouse as a gamepad device.
 */
class MouseNavigatorGamePad {
    /**
     * Constructor - only for inherited classes
     */
    constructor() {
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
            if (Scene.webVRmanager.hmd && Scene.webVRmanager.hmd.isPresenting) return;
            if (this.buttons[event.button]) {
                this.buttons[event.button].pressed = true
            }

            if (this.stopPropagationOnMouseDown) {
                event.stopPropagation();
            }
        };

        let mouseUp = (event) => {
            if (Scene.webVRmanager.hmd && Scene.webVRmanager.hmd.isPresenting) return;
            if (this.buttons[event.button]) {
                this.buttons[event.button].pressed = false
            }

            if (this.stopPropagationOnMouseUp) {
                event.stopPropagation();
            }
        };

        let scroll = (event) => {
            if (Scene.webVRmanager.hmd && Scene.webVRmanager.hmd.isPresenting) return;
            this.buttons[1].value += event.deltaY;
            if (this.stopPropagationOnScroll) {
                event.stopPropagation();
            }
        };

        document.body.addEventListener('mousemove', mouseMove, false);
        document.body.addEventListener('mousedown', mouseDown, false);
        document.body.addEventListener('mouseup', mouseUp, false);

        document.body.addEventListener('touchmove', (evt) => {
            if (Scene.webVRmanager.hmd && Scene.webVRmanager.hmd.isPresenting) return;
            evt.clientX = evt.touches[0].clientX;
            evt.clientY = evt.touches[0].clientY;
            mouseMove(evt);
        }, false);
        document.body.addEventListener('touchstart', (evt) => {
            if (Scene.webVRmanager.hmd && Scene.webVRmanager.hmd.isPresenting) return;
            evt.button = 0;
            evt.clientX = evt.touches[0].clientX;
            evt.clientY = evt.touches[0].clientY;
            mouseMove(evt);
            mouseDown(evt);
        }, false);
        document.body.addEventListener('touchend', (evt) => {
            if (Scene.webVRmanager.hmd && Scene.webVRmanager.hmd.isPresenting) return;
            evt.button = 0;
            mouseUp(evt);
        }, false);

        document.body.addEventListener('contextmenu', (e) => {
            if (Scene.webVRmanager.hmd && Scene.webVRmanager.hmd.isPresenting) return;
            e.preventDefault();
        }, false);
        document.body.addEventListener('wheel', scroll, false);
    }
}
/**
 * Mouse Gamepad class, overrides buttons and intersecting method.
 */
export class MouseGamePad extends GamePad {
    constructor() {
        super('mouse', null, CONST.NON_VR);
        /**
         * Mouse Buttons array
         * @type {Button[]}
         */
        this.buttons = [Buttons.mouseLeft, Buttons.mouseWheel, Buttons.mouseRight];
    }

    get isMouseGamepad() {
        return true;
    }

    /**
     * Get raycasted objects ({distance, point, face, faceIndex, indices, object}) that are positioned under mouse pointer.
     * @returns {Sculpt[]}
     */
    getIntersections() {
        // todo: use our custom camera later
        this.raycaster.setFromCamera(new THREE.Vector2(this.navigatorGamePad.axes[0], this.navigatorGamePad.axes[1]), Scene.HMDCamera);
        return this.raycaster.raycast(this.raycastLayers);
    }
}

messenger.post(CONST.REQUEST_RODIN_STARTED);

messenger.once(CONST.RODIN_STARTED, () => {
    navigator.mouseGamePad = new MouseNavigatorGamePad();
    GamePad.mouse = new MouseGamePad();
});