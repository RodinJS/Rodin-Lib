import {ErrorBadValueParameter, ErrorPluginAlreadyInstalled} from '../error';
import {EventEmitter} from '../eventEmitter';
import {string} from '../utils';
import {RodinEvent} from '../rodinEvent';
import * as CONST from '../constants';
import {Vector3, Euler, Quaternion} from '../math';
import {AnimationPlugin} from '../animation';
import {Loader} from '../loader';
import {messenger} from '../messenger';

function enforce() {
}

function normalizeArguments(args = {threeObject: new THREE.Object3D()}) {
    switch (true) {
        case args.isSculpt:
            //if we get a Sculpt object
            //copy it into us
            args = {sculpt: args};
            break;
        case args.isObject3D:
            //if we get a three object 3D
            //use it as our base
            args = {threeObject: args};
            break;
        case typeof args === 'string':
            //assume we got a url to a model
            args = {url: args};
            break;
    }

    return Object.assign({
        name: undefined,
        url: undefined,
        threeObject: undefined,
        sculpt: undefined
    }, args);
}

const GAMEPAD_EVENTS = [
    CONST.GAMEPAD_HOVER,
    CONST.GAMEPAD_HOVER_OUT,
    CONST.GAMEPAD_BUTTON_DOWN,
    CONST.GAMEPAD_BUTTON_UP,
    CONST.GAMEPAD_BUTTON_CHANGE,
    CONST.GAMEPAD_BUTTON,
    CONST.GAMEPAD_MOVE
];

const pendingElements = new Set();

const raycastables = [];

/**
 * Sculpt is a base class for a 3d object in Rodin Lib,
 * Any 3d object should be either a direct Sculpt, or extended from Sculpt
 * @param {Sculpt|String|THREE.Object3D} args
 * @param {Boolean} [deferReadyEvent=false] deferReadyEvent
 */
export class Sculpt extends EventEmitter {
    constructor(args, deferReadyEvent) {
        super();

        // todo: fix this logic later
        pendingElements.add(this);
        this.on(CONST.READY, () => {
            pendingElements.delete(this);
            if (pendingElements.size === 0)
                messenger.post(CONST.ALL_SCULPTS_READY, {});
        });

        args = normalizeArguments(args);

        /**
         * Three object
         * @type {THREE.Object3D}
         * @private
         */
        this._threeObject = null;

        /**
         * Parent Sculpt
         * @type {Sculpt}
         * @private
         */
        this._parent = null;

        /**
         * Is this object gamepadVisible
         * @type {Boolean}
         * @private
         */
        this._gamepadVisible = true;

        /**
         * Object's children
         * @type {Set}
         * @private
         */
        this._children = [];

        /**
         * name
         * @type {String}
         */
        this.name = args.name;

        this.plugins = [];

        /**
         * Position
         * @type {Vector3}
         * @private
         */
        this._position = new Vector3();
        this._position.onChange((position) => {
            this.position = position;
        });

        /**
         * Rotation
         * @type {Euler}
         * @private
         */
        this._rotation = new Euler();
        this._rotation.onChange((rotation) => {
            this.rotation = rotation;
        });

        /**
         * Quaternion
         * @type {Quaternion}
         * @private
         */
        this._quaternion = new Quaternion();
        this._quaternion.onChange((quaternion) => {
            this.quaternion = quaternion;
        });

        /**
         * Scale
         * @type {Vector3}
         * @private
         */
        this._scale = new Vector3();
        this._scale.onChange((scale) => {
            this.scale = scale;
        });

        /**
         * Global Position
         * @type {Vector3}
         * @private
         */
        this._globalPosition = new Vector3();
        this._globalPosition.onChange((globalPosition) => {
            this.globalPosition = globalPosition;
        });

        /**
         * Global Rotation
         * @type {Euler}
         * @private
         */
        this._globalRotation = new Euler();
        this._globalRotation.onChange((rotation) => {
            this.globalRotation = rotation;
        });

        /**
         * Global Quaternion
         * @type {Quaternion}
         * @private
         */
        this._globalQuaternion = new Quaternion();
        this._globalQuaternion.onChange((quaternion) => {
            this.globalQuaternion = quaternion;
        });

        /**
         * Global Scale
         * @type {Vector3}
         * @private
         */
        this._globalScale = new Vector3();
        this._globalScale.onChange((globalScale) => {
            this.globalScale = globalScale;
        });


        // process arguments
        switch (true) {
            case !!args.sculpt:
                this.copy(args.sculpt);
                this._ready = true;
                !deferReadyEvent && this.emitAsync(CONST.READY, new RodinEvent(this));
                break;

            case !!args.threeObject:
                this._threeObject = args.threeObject;
                this._syncWithThree();
                this._ready = true;
                !deferReadyEvent && this.emitAsync(CONST.READY, new RodinEvent(this));
                break;

            case !!args.url:
                Loader.loadModel(args.url, (mesh) => {
                    this._threeObject = mesh;
                    this._syncWithThree();
                    this._ready = true;
                    !deferReadyEvent && this.emitAsync(CONST.READY, new RodinEvent(this));
                });
                break;
        }

        /**
         * parent
         * @type {Sculpt}
         * @private
         */
        this._parent = null;

        /**
         * check if sculpt is ready
         * @type {Boolean}
         * @private
         */
        this._ready = false;

        this.on(CONST.READY, () => {
            this._ready = true;
            this._threeObject.Sculpt = this;
            if(!!args.url || !!args.threeObject){
                for(let i = 0; i < this._threeObject.children.length; i++){
                    this._threeObject.children[i].Sculpt = this;
                }
            }

        });

        this.on(CONST.UPDATE, (evt) => {
            for (let i = 0; i < this.children.length; i++) {
                if (this.children[i].isReady) {
                    evt.target = this.children[i];
                    this.children[i].emit(CONST.UPDATE, evt);
                }
            }
        });

        this.install(AnimationPlugin);

    }

    /**
     * Get all raycastable sculpts (Which has events from Gampepads)
     * @return {Array}
     */
    static get raycastables() {
        return raycastables;
    }

    /**
     * Emit ready event, used when this event needs to be emitted manually (deferReadyEvent).
     * For example, when a class extended from Sculpt, builds an object in constructor,
     * and needs to emit ready event, only after the constructor has finished it's job.
     * @return {Boolean}
     */
    emitReady() {
        this.emitAsync(CONST.READY, new RodinEvent(this));
    };

    /**
     * Gets the geometry of the object
     * @type {THREE.Geometry}
     */
    get geometry() {
        return this._threeObject.geometry;
    }

    /**
     * Sets geometry of the object
     * @type {THREE.Geometry}
     */
    set geometry(geo) {
        this._threeObject.geometry = geo;
    }

    /**
     * Gets the material of the object
     * @type {THREE.Material}
     */
    get material() {
        return this._threeObject.material;
    }

    /**
     * Sets material of the object
     * @type {THREE.Material}
     */
    set material(mat) {
        this._threeObject.material = mat;
    }

    /**
     * Gets visibility of the object
     * @type {Boolean}
     */
    get visible() {
        return this._threeObject.visible;
    }

    /**
     * Sets visibility of the object
     * @type {Boolean}
     */
    set visible(value) {
        this._threeObject.visible = value;
    }

    /**
     * Gets the global visibility of sculpt.
     * Returns false, if one of parents is invisible, otherwise returns true.
     * @type {Boolean}
     */
    get globalVisible() {
        if (!this.visible) return false;
        if (this._parent && this._parent.isSculpt) {
            return this._parent.globalVisible;
        }
        return true;
    }

    /**
     * Checks if this object is of sculpt type.
     * @type {Boolean}
     */
    get isSculpt() {
        return true;
    }

    /**
     * Checks if this sculpt object is ready.
     * @type {Boolean}
     */
    get isReady() {
        return this._ready
    }

    /**
     * Gets this object's parent.
     * @type {Sculpt|null}
     */
    get parent() {
        return this._parent;
    }

    /**
     * Sets new parent for this object.
     * @type {Sculpt|null}
     */
    set parent(parent) {
        if (parent === null) {
            this.savedMatrix = this.matrix;
            if (this.parent)
                this.parent.remove(enforce, this);
            this._parent = null;
            return;
        }
        if (parent.isSculpt) {
            parent.add(enforce, this);
        } else {
            parent.add(this);
        }

        if (this.savedMatrix) {
            this.matrix = this.savedMatrix;
            delete this.savedMatrix;
        }
    }

    /**
     * Sets the position of this object relative to it's parent (local).
     * @type {Vector3}
     */
    set position(position) {
        this._threeObject.position.copy(position);
        this._position.silentCopy(this._threeObject.position);
    }

    /**
     * Checks if this sculpt is visible for gamepads.
     * @type {Boolean}
     */
    get gamepadVisible() {
        return this._gamepadVisible;
    }

    /**
     * Sets this sculpt visible/invisible for gamepads.
     * @type {Boolean}
     */
    set gamepadVisible(value) {
        this._gamepadVisible = value;
    }

    /**
     * Gets the position of this object relative to it's parent (local)
     * @type {Vector3}
     */
    get position() {
        // not sure if we should copy threeObject.position to our position
        // this will sync us with threeobject but make things 2x slow
        this._position.silentCopy(this._threeObject.position);
        return this._position;
    }

    /**
     * Sets the rotation of this object relative to it's parent (local)
     * @type {Vector3}
     */
    set rotation(rotation) {
        this._threeObject.rotation.copy(rotation);
        this._rotation.silentCopy(this._threeObject.rotation);
    }

    /**
     * Gets the rotation of this object relative to it's parent (local)
     * @type {Vector3}
     */
    get rotation() {
        this._rotation.silentCopy(this._threeObject.rotation);
        return this._rotation;
    }

    /**
     * Sets the quaternion of this object relative to it's parent (local)
     * @type {Quaternion}
     */
    set quaternion(quaternion) {
        this._threeObject.quaternion.copy(quaternion);
        this._quaternion.silentCopy(this._threeObject.quaternion);
    }

    /**
     * Get the quaternion of this object relative to it's parent (local)
     * @type {Quaternion}
     */
    get quaternion() {
        this._quaternion.silentCopy(this._threeObject.quaternion);
        return this._quaternion;
    }

    /**
     * Sets the scale of this object
     * @type {Vector3}
     */
    set scale(scale) {
        this._threeObject.scale.copy(scale);
        this._scale.silentCopy(this._threeObject.scale);
    }

    /**
     * Gets the scale of this object
     * @type {Vector3}
     */
    get scale() {
        return this._scale;
    }

    /**
     * Sets the position of this object relative to the scene (global)
     * @type {Vector3}
     */
    set globalPosition(position) {
        const initialPosition = new Vector3();
        const initialRotation = new Quaternion();
        const initialScale = new Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);
        this.globalMatrix = this.globalMatrix.compose(position, initialRotation, initialScale);

        // use copy to preserve type of _globalPosition, i.e. Rodin Vector3
        // dont use direct copy to prevent infinite recursion
        // implement this with a separate function to prevent this
        this._globalPosition.silentCopy(position);
    }

    /**
     * Gets the position of this object relative to the scene (global)
     * @type {Vector3}
     */
    get globalPosition() {
        // global get ers are very slow right now,
        // we can sync this with position and matrix
        // setters to make faster but will slow down those

        const initialPosition = new Vector3();
        const initialRotation = new Quaternion();
        const initialScale = new Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);

        this._globalPosition.silentCopy(initialPosition);
        return this._globalPosition;
    }

    /**
     * Sets the rotation of this object relative to the scene (global)
     * @type {Euler}
     */
    set globalRotation(rotation) {
        const initialPosition = new Vector3();
        const initialRotation = new Quaternion();
        const initialScale = new Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);
        initialRotation.setFromEuler(rotation);
        this.globalMatrix = this.globalMatrix.compose(initialPosition, initialRotation, initialScale);

        this._globalScale.silentCopy(rotation);
    }

    /**
     * Gets the rotation of this object relative to the scene (global)
     * @type {Euler}
     */
    get globalRotation() {
        const initialPosition = new Vector3();
        const initialRotation = new Quaternion();
        const initialScale = new Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);
        //create a new Euler in order to use silentCopy
        this._globalRotation.silentCopy(new Euler().setFromQuaternion(initialRotation, this._globalRotation.order));
        return this._globalRotation;
    }
    /**
     * Gets the direction of this object relative to the scene
     * @type {Vector3}
     */
    get globalDirection() {
        return this._threeObject.getWorldDirection();
    }

    /**
     * Sets the quaternion of this object relative to the scene (global)
     * @type {Quaternion}
     */
    set globalQuaternion(quaternion) {
        const initialPosition = new Vector3();
        const initialRotation = new Quaternion();
        const initialScale = new Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);
        this.globalMatrix = this.globalMatrix.compose(initialPosition, quaternion, initialScale);

        this._globalQuaternion.silentCopy(quaternion);
    }

    /**
     * Gets the quaternion of this object relative to the scene (global)
     * @type {Quaternion}
     */
    get globalQuaternion() {
        const initialPosition = new Vector3();
        const initialRotation = new Quaternion();
        const initialScale = new Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);

        this._globalQuaternion.silentCopy(initialRotation);
        return this._globalQuaternion;
    }

    /**
     * Sets the scale of this object relative to the scene (global)
     * @type{Vector3}
     */
    set globalScale(scale) {
        const initialPosition = new Vector3();
        const initialRotation = new Quaternion();
        const initialScale = new Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);
        this.globalMatrix = this.globalMatrix.compose(initialPosition, initialRotation, scale);

        this._globalScale.silentCopy(scale);
    }

    /**
     * Gets the scale of this object relative to the scene (global)
     * @type {Vector3}
     */
    get globalScale() {
        const initialPosition = new Vector3();
        const initialRotation = new Quaternion();
        const initialScale = new Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);
        this._globalScale.silentCopy(initialScale);
        return this._globalScale;
    }

    /**
     * Sets the matrix of out object relative to it's parent (local)
     * @type {THREE.Matrix4}
     */
    set matrix(matrix) {
        this._threeObject.matrix = matrix;
        matrix.decompose(this._threeObject.position, this._threeObject.quaternion, this._threeObject.scale);
        this._syncWithThree();
    }

    /**
     * Gets the matrix of this object relative to it's parent (local)
     * @type {THREE.Matrix4}
     */
    get matrix() {
        //this._threeObject.updateMatrix(true);
        return this._threeObject.matrix;
    }

    /**
     * Sets the matrix of this object relative to the scene (global)
     * if our object doesn't have a parent, this function is equivalent to .matrix setter
     * @type {THREE.Matrix4}
     */
    set globalMatrix(matrix) {
        if (!this.parent) {
            this.matrix = matrix;
            return;
        }

        let inverseParentMatrix = new THREE.Matrix4();
        let newLocalMatrix = matrix.clone();

        inverseParentMatrix.getInverse(this.parent.globalMatrix);
        newLocalMatrix.multiplyMatrices(inverseParentMatrix, newLocalMatrix);

        this._threeObject.matrixAutoUpdate = false;
        //do this on sculpt.matrix not _threeObject.matrix to update position,rotation,scale
        this.matrix = newLocalMatrix;
        this._threeObject.updateMatrixWorld(true);
        this._threeObject.matrixAutoUpdate = true;
    }

    /**
     * Gets the matrix of this object relative to the scene (global)
     * if this object doesn't have a parent, this function is equivalent to .matrix getter
     * @type {THREE.Matrix4}
     */
    get globalMatrix() {
        this._threeObject.updateMatrixWorld(true);
        return this._threeObject.matrixWorld;
    }

    /**
     * Gets the Set of this object's children.
     * @type {Set.<Sculpt>}
     */
    get children() {
        return this._children;
    }

    /**
     * todo: @serg mi hat esi nayi
     * Override EventEmitter on method.
     * @param channel {string[]|string}
     * @param cb {Function}
     */
    on(channel, cb) {
        super.on(channel, cb);

        if (GAMEPAD_EVENTS.indexOf(channel) !== -1) {
            // todo: fix this Logic. In Ready event
            if (this.isReady) {
                Sculpt.raycastables.push(this._threeObject);
                for (let i = 0; i < this._threeObject.children.length; i++)
                    Sculpt.raycastables.push(this._threeObject.children[i]);
            }
            else
                this.on(CONST.READY, () => {
                    Sculpt.raycastables.push(this._threeObject);
                    for (let i = 0; i < this._threeObject.children.length; i++)
                        Sculpt.raycastables.push(this._threeObject.children[i]);
                })
        }
    }

    /**
     * Copies given object's parameters into this object
     * @param {Sculpt} sculpt
     * @param {Boolean} [recursive=true]
     */
    copy(sculpt, recursive = true) {
        if (!sculpt.isSculpt) {
            throw new ErrorBadValueParameter('Sculpt');
        }

        this.name = sculpt.name;
        this._threeObject = sculpt._threeObject.clone(recursive);
        this._syncWithThree();
        if (recursive) {
            for (let i = 0; i < sculpt._children.length; i++) {
                sculpt._children[i].clone(recursive).parent = this;
            }
        }

        return this;
    }

    /**
     * Creates a new sculpt object that is a clone of this object
     * @param {Boolean} [recursive=true]
     */
    clone(recursive = true) {
        return new this.constructor().copy(this, recursive);
    }


    get scene(){
        return this._scene;
    }

    setScene(e, s){
        if (e !== enforce) {
            throw new ErrorProtectedMethodCall('setScene');
            return;
        }
        this._scene = s;
        const l = this.children.length;
        for (let i = 0; i < l; i++) {
            if (!this.children[i].isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
                continue;
            }
            this.children[i].setScene(enforce, s);
        }
    }

    /**
     * Adds object(s) to this object.
     * Call with one or more arguments of Sculpt type
     * @private
     */
    add(e) {
        if (e !== enforce) {
            //throw new ErrorProtectedMethodCall('add');
            if (!e.isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
            }

            let currParent = e.parent;
            currParent && currParent.remove(enforce, e);

            e._parent = this;
            this._threeObject.add(e._threeObject);
            this.children.push(e);
            e.setScene(enforce,  this._scene);
            return;
        }

        for (let i = 1; i < arguments.length; i++) {
            if (!arguments[i].isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
            }

            let globalMatrix = arguments[i].globalMatrix;
            // this is a workaround because cant figure out whats not working
            let oldScale = arguments[i].globalScale.clone();

            let currParent = arguments[i].parent;
            currParent && currParent.remove(enforce, arguments[i]);

            arguments[i]._parent = this;
            this._threeObject.add(arguments[i]._threeObject);
            this.children.push(arguments[i]);

            arguments[i].globalMatrix = globalMatrix;
            arguments[i].setScene(enforce, this._scene);
        }
    }

    /**
     * Install a plugin to this object.
     *<p>See also <a href="Plugin.html">Plugin</a> and <a href="AnimationPlugin.html">AnimationPlugin</a> </p>
     * @param plugin
     * @param args
     */

    install(plugin, ...args) {
        if (this.plugins.filter(pluginInstance => pluginInstance.constructor === plugin).length > 0) {
            throw new ErrorPluginAlreadyInstalled(plugin);
        }

        const pluginInstance = new plugin(...args);
        this.plugins.push(pluginInstance);
        pluginInstance.applyTo(this);
    }

    /**
     * Removes object(s) from
     * Call with one or more arguments of Sculpt type
     * Not available for user
     */
    remove(e) {
        if (e !== enforce) {
            //throw new ErrorProtectedMethodCall('remove');
            if (!e.isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
            }
            this.children.indexOf(e) > -1 && this.children.splice(this.children.indexOf(e), 1);
            this._threeObject.remove(e._threeObject);
            e.setScene(enforce, null);
            return;
        }

        for (let i = 1; i < arguments.length; i++) {
            if (!arguments[i].isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
            }

            this.children.indexOf(arguments[i]) > -1 && this.children.splice(this.children.indexOf(arguments[i]), 1);
            this._threeObject.remove(arguments[i]._threeObject);
            arguments[i].setScene(enforce, null);
        }
    }

    /**
     * Syncs sculpts parameters with _threeObject parameters
     * call this in case you modify _threeObject
     * Note. this does not apply to the children of the _threeObject
     */
    _syncWithThree() {
        this._position.silentCopy(this._threeObject.position);
        this._rotation.silentCopy(this._threeObject.rotation);
        this._scale.silentCopy(this._threeObject.scale);
        this._quaternion.silentCopy(this._threeObject.quaternion);
    }
}
