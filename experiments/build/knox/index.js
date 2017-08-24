'use strict';

System.register(['rodin/core', './FrontView.js'], function (_export, _context) {
    "use strict";

    var R, FrontView, bgSphere;
    return {
        setters: [function (_rodinCore) {
            R = _rodinCore;
        }, function (_FrontViewJs) {
            FrontView = _FrontViewJs;
        }],
        execute: function () {
            R.start();

            bgSphere = new R.Sphere(90, 720, 4, new THREE.MeshBasicMaterial({ map: R.Loader.loadTexture("./img/bg.jpg"), color: 0x999999 }));

            bgSphere.scale.set(-1, 1, 1);
            bgSphere.rotation.y = Math.PI;
            R.Scene.add(bgSphere);

            R.messenger.once(R.CONST.ALL_SCULPTS_READY, function () {
                FrontView.startLogoAnim();
            });
        }
    };
});