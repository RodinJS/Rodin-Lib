'use strict';

System.register(['rodin/core'], function (_export, _context) {
    "use strict";

    var RODIN, _createClass, Parabola;

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

            _export('Parabola', Parabola = function () {
                function Parabola(direction, a, b, c) {
                    _classCallCheck(this, Parabola);

                    this._direction = direction;
                    this._a = a || -9.8;
                    this._b = b || 0;
                    this._c = c || 0;
                }

                _createClass(Parabola, [{
                    key: 'eval',
                    value: function _eval(t) {
                        var x = t * -this._direction.x;
                        var y = this._a * t * t + this._b * t + this._c;
                        var z = t * -this._direction.z;

                        return new RODIN.Vector3(x, y, z);
                    }
                }, {
                    key: 'direction',
                    set: function set(direction) {
                        return this._direction = direction;
                    }
                }, {
                    key: 'a',
                    set: function set(a) {
                        return this._a = a;
                    },
                    get: function get() {
                        return this._a;
                    }
                }, {
                    key: 'b',
                    set: function set(b) {
                        return this._b = b;
                    },
                    get: function get() {
                        return this._b;
                    }
                }, {
                    key: 'c',
                    set: function set(c) {
                        return this._c = c;
                    },
                    get: function get() {
                        return this._c;
                    }
                }]);

                return Parabola;
            }());

            _export('Parabola', Parabola);
        }
    };
});