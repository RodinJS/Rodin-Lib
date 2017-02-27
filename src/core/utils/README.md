
##Scheme.js usage example

```js
const meshScheme = new Scheme({
	class: THREE.Mesh,
	defaultType: new THREE.Mesh(new THREE.TorusKnotGeometry(10, 3, 100, 16)),
	coords: {
		r: 12
	}
});

const geometryScheme = new Scheme({
	class: THREE.TorusKnotGeometry,
	defaultType: new THREE.TorusKnotGeometry(10, 3, 100, 16),
	coords: {
		x: 1,
		y: 2,
		z: 3,
		a: 34,
		b: 12
	}
});

let a = meshScheme.prepare(3, 5, 3);
let b = geometryScheme.prepare(3, 5, 3);

let c = meshScheme.prepare(3);
let d = geometryScheme.prepare(3);

let e = meshScheme.prepare(3, 76, 4, 12, new THREE.Mesh(new THREE.TorusKnotGeometry( 10, 3, 100, 16 )));
let g = geometryScheme.prepare(3, 76, 4, 12);

let i = meshScheme.prepare(5, 112);
let j = geometryScheme.prepare(5, 112);
```