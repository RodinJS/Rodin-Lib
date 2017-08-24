'use strict';

System.register(['rodin/core'], function (_export, _context) {
    "use strict";

    var RODIN, loader, map1, sphere1, i, j, x, y, z;
    return {
        setters: [function (_rodinCore) {
            RODIN = _rodinCore;
        }],
        execute: function () {

            RODIN.start();

            loader = new THREE.DDSLoader();
            map1 = loader.load('./6k.dds');

            map1.minFilter = map1.magFilter = THREE.LinearFilter;
            map1.anisotropy = 4;

            sphere1 = new RODIN.Sphere(90, 720, 4, new THREE.MeshBasicMaterial({ map: map1, side: THREE.DoubleSide }));

            sphere1.parent = RODIN.Scene.active;

            for (i = 0; i < 1000; i++) {
                j = new RODIN.Sphere(0.1, new THREE.MeshBasicMaterial({ map: map1, side: THREE.DoubleSide }));
                x = (Math.random() - 0.5) * 50;
                y = (Math.random() - 0.5) * 50;
                z = (Math.random() - 0.5) * 50;


                j.parent = RODIN.Scene.active;
                j.position.set(x, y, z);
            }
        }
    };
});