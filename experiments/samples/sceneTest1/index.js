import * as RODIN from 'rodin/core';

RODIN.start();

var loader = new THREE.DDSLoader();
var map1 = loader.load('./6k.dds');
map1.minFilter = map1.magFilter = THREE.LinearFilter;
map1.anisotropy = 4;



let sphere1 = new RODIN.Sphere(90, 720, 4, new THREE.MeshBasicMaterial({map: map1, side: THREE.DoubleSide}));
sphere1.parent = RODIN.Scene.active;

for(let i =0; i<1000; i++){
    const j = new RODIN.Sphere(0.1, new THREE.MeshBasicMaterial({map: map1, side: THREE.DoubleSide}));
    const x = (Math.random()-0.5)*50;
    const y = (Math.random()-0.5)*50;
    const z = (Math.random()-0.5)*50;

    j.parent = RODIN.Scene.active;
    j.position.set(x,y,z);
}