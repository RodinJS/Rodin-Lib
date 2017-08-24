import * as RODIN from 'rodin/core';

RODIN.start();
let qaq = RODIN.Loader.loadTexture("./For_Spere_6k.jpg");


var m = new THREE.MeshBasicMaterial({map: qaq, side: THREE.DoubleSide})
let sphere1 = new RODIN.Sphere(90, 720, 4, m);
sphere1.parent = RODIN.Scene.active;


for(let i =0; i<10000; i++){
    const j = new RODIN.Sphere(0.1, m);
    const x = (Math.random()-0.5)*50;
    const y = (Math.random()-0.5)*50;
    const z = (Math.random()-0.5)*50;

    j.parent = RODIN.Scene.active;
    j.position.set(x,y,z);
}