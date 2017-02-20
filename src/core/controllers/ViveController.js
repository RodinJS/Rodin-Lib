import {GamePad} from "./gamePads/GamePad.js";
import {ErrorNoValueProvided, ErrorViveControllerAlreadyExists} from "../error";
import {Sculpt} from '../sculpt/Sculpt';
import {Scene} from '../scene';
import {ModelLoader} from '../sculpt/ModelLoader';

let leftHandControllerCreated = false;
let rightHandControllerCreated = false;
/**
 * A controller class for describing HTC Vive controllers event handlers.
 * @param {string} hand Required - "left" or "right".
 * @param {THREE.Scene} scene Required - the scene where the controller will be used.
 * @param {THREE.PerspectiveCamera} camera Required - the camera where the controller will be used.
 * @param {number} raycastLayers - the number of objects that can be reycasted by the same ray.
 */
export class ViveController extends GamePad {
    constructor(hand, raycastLayers = 1) {
        if (!hand) {
            throw new ErrorNoValueProvided();
        }

        if (hand === 'left' && leftHandControllerCreated || hand === 'right' && rightHandControllerCreated) {
            throw new ErrorViveControllerAlreadyExists(hand);
        }

        super('openvr', hand, Scene.active._scene, Scene.active._camera, raycastLayers);

        hand === 'left' ? leftHandControllerCreated = true : rightHandControllerCreated = true;

        /**
         * The length of raycasting ray of controller, the value must be < 0 to maintain correct direction.
         * @type {number}
         */
        this.targetLineDistance = -50;

        /**
         * The raycasting ray Line object of controller (red by default).
         * @type {THREE.Line}
         */
        this.raycastingLine = null;

        // this.standingMatrix = Scene.active._controls.getStandingMatrix();
    }

    /**
     * Get raycasted objects ({distance, point, face, faceIndex, indices, object})of the controller's pointer ray.
     * @returns [Object]
     */
    getIntersections() {
        this.tempMatrix.identity().extractRotation(this.matrixWorld);
        this.raycaster.ray.origin.setFromMatrixPosition(this.matrixWorld);
        this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
        return this.raycaster.raycast();
    }

    /**
     * Custom function to be triggered when controller's pointer ray hovers any raycastable element.
     * By default, this function shortens the pointer ray to the length of controller to element distance.
     * @param {Object} intersect - intersected object ({distance, point, face, faceIndex, indices, object}) at the time of event.
     */
    gamepadHover(intersect) {
        if(!this.raycastingLine) return;
        if(!this.raycastingLine.ready) return;
        this.raycastingLine._threeObject.geometry.vertices[1].z = -intersect[0].distance;
        this.raycastingLine._threeObject.geometry.verticesNeedUpdate = true;
    }

    /**
     * Custom function to be triggered when controller's pointer ray hovers out of any raycastable element.
     * By default, this function resets the pointer ray length.
     */
    gamepadHoverOut() {
        if(!this.raycastingLine) return;
        if(!this.raycastingLine.isReady) return;
        this.raycastingLine._threeObject.geometry.vertices[1].z = this.targetLineDistance;
        this.raycastingLine._threeObject.geometry.verticesNeedUpdate = true;
    }

    /**
     * Set Controller model
     * @param model
     */
    initControllerModel(model) {
        if (!model) {
            model = ModelLoader.load('https://cdn.rodin.io/resources/models/ViveController_v1/model.obj');

            model.on('ready', () => {
                const loader =  new THREE.TextureLoader();
                if(model._threeObject.children[0]) {
                    model._threeObject.children[0].material.map = loader.load('https://cdn.rodin.io/resources/models/ViveController_v1/texture.png');
                    model._threeObject.children[0].material.specularMap = loader.load('https://cdn.rodin.io/resources/models/ViveController_v1/spcular.png');
                }
            })
        }

        const addModel = () => {
            this.controllerModel && this.remove(this.controllerModel._threeObject);
            this.controllerModel = model;
        };

        if (model._threeObject) {
            addModel();
        } else {
            model.on('ready', () => {
                addModel();
            })
        }
    }

    initRaycastingLine() {
        let targetGeometry = new THREE.Geometry();
        targetGeometry.vertices.push(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1)
        );

        let targetLine = new THREE.Line(targetGeometry, new THREE.LineBasicMaterial({color: 0xff0000}));
        targetLine.name = 'targetLine';
        targetLine.geometry.vertices[1].z = this.targetLineDistance;
        this.raycastingLine = new Sculpt(targetLine);
    }
}


