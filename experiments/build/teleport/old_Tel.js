'use strict';

System.register(['../../_build/js/vendor/three/THREE.GLOBAL.js', '../../_build/js/rodinjs/RODIN.js', '../../_build/js/rodinjs/scene/SceneManager.js', '../../_build/js/rodinjs/raycaster/Raycaster.js', '../../_build/js/rodinjs/sculpt/ModelLoader.js', '../../_build/js/rodinjs/controllers/MouseController.js', './DnDVive_c.js'], function (_export, _context) {
    "use strict";

    var THREE, RODIN, SceneManager, Raycaster, ModelLoader, MouseController, controllerL, controllerR, scene, camera, controls, mouseController, light1, light2, character, floor, a, texture, materialGradient, textureVertical, materialGradientVertical, textureRadial, materialGradientRadial, raycaster, cylinderHeight, raycastPoint, n, g, l;

    function addPoint(direction) {
        var points = [];
        direction = direction.normalize();
        direction.multiplyScalar(6);

        var i = 0;
        for (var time = 0; time < n; time += l) {
            var x = time * -direction.x;
            var y = time * -direction.y + g * time * time / 2;
            var z = time * -direction.z;

            var pointPosition = new THREE.Vector3(x, y, z);
            points.push(pointPosition);
            if (i > 0) {
                raycaster.ray.origin.copy(controllerL.getWorldPosition().add(points[i - 1])); //////////
                var curVertex = points[i - 1].clone();
                var nextVertex = points[i].clone();
                raycaster.ray.direction = nextVertex.sub(curVertex);
                //nextVertex is now the difference
                //vector of two points in our line
                raycaster.far = nextVertex.length();
                var objs = raycaster.raycast();
                controllerL.raycastObject = objs;
                if (objs.length && raycastPoint.object3D) {
                    createLine(points);
                    if (!raycastPoint.object3D.visible) {
                        raycastPoint.object3D.visible = true;
                    }
                    raycastPoint.object3D.position.copy(objs[0].point);
                    raycastPoint.object3D.position.y += cylinderHeight / 2;
                    break;
                }
                if (time == n - l && raycastPoint.object3D) {
                    createLine(points);
                    raycastPoint.object3D.visible = false;
                }
            }
            ++i;
        }
    }

    function createLine(points) {
        scene.scene.children.map(function (child) {
            if (child.name == 'line') {
                scene.scene.remove(child);
            }
        });
        var splineShape = new THREE.CatmullRomCurve3(points);
        var tube = new THREE.TubeBufferGeometry(splineShape, 25, 0.01, 4);
        var line = THREE.SceneUtils.createMultiMaterialObject(tube, [materialGradient]);
        line.name = 'line';
        line.position.copy(controllerL.getWorldPosition());
        scene.add(line);
    }

    function controllerKeyDown(keyCode) {
        if (controllerL.raycastObject) {
            var cameraPos = new THREE.Vector3(camera.position.x, 0, camera.position.z);
            character.object3D.Sculpt.setGlobalPosition(raycastPoint.object3D.getWorldPosition().sub(cameraPos));
        }
    }

    return {
        setters: [function (_buildJsVendorThreeTHREEGLOBALJs) {
            THREE = _buildJsVendorThreeTHREEGLOBALJs.THREE;
        }, function (_buildJsRodinjsRODINJs) {
            RODIN = _buildJsRodinjsRODINJs;
        }, function (_buildJsRodinjsSceneSceneManagerJs) {
            SceneManager = _buildJsRodinjsSceneSceneManagerJs.SceneManager;
        }, function (_buildJsRodinjsRaycasterRaycasterJs) {
            Raycaster = _buildJsRodinjsRaycasterRaycasterJs.Raycaster;
        }, function (_buildJsRodinjsSculptModelLoaderJs) {
            ModelLoader = _buildJsRodinjsSculptModelLoaderJs.ModelLoader;
        }, function (_buildJsRodinjsControllersMouseControllerJs) {
            MouseController = _buildJsRodinjsControllersMouseControllerJs.MouseController;
        }, function (_DnDVive_cJs) {
            controllerL = _DnDVive_cJs.controllerL;
            controllerR = _DnDVive_cJs.controllerR;
        }],
        execute: function () {
            scene = SceneManager.get();

            scene.scene.background = new THREE.Color(0xb5b5b5);
            camera = scene.camera;
            controls = scene.controls;
            mouseController = new MouseController();

            SceneManager.addController(mouseController);

            /// Add light
            light1 = new THREE.DirectionalLight(0xcccccc);

            light1.position.set(2, 3, 2);
            scene.add(light1);

            scene.add(new THREE.AmbientLight(0xaaaaaa));

            light2 = new THREE.DirectionalLight(0xb5b5b5);

            light2.position.set(-3, -3, -3);
            scene.add(light2);

            character = new RODIN.THREEObject(new THREE.Object3D());

            character.on('ready', function (e) {
                var matrix = new THREE.Matrix4();
                character.object3D.Sculpt.setGlobalMatrix(matrix);
                character.object3D.add(camera);
                character.object3D.add(controllerL);
                character.object3D.add(controllerR);
                scene.add(character.object3D);
            });

            floor = new RODIN.THREEObject(new THREE.Mesh(new THREE.PlaneGeometry(25, 25, 50, 50), new THREE.MeshLambertMaterial({
                color: 0x676d6f,
                wireframe: true
            })));

            floor.on('ready', function (e) {
                scene.add(floor.object3D);
                floor.object3D.rotation.x = -Math.PI / 2;
                floor.raycastable = true;
                floor.object3D.name = 'floor';
            });

            a = new RODIN.THREEObject(new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 0.5), new THREE.MeshLambertMaterial({ color: 0xf15245 })));

            a.on('ready', function (e) {
                scene.add(a.object3D);
                a.object3D.position.set(2, 0.5, 0);
                a.raycastable = true;
            });

            texture = new THREE.TextureLoader().load('texture/gradient.png');
            materialGradient = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });
            textureVertical = new THREE.TextureLoader().load('texture/gradient_vertical.png');
            materialGradientVertical = new THREE.MeshBasicMaterial({
                map: textureVertical,
                transparent: true,
                side: THREE.DoubleSide
            });
            textureRadial = new THREE.TextureLoader().load('texture/gradientRadial.png');
            materialGradientRadial = new THREE.MeshBasicMaterial({
                map: textureRadial,
                transparent: true,
                side: THREE.DoubleSide
            });
            raycaster = new Raycaster();

            raycaster.setScene(scene.scene);
            cylinderHeight = 0.25;
            raycastPoint = ModelLoader.load('./model/raycastPoint.obj');

            raycastPoint.on('ready', function () {
                console.log(raycastPoint.object3D);
                raycastPoint.object3D.position.y = controls.userHeight;
                raycastPoint.object3D.position.z = -0.5;
                scene.add(raycastPoint.object3D);
                raycastPoint.object3D.children[0].material = materialGradientVertical;
                raycastPoint.object3D.children[1].material = materialGradientRadial;
            });
            n = 2;
            g = -9.8;
            l = 0.01;
            controllerL.onKeyDown = controllerKeyDown;scene.preRender(function () {
                if (controllerL) {
                    addPoint(controllerL.getWorldDirection());
                }
            });
        }
    };
});