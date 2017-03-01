export function WrappedVector3(...args) {
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
	this.onChange = (callback) => {
		callbacks.push(callback);
	};

	this.silentCopy = (val) => {
		privates.x = val.x;
		privates.y = val.y;
		privates.z = val.z;
		return this;
	};

	this.valueOf = () => {
		return {x: privates.x, y: privates.y, z: privates.y};
	}
}

WrappedVector3.prototype = Object.create(THREE.Vector3.prototype);
WrappedVector3.prototype.constructor = WrappedVector3;