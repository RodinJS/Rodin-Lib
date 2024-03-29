import {GamePad} from "./GamePad.js";
import * as CONST from '../constants/index.js';
import {Sculpt} from '../sculpt/index.js';
import {messenger} from '../messenger/index.js';
import * as Buttons from '../button/index.js';
import {Vector3, Quaternion} from '../math/index.js';
import {Avatar} from '../avatar/index.js';

/**
 * A gamepad class for describing Google DayDream gamepads event handlers.
 * @param {string} hand Required - "left" or "right".
 */
export class DaydreamGamePad extends GamePad {
    constructor() {
        super('Daydream', null, CONST.VR);
        /**
         * An array with Button objects.
         * @type {Button[]}
         */
        this.buttons = [Buttons.daydreamTrigger];

        this.initControllerModel();
        this.initRaycastingLine();

        messenger.post(CONST.REQUEST_ACTIVE_SCENE);
    }

    /**
     * Updates gamepad object in scene, updates position and rotation.
     */
    updateObject() {
        let pose = this.navigatorGamePad.pose;

        if (!pose) return;

        //this.sculpt.globalPosition.set(0, 1.6, -2);
        let position = Avatar.active.globalPosition.clone();
        position.y -= Avatar.userHeight / 3;

        const avatarRight = new Vector3(0.15, 0, -0.15).applyQuaternion(Avatar.active.HMDCamera.globalQuaternion);
        position = position.add(avatarRight);

        const forearmEffect = new Vector3(0,0,-0.35).applyQuaternion(new Quaternion().fromArray(pose.orientation));
        position = position.add(forearmEffect);

        this.sculpt.globalPosition.copy(position);


        // todo: check this logic
        //if (pose.position !== null) this.sculpt.position.fromArray(pose.position);
        if (pose.orientation !== null) this.sculpt.quaternion.fromArray(pose.orientation);
        this.sculpt.matrix.compose(this.sculpt._threeObject.position, this.sculpt.quaternion, this.sculpt.scale);
        this.sculpt.matrix = this.sculpt.matrix.multiplyMatrices(Avatar.standingMatrix, this.sculpt._threeObject.matrix);
        this.sculpt._threeObject.matrixWorldNeedsUpdate = true;


    }

    /**
     * Get raycasted objects ({distance, point, face, faceIndex, indices, object})of the gamepad's pointer ray.
     * @returns {Sculpt[]}
     */
    getIntersections() {
        const tempMatrix = new THREE.Matrix4().identity().extractRotation(this.sculpt.globalMatrix);
        this.raycaster.ray.origin.setFromMatrixPosition(this.sculpt.globalMatrix);
        this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        return this.raycaster.raycast(this.raycastLayers);
    }

    /**
     * Set Gamepad model to Google DayDream gamepad model.
     * @param {string} [url] - url to .obj model of the gamepad.
     */
    initControllerModel(url = 'https://cdn.rodin.io/resources/models/DaydreamController/daydream_controller.obj') {
        this.controllerModel = new Sculpt(url);

        this.controllerModel.on(CONST.READY, () => {
            this.controllerModel.parent = this.sculpt;
        });
    }

    /**
     * Init raycasting line. Create a line for gamepad direction
     *
     * @param {number} [color=0xff0000]
     */
    initRaycastingLine(color = 0xff0000) {
        let targetGeometry = new THREE.Geometry();
        targetGeometry.vertices.push(
            new Vector3(0, 0, 0),
            new Vector3(0, 0, -1)
        );

        let targetLine = new THREE.Line(targetGeometry, new THREE.LineBasicMaterial({color: color}));
        targetLine.geometry.vertices[1].z = -1000;
        /**
         * The raycasting line Sculpt.
         * @type {Sculpt}
         */
        this.raycastingLine = new Sculpt(targetLine);
        this.raycastingLine.gamepadVisible = false;
        this.raycastingLine.parent = this.sculpt;
    }
}

messenger.post(CONST.REQUEST_RODIN_STARTED);

messenger.once(CONST.RODIN_STARTED, () => {
    GamePad.daydream = new DaydreamGamePad();
});
