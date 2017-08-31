import * as RODIN from 'rodin/core';

import {Teleport} from './Teleport.js';
RODIN.start();
let box = new RODIN.Box(0.1, new THREE.MeshNormalMaterial({wireframe: false}));
box.parent = RODIN.Scene.active;
box.position.set(-0.5, 1.5, -1);
box.rotation.set(0.5, -0.3, 0);

let lights = [];
lights[0] = new THREE.PointLight(0xffffff, 0.5, 0);
lights[1] = new THREE.PointLight(0xffffff, 0.7, 0);
lights[2] = new THREE.PointLight(0xffffff, 0.7, 0);

lights[0].position.set(0, 20, 0);
lights[1].position.set(10, 20, 10);
lights[2].position.set(-10, -20, -10);

RODIN.Scene.add(new RODIN.Sculpt(lights[0]));
RODIN.Scene.add(new RODIN.Sculpt(lights[1]));
RODIN.Scene.add(new RODIN.Sculpt(lights[2]));

let targetObj = new RODIN.Sculpt(
    new THREE.Mesh(
        new THREE.IcosahedronGeometry(1, 4),
        new THREE.MeshPhongMaterial({
            color: 0x156289,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
            emissive: 0x072534,
            shading: THREE.FlatShading,
            vertexColors: THREE.FaceColors
        })
    )
);
RODIN.Scene.add(targetObj);
targetObj.rotation.set(0.6, 0.7, Math.PI / 2);
targetObj.position.set(0.41, 1, -3);
targetObj.scale.set(0.9, 0.7, 0.1);
console.log(targetObj._threeObject.geometry.faces.length)
const pointOBJ = new RODIN.Box(0.1, new THREE.MeshNormalMaterial({wireframe: false}));


//const teleport = new Teleport(RODIN.GamePad.viveLeft.sculpt);
const teleport = new Teleport(box, undefined, undefined, [targetObj]);
targetObj.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, (e)=> {
    console.log("down")
    e.stopPropagation();
});
targetObj.on(RODIN.CONST.GAMEPAD_BUTTON_UP, (e)=> {
    console.log("up", e);
});

targetObj.on(RODIN.CONST.UPDATE, (e)=> {
    targetObj.rotation.y += 0.005;
    targetObj.rotation.x += 0.001;
    targetObj.rotation.z += 0.007;
    targetObj._threeObject.updateMatrixWorld();
    let inter = teleport.getIntersection();
    if (inter.length > 1) {
        //console.log(inter[0])
        targetObj.add(pointOBJ);
        pointOBJ.position.copy(inter[0].point);
    }
});
window.R = RODIN;

targetObj.on(RODIN.CONST.GAMEPAD_HOVER, (e)=> {
    console.log("hover");
});
targetObj.on(RODIN.CONST.GAMEPAD_HOVER_OUT, (e)=> {
    console.log("shoqer");
});
RODIN.GamePad.mouse.on(RODIN.CONST.GAMEPAD_HOVER, (e)=> {
    //console.log(e.target.intersected[0]);
    //if (e.target.intersected[0])console.log(e.target.intersected[0].distance);
});
RODIN.GamePad.mouse.on(RODIN.CONST.UPDATE, (e)=> {
    //if(e.target.intersected.length>1){
    //    console.log(e.target.intersected[0].distance);
    //}
    //if (e.target.intersected[0])console.log(e.target.intersected[0].distance);
});

RODIN.GamePad.mouse.on(RODIN.CONST.GAMEPAD_HOVER_OUT, (e)=> {
});
RODIN.GamePad.mouse.on(RODIN.CONST.GAMEPAD_BUTTON_UP, (e)=> {
});
let qaq = 0;

box.on(RODIN.CONST.UPDATE, (e)=> {
    box.rotation.y = Math.sin(qaq) / 5 - 0.2;
    box.position.x = Math.sin(qaq) / 5 - 0.5;
    qaq += 0.1

});


RODIN.GamePad.viveRight.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, (e)=> {
    if(e.gamepad instanceof RODIN.MouseGamePad){
        if(e.keyCode != 2) return;
    }
    console.log("down",e.keyCode);
});

RODIN.GamePad.mouse.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, (e)=> {
    console.log("down", e.button[0].keyCode);
});
RODIN.GamePad.viveRight.on(RODIN.CONST.GAMEPAD_BUTTON_UP, (e)=> {
    console.log("up",e);
});

/*targetObj.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, (e)=> {
 //console.log(Date.now() - aaa);
 let bbb = Date.now();
 targetObj._threeObject.updateMatrixWorld();
 const ch = teleport.pointsSculpt.children;
 const p1 = ch[1].globalPosition;
 const p2 = ch[2].globalPosition;
 const p3 = ch[3].globalPosition;
 const plane1 = teleport.getPlaneEquation(p1, p2, p3);


 const faces = e.target._threeObject.geometry.faces;
 const vertices = e.target._threeObject.geometry.vertices;

 const len = faces.length;
 let i = 0;
 //console.log(len)
 while (i < len) {
 const face = faces[i];
 //let face = e.face;
 //console.log(i)
 const vertex1 = new THREE.Vector3(vertices[face.a].x, vertices[face.a].y, vertices[face.a].z);
 const vertex1_ = targetObj._threeObject.localToWorld(vertex1.clone());

 const vertex2 = new THREE.Vector3(vertices[face.b].x, vertices[face.b].y, vertices[face.b].z);
 const vertex2_ = targetObj._threeObject.localToWorld(vertex2.clone());

 const vertex3 = new THREE.Vector3(vertices[face.c].x, vertices[face.c].y, vertices[face.c].z);
 const vertex3_ = targetObj._threeObject.localToWorld(vertex3.clone());



 const plane2 = teleport.raycaster.getPlaneEquation(vertex1_, vertex2_, vertex3_);

 const intersectionLine = teleport.getIntersectionLine(plane1, plane2);
 //console.log(intersectionLine);


 const point1 = intersectionLine.p;
 const point2 = new THREE.Vector3(point1.x + intersectionLine.n.x, point1.y + intersectionLine.n.y, point1.z + intersectionLine.n.z);

 const intersectionPoint = teleport.getIntersectionPoint(
 plane1.normal,
 {
 a: teleport.parabolaArgs.a,
 b: teleport.parabolaArgs.b,
 c: teleport.parabolaArgs.c
 },
 point1,
 point2
 );



 const raycasted = teleport.checkPoint(intersectionPoint.clone(), targetObj, vertex1, vertex2, vertex3);
 if (raycasted) {
 const pointOBJ = new RODIN.Box(0.1, new THREE.MeshNormalMaterial({wireframe: false}));
 RODIN.Scene.add(pointOBJ);
 pointOBJ.position.set(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);
 console.log(pointOBJ.position)
 }
 //
 //
 //const pointOBJ = new RODIN.Sphere(.02, new THREE.MeshNormalMaterial());
 //RODIN.Scene.add(pointOBJ);
 //pointOBJ.position.copy(intersectionLine.p);

 //console.log( pointOBJ.position);
 i++;
 }

 //console.log(Date.now() - bbb);
 });*/



