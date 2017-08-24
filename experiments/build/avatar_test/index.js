'use strict';

System.register(['rodin/core', './Teleport.js'], function (_export, _context) {
    "use strict";

    var RODIN, Teleport, box, lights, targetObj, aaa, teleport;
    return {
        setters: [function (_rodinCore) {
            RODIN = _rodinCore;
        }, function (_TeleportJs) {
            Teleport = _TeleportJs.Teleport;
        }],
        execute: function () {
            RODIN.start();

            box = new RODIN.Box(0.1, new THREE.MeshNormalMaterial({ wireframe: false }));

            box.parent = RODIN.Scene.active;
            box.position.set(-0.5, 1.3, -1);
            box.rotation.set(0.6, -0.2, 0);

            lights = [];

            lights[0] = new THREE.PointLight(0xffffff, 0.5, 0);
            lights[1] = new THREE.PointLight(0xffffff, 0.7, 0);
            lights[2] = new THREE.PointLight(0xffffff, 0.7, 0);

            lights[0].position.set(0, 20, 0);
            lights[1].position.set(10, 20, 10);
            lights[2].position.set(-10, -20, -10);

            RODIN.Scene.add(new RODIN.Sculpt(lights[0]));
            RODIN.Scene.add(new RODIN.Sculpt(lights[1]));
            RODIN.Scene.add(new RODIN.Sculpt(lights[2]));

            targetObj = new RODIN.Sculpt(new THREE.Mesh(
            //new THREE.IcosahedronGeometry(2, 4),
            //new THREE.BoxGeometry(2, 2, 2),
            new THREE.PlaneGeometry(4, 4, 0, 0), new THREE.MeshPhongMaterial({
                color: 0x156289,
                side: THREE.DoubleSide,
                wireframe: false,
                emissive: 0x072534,
                shading: THREE.FlatShading,
                vertexColors: THREE.FaceColors
            })));

            targetObj.parent = RODIN.Scene.active;
            targetObj.rotation.set(0, 0, Math.PI / 2);
            targetObj.position.set(0.41, 0, -7);
            //targetObj.position.set(0.41, 1.5, -7);
            //targetObj.rotation.set(-0.2, -0.2, 0);
            aaa = Date.now();

            window.addEventListener("mousedown", function (e) {
                aaa = Date.now();
            });

            targetObj.on(RODIN.CONST.GAMEPAD_BUTTON_DOWN, function (e) {
                //console.log(Date.now() - aaa);
                var bbb = Date.now();
                targetObj._threeObject.updateMatrixWorld();
                var ch = teleport.pointsSculpt.children;
                var p1 = ch[1].globalPosition;
                var p2 = ch[2].globalPosition;
                var p3 = ch[3].globalPosition;
                var plane1 = teleport.getPlaneEquation(p1, p2, p3);

                var faces = e.target._threeObject.geometry.faces;
                var vertices = e.target._threeObject.geometry.vertices;

                var len = faces.length;
                var i = 0;
                //console.log(len)
                while (i < len) {
                    var face = faces[i];
                    //let face = e.face;
                    //console.log(i)
                    var vertex1 = new THREE.Vector3(vertices[face.a].x, vertices[face.a].y, vertices[face.a].z);
                    var vertex1_ = targetObj._threeObject.localToWorld(vertex1.clone());

                    var vertex2 = new THREE.Vector3(vertices[face.b].x, vertices[face.b].y, vertices[face.b].z);
                    var vertex2_ = targetObj._threeObject.localToWorld(vertex2.clone());

                    var vertex3 = new THREE.Vector3(vertices[face.c].x, vertices[face.c].y, vertices[face.c].z);
                    var vertex3_ = targetObj._threeObject.localToWorld(vertex3.clone());

                    var plane2 = teleport.raycaster.getPlaneEquation(vertex1_, vertex2_, vertex3_);

                    var intersectionLine = teleport.getIntersectionLine(plane1, plane2);
                    //console.log(intersectionLine);


                    var point1 = intersectionLine.p;
                    var point2 = new THREE.Vector3(point1.x + intersectionLine.n.x, point1.y + intersectionLine.n.y, point1.z + intersectionLine.n.z);

                    var intersectionPoint = teleport.getIntersectionPoint(plane1.normal, {
                        a: teleport.parabolaArgs.a,
                        b: teleport.parabolaArgs.b,
                        c: teleport.parabolaArgs.c
                    }, point1, point2);

                    var raycasted = teleport.checkPoint(intersectionPoint.clone(), targetObj, vertex1, vertex2, vertex3);
                    if (raycasted) {
                        var pointOBJ = new RODIN.Box(0.1, new THREE.MeshNormalMaterial({ wireframe: false }));
                        RODIN.Scene.add(pointOBJ);
                        pointOBJ.position.set(intersectionPoint.x, intersectionPoint.y, intersectionPoint.z);
                        console.log(pointOBJ.position);
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
            });

            teleport = new Teleport(box);
        }
    };
});