import * as number from '../utils/number';

/**
 * Vector3 representing class, with some extra features.
 * @param {number} [x = 0] - the x value of the vector, whenever this parameter is changed, onChangeCallback() methods will be called
 * @param {number} [y = 0] - the y value of the vector, whenever this parameter is changed, onChangeCallback() methods will be called
 * @param {number} [z = 0] - the z value of the vector, whenever this parameter is changed, onChangeCallback() methods will be called
 */
export function Vector3(...args) {
    THREE.Vector3.apply(this, args);

    let privates = {x: this.x, y: this.y, z: this.z};

    let callbacks = [];

    const callCallbacks = () => {
        for (let i = 0; i < callbacks.length; i++) {
            callbacks[i](this);
        }
    };

    let setters = ['x', 'y', 'z'];

    for (let i in setters) {
        Object.defineProperty(this, setters[i], {
            get: () => {
                return privates[setters[i]];
            },
            set: (val) => {
                privates[setters[i]] = val;
                callCallbacks(this);
            }
        });
    }

    /**
     * An overridden method of adding callback (instead of setting)
     * @param {function} callback
     */
    this.onChange = (callback) => {
        callbacks.push(callback);
    };

    /**
     * Sets the x, y, z values of the given object to this Vector3 and returns this.
     * @param {object} val - with x, y, z, numeric parameters
     * @returns {Vector3}
     */
    this.silentCopy = (val) => {
        privates.x = val.x;
        privates.y = val.y;
        privates.z = val.z;
        return this;
    };

    /**
     * Gets the values of this Vector3 as an object with x,y,z values.
     * @returns {{x: number, y: number, z: number}}
     */
    this.valueOf = () => {
        return {x: privates.x, y: privates.y, z: privates.z};
    };

    /**
     * Add noise to this vector
     * @param noise {Vector3} noise factor
     * @return {Vector3}
     */
    this.addNoise = (noise) => {
        const x = number.randomIn(-noise.x / 2, noise.x / 2);
        const y = number.randomIn(-noise.y / 2, noise.y / 2);
        const z = number.randomIn(-noise.z / 2, noise.z / 2);
        this.add(new Vector3(x, y, z));
        return this;
    };
}

Vector3.prototype = Object.create(THREE.Vector3.prototype);
Vector3.prototype.constructor = Vector3;