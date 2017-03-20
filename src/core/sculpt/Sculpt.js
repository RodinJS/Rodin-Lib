import {ErrorBadValueParameter, ErrorProtectedMethodCall, ErrorPluginAlreadyInstalled} from '../error';
import {EventEmitter} from '../eventEmitter';
import {string} from '../utils';
import {RodinEvent} from '../rodinEvent';
import * as CONST from '../constants';
import {WrappedVector3, WrappedEuler, WrappedQuaternion} from '../utils/threeWrappers';
import {AnimationPlugin} from '../animation';
import {Loader} from '../loader';

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
            /*if(args.material && args.material.map === null){
             args.material.map = texture;
             texture.needsUpdate = true;
             args.material.needsUpdate = true;
             }*/
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

/**
 * Sculpt
 */
export class Sculpt extends EventEmitter {
    constructor(args, deferReadyEvent) {
        super();

        args = normalizeArguments(args);

        /**
         * Three object
         * @type {null}
         * @private
         */
        this._threeObject = null;

        /**
         * Parent Sculpt
         * @type {null}
         * @private
         */
        this._parent = null;

        /**
         * Is this object gamepadVisible
         * @type {boolean}
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
         */
        this.name = args.name;

		this.plugins = [];

        /**
         * Position
         */
        this._position = new WrappedVector3();
        this._position.onChange((position) => {
            this.position = position;
        });

        /**
         * Rotation
         */
        this._rotation = new WrappedEuler();
        this._rotation.onChange((rotation) => {
            this.rotation = rotation;
        });

        /**
         * Quaternion
         */
        this._quaternion = new WrappedQuaternion();
        this._quaternion.onChange((quaternion) => {
            this.quaternion = quaternion;
        });

        /**
         * Scale
         */
        this._scale = new WrappedVector3();
        this._scale.onChange((scale) => {
            this.scale = scale;
        });

        /**
         * Global Position
         */
        this._globalPosition = new WrappedVector3();
        this._globalPosition.onChange((globalPosition) => {
            this.globalPosition = globalPosition;
        });

        /**
         * Global Rotation
         */
        this._globalRotation = new WrappedEuler();
        this._globalRotation.onChange((rotation) => {
            this.globalRotation = rotation;
        });

        /**
         * Global Quaternion
         */
        this._globalQuaternion = new WrappedQuaternion();
        this._globalQuaternion.onChange((quaternion) => {
            this.globalQuaternion = quaternion;
        });

        /**
         * Global Scale
         */
        this._globalScale = new WrappedVector3();
        this._globalScale.onChange((globalScale) => {
            this.globalScale = globalScale;
        });


        // process arguments
        switch (true) {
            case !!args.sculpt:
                this.copy(args.sculpt);
                this._ready = true;
                this._threeObject.Sculpt = this;
                !deferReadyEvent && this.emitAsync(CONST.READY, new RodinEvent(this));
                break;

            case !!args.threeObject:
                this._threeObject = args.threeObject;
                this._syncWithThree();
                this._ready = true;
                this._threeObject.Sculpt = this;
                !deferReadyEvent && this.emitAsync(CONST.READY, new RodinEvent(this));
                break;

            case !!args.url:
                Loader.loadModel(args.url, (mesh) => {
                    this._threeObject = mesh;
                    this._syncWithThree();
                    this._ready = true;
                    this._threeObject.Sculpt = this;
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
         * @type {boolean}
         * @private
         */
        this._ready = false;

        this.on(CONST.READY, () => {
            this._ready = true;
            this._threeObject.Sculpt = this;
        });

		this.on(CONST.UPDATE, () => {
			this.children.map(child => {
				if (child.isReady) {
					child.emit(CONST.UPDATE, new RodinEvent(child, {}));
				}
			});
		});

		this.install(AnimationPlugin);
	}

    emitReady = () => {
        this.emitAsync(CONST.READY, new RodinEvent(this));
    };

    /**
     * gets visibility of object
     */
    get visible() {
        return this._threeObject.visible;
    }

    /**
     * set visibility of object
     */
    set visible(value) {
        this._threeObject.visible = value;
    }

    /**
     * gets global visibility of sculpt
     * returns false, if one of parents is invisible, otherwise returns true
     * @return {boolean}
     */
    get globalVisible() {
        if (!this.visible) return false;
        if (this._parent && this._parent.isSculpt) {
            return this._parent.globalVisible;
        }
        return true;
    }

    /**
     * to check if an object is of sculpt type
     * @returns {boolean} true
     */
    get isSculpt() {
        return true;
    }

    /**
     * to check if our sculpt is ready
     * @returns {boolean}
     */
    get isReady() {
        return this._ready
    }

    /**
     * gets our parent
     */
    get parent() {
        return this._parent;
    }

    /**
     * Set new parent
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
     * Sets the position of our object with respect to its parent (local)
     * @param position {THREE.Vector3}
     */
    set position(position) {
        this._threeObject.position.copy(position);
        this._position.silentCopy(this._threeObject.position);
    }

    /**
     * Check if this sculpt is gamepadVisible
     * @return {boolean}
     */
    get gamepadVisible() {
        return this._gamepadVisible;
    }

    /**
     * Sets if this sculpt gamepadVisible or not gamepadVisible
     * @param value {boolean}
     */
    set gamepadVisible(value) {
        this._gamepadVisible = !!value;
    }

    /**
     * Gets the position of our object with respect to its parent (local)
     * @return {THREE.Vector3}
     */
    get position() {
        // not sure if we should copy threeObject.position to our position
        // this will sync us with threeobject but make things 2x slow
        this._position.silentCopy(this._threeObject.position);
        return this._position;
    }

    /**
     * Sets the rotation of our object with respect to its parent (local)
     * @param rotation {THREE.Vector3}
     */
    set rotation(rotation) {
        this._threeObject.rotation.copy(rotation);
        this._rotation.silentCopy(this._threeObject.rotation);
    }

    /**
     * Gets the rotation of our object with respect to its parent (local)
     * @return {THREE.Vector3}
     */
    get rotation() {
        this._rotation.silentCopy(this._threeObject.rotation);
        return this._rotation;
    }

    /**
     * Sets the quaternion of our object with respect to its parent (local)
     * @param quaternion {THREE.Quaternion}
     */
    set quaternion(quaternion) {
        this._threeObject.quaternion.copy(quaternion);
        this._quaternion.silentCopy(this._threeObject.quaternion);
    }

    /**
     * Gets the quaternion of our object with respect to its parent (local)
     * @return {THREE.Quaternion}
     */
    get quaternion() {
        this._quaternion.silentCopy(this._threeObject.quaternion);
        return this._quaternion;
    }

    /**
     * Sets the scale of our object
     * @param scale {THREE.Vector3}
     */
    set scale(scale) {
        this._threeObject.scale.copy(scale);
        this._scale.silentCopy(this._threeObject.scale);
    }

    /**
     * Gets the scale of our object
     * @return {THREE.Vector3}
     */
    get scale() {
        return this._scale;
    }

    /**
     * Sets the position of our object with respect to scene (global)
     * @param position {THREE.Vector3}
     */
    set globalPosition(position) {
        const initialPosition = new THREE.Vector3();
        const initialRotation = new THREE.Quaternion();
        const initialScale = new THREE.Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);
        this.globalMatrix = this.globalMatrix.compose(position, initialRotation, initialScale);

        // use copy to preserve type of _globalPosition, i.e. WrappedVector3
        // dont use direct copy to prevent infinite recursion
        // implement this with a separate function to prevent this
        this._globalPosition.silentCopy(position);
    }

    /**
     * Gets the position of our object with respect to scene (global)
     * @return {THREE.Vector3}
     */
    get globalPosition() {
        // global get ers are very slow right now,
        // we can sync this with position and matrix
        // setters to make faster but will slow down those

        const initialPosition = new THREE.Vector3();
        const initialRotation = new THREE.Quaternion();
        const initialScale = new THREE.Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);

        this._globalPosition.silentCopy(initialPosition);
        return this._globalPosition;
    }

    /**
     * Sets the rotation of our object with respect to scene (global)
     * @param rotation {THREE.Euler}
     */
    set globalRotation(rotation) {
        const initialPosition = new THREE.Vector3();
        const initialRotation = new THREE.Quaternion();
        const initialScale = new THREE.Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);
        initialRotation.setFromEuler(rotation);
        this.globalMatrix = this.globalMatrix.compose(initialPosition, initialRotation, initialScale);

        this._globalScale.silentCopy(rotation);
    }

    /**
     * Gets the scale of our object with respect to scene (global)
     * @return {THREE.Euler}
     */
    get globalRotation() {
        const initialPosition = new THREE.Vector3();
        const initialRotation = new THREE.Quaternion();
        const initialScale = new THREE.Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);
        //create a new Euler in order to use silentCopy
        this._globalRotation.silentCopy(new THREE.Euler().setFromQuaternion(initialRotation, this._globalRotation.order));
        return this._globalRotation;
    }

    /**
     * Sets the quaternion of our object with respect to scene (global)
     * @param quaternion {THREE.Quaternion}
     */
    set globalQuaternion(quaternion) {
        const initialPosition = new THREE.Vector3();
        const initialRotation = new THREE.Quaternion();
        const initialScale = new THREE.Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);
        this.globalMatrix = this.globalMatrix.compose(initialPosition, quaternion, initialScale);

        this._globalQuaternion.silentCopy(quaternion);
    }

    /**
     * Gets the quaternion of our object with respect to scene (global)
     * @return {THREE.Quaternion}
     */
    get globalQuaternion() {
        const initialPosition = new THREE.Vector3();
        const initialRotation = new THREE.Quaternion();
        const initialScale = new THREE.Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);

        this._globalQuaternion.silentCopy(initialRotation);
        return this._globalQuaternion;
    }

    /**
     * Sets the scale of our object with respect to scene (global)
     * @param scale {THREE.Vector3}
     */
    set globalScale(scale) {
        const initialPosition = new THREE.Vector3();
        const initialRotation = new THREE.Quaternion();
        const initialScale = new THREE.Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);
        this.globalMatrix = this.globalMatrix.compose(initialPosition, initialRotation, scale);

        this._globalScale.silentCopy(scale);
    }

    /**
     * Gets the scale of our object with respect to scene (global)
     * @return {THREE.Vector3}
     */
    get globalScale() {
        const initialPosition = new THREE.Vector3();
        const initialRotation = new THREE.Quaternion();
        const initialScale = new THREE.Vector3();

        this.globalMatrix.decompose(initialPosition, initialRotation, initialScale);
        this._globalScale.silentCopy(initialScale);
        return this._globalScale;
    }

    /**
     * Sets the matrix of out object with respect to its parent (local)
     * @param matrix {THREE.Matrix4}
     */
    set matrix(matrix) {
        /*if(this._threeObject.scale.x != 1){
            console.log(matrix);
        }*/
        this._threeObject.matrix = matrix;
        matrix.decompose(this._threeObject.position, this._threeObject.quaternion, this._threeObject.scale);
        this._syncWithThree();
    }

    /**
     * Gets the matrix of our object with respect to its parent (local)
     * @return {THREE.Matrix4} [recursive=true]
     */
    get matrix() {
        //this._threeObject.updateMatrix(true);
        return this._threeObject.matrix;
    }

    /**
     * Set the matrix of out object with respect to the scene it is in (global)
     * if our object doesn't have a parent same as .matrix
     * @param matrix {THREE.Matrix4}
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
     * Gets the matrix of our object with respect to the scene it is in (global)
     * if our object doesn't have a parent same as .matrix
     * @return {THREE.Matrix4}
     */
    get globalMatrix() {
        this._threeObject.updateMatrixWorld(true);
        return this._threeObject.matrixWorld;
    }

	get children() {
		return this._children;
	}

	/**
	 * Copies obj into our object
	 * @param {Sculpt} sculpt
	 * @param {boolean} [recursive=true]
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
     * Creates a new sculpt object that is a clone of our object
     * @param {boolean} [recursive=true]
     */
    clone(recursive = true) {
        return new this.constructor().copy(this, recursive);
    }

    /**
     * Add object(s) to this object.
     * Call with multiple arguments of Sculpt objects
     * Not available for user
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
        }
    }

    install(plugin, ...args) {
        let found = false;
        if(this.plugins.filter(pluginInstance => pluginInstance.constructor === plugin).length > 0) {
            throw new ErrorPluginAlreadyInstalled(plugin);
        }

        const pluginInstance = new plugin(...args);
        this.plugins.push(pluginInstance);
        pluginInstance.applyTo(this);
    }

    /**
     * Remove object(s) from
     * Call with multiple arguments of Sculpt objects
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
            return;
        }

        for (let i = 1; i < arguments.length; i++) {
            if (!arguments[i].isSculpt) {
                throw new ErrorBadValueParameter('Sculpt');
            }

            this.children.indexOf(arguments[i]) > -1 && this.children.splice(this.children.indexOf(arguments[i]), 1);
            this._threeObject.remove(arguments[i]._threeObject);
        }
    }

    /**
     * Syncs sculpts parameters with _threeObject parameters
     * call this in case you modify _threeObject
     * Note. this does not work if you added or removed children from _threeObject
     */
    _syncWithThree() {
        this._position.silentCopy(this._threeObject.position);
        this._rotation.silentCopy(this._threeObject.rotation);
        this._scale.silentCopy(this._threeObject.scale);
        this._quaternion.silentCopy(this._threeObject.quaternion);
    }
}
