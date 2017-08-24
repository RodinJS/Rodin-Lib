import * as R from 'rodin/core';
import * as FrontView from './FrontView.js';
R.start();

const bgSphere = new R.Sphere(90, 720, 4, new THREE.MeshBasicMaterial({map: R.Loader.loadTexture("./img/bg.jpg"), color:0x999999}));
bgSphere.scale.set(-1,1,1);
bgSphere.rotation.y = Math.PI;
R.Scene.add(bgSphere);


R.messenger.once(R.CONST.ALL_SCULPTS_READY, ()=>{
    FrontView.startLogoAnim();
})
