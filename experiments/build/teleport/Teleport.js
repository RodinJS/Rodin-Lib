'use strict';

System.register(['rodin/core'], function (_export, _context) {
    "use strict";

    var RODIN, _createClass, Teleport;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    return {
        setters: [function (_rodinCore) {
            RODIN = _rodinCore;
        }],
        execute: function () {
            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            _export('Teleport', Teleport = function () {
                function Teleport(sourceObject) {
                    var segmentsMaxNumber = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;

                    var _this = this;

                    var step = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;
                    var objects = arguments[3];

                    _classCallCheck(this, Teleport);

                    this.sourceObject = sourceObject;
                    this.segmentsMaxNumber = segmentsMaxNumber;
                    this.step = step;
                    this.objects = objects;

                    this.sourceObject.on(RODIN.CONST.READY, function () {
                        _this.createLine(_this.sourceObject._threeObject.getWorldDirection());
                    });

                    this.sourceObject.on(RODIN.CONST.UPDATE, function () {
                        _this.reDrawLine(_this.sourceObject._threeObject.getWorldDirection());
                    });
                }

                _createClass(Teleport, [{
                    key: 'createLine',
                    value: function createLine(rayDirection) {
                        rayDirection = rayDirection.normalize();
                        this.parabola = new RODIN.Parabola(rayDirection, -9.8, 0, 0);

                        var pointsSculpt = new RODIN.Sculpt();
                        for (var i = 0; i < this.segmentsMaxNumber; i++) {
                            var point = new RODIN.Sphere(0.02, new THREE.MeshBasicMaterial({ color: 0x00FF00 }));
                            point.position.copy(this.parabola.eval(this.step * i));
                            pointsSculpt.add(point);
                        }
                        RODIN.Scene.add(pointsSculpt);
                        this.pointsSculpt = pointsSculpt;
                        this.raycaster = new RODIN.Raycaster();
                        this.raycaster.distance = this.segmentsMaxNumber * this.step;
                    }
                }, {
                    key: 'reDrawLine',
                    value: function reDrawLine(rayDirection) {
                        rayDirection = rayDirection.normalize();

                        // calculate angle between ray vector and XZ plane, for projection it in 2D
                        var rayDirectionOnXZ = new RODIN.Vector3(rayDirection.x, 0, rayDirection.z);
                        var alpha = -rayDirectionOnXZ.angleTo(rayDirection) * Math.sign(rayDirection.y || 1);

                        // calculate coefficient for acceleration, which is equal [0, 1]
                        var lerpFactor = Math.pow(alpha / Math.PI + 1 / 2, 3);

                        this.parabola.direction = rayDirection;
                        this.parabola.a = -lerpFactor;
                        this.parabola.b = Math.tan(alpha);
                        this.parabola.c = 0;
                        this.parabola.shift = this.sourceObject.globalPosition;
                        var maxpos = null;
                        for (var i = 0; i < this.pointsSculpt.children.length; i++) {
                            if (this.step * i < this.raycaster.closest) {
                                maxpos = this.parabola.eval(this.step * i);
                            }
                            this.pointsSculpt.children[i].position.copy(maxpos);
                        }
                    }
                }, {
                    key: 'getIntersection',
                    value: function getIntersection() {
                        return this.raycaster.raycastCurve(this.parabola, this.objects);
                    }
                }]);

                return Teleport;
            }());

            _export('Teleport', Teleport);
        }
    };
});