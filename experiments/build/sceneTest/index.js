"use strict";

System.register(["rodin/core"], function (_export, _context) {
    "use strict";

    var RODIN, qaq, m, sphere1, i, j, x, y, z;
    return {
        setters: [function (_rodinCore) {
            RODIN = _rodinCore;
        }],
        execute: function () {

            RODIN.start();
            qaq = RODIN.Loader.loadTexture("./For_Spere_6k.jpg");
            m = new THREE.MeshBasicMaterial({ map: qaq, side: THREE.DoubleSide });
            sphere1 = new RODIN.Sphere(90, 720, 4, m);

            sphere1.parent = RODIN.Scene.active;

            for (i = 0; i < 10000; i++) {
                j = new RODIN.Sphere(0.1, m);
                x = (Math.random() - 0.5) * 50;
                y = (Math.random() - 0.5) * 50;
                z = (Math.random() - 0.5) * 50;


                j.parent = RODIN.Scene.active;
                j.position.set(x, y, z);
            }
        }
    };
});