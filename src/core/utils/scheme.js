export class Scheme {
	constructor(obj) {
		this.coords = obj.coords;
		this.class = obj.class;
		this.defaultType = obj.defaultType;

		this.ALLOWED_CLASSES = [THREE.Material, THREE.Object3D, THREE.Geometry];
	}

	formatCoords(coordsArray) {
		let keys = Object.keys(this.coords);
		let result = {};

		keys.forEach((coordName, key) => {
			let value = this.coords[coordName];

			if (coordsArray.length === 1) {
				value = coordsArray[0];
			} else if (coordsArray.length > key) {
				value = coordsArray[key];
			}

			result[coordName] = value;
		});

		return result;
	}

	isAllowedClass(instance) {
		for (let className of this.ALLOWED_CLASSES) {
			if (instance instanceof className) return true;
		}
		return false;
	}

	isSameClass(instance) {
		return instance instanceof this.class;
	}

	prepare(...args) {
		if (!args.length) throw new Error('You need to pass at least one argument.');

		let type, coordsArray = [], restOfParams = [];

		args.forEach((value, key) => {
			if (Number.isFinite(value)) {
				coordsArray.push(value);
			} else if (!type && this.isAllowedClass(value)) {
				type = value;
			} else {
				restOfParams.push(value);
			}
		});

		if (restOfParams.length > 1) throw new Error('Too many params passed.');

		if (!type) type = this.defaultType;
		if (!this.isSameClass(type)) throw Error('Passed type does not match the scheme.');

		let coords = this.formatCoords(coordsArray);

		return {
			coords,
			type
		};
	}

}