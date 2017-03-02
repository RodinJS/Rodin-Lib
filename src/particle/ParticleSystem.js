'use strict';
import * as RODIN from 'rodin/core';
import {Particle} from './Particle';

/**
 * set general parameters for Particle System
 * @constructor
 *
 * @version 0.0.1
 *
 * @param {Object} [ params ] - General parameters of particle system
 *
 * @param {Object} [ params.numberPerSecond ] - How many particles creating per second
 * @param {Number} [ params.numberPerSecond.value = 10 ]
 * @param {Number} [ params.numberPerSecond.randomness = 0 ]
 *
 * @param {Object} [ params.maxParticles ] - Maximum number of particles in scene
 * @param {Number} [ params.maxParticles.value = 1000 ]
 * @param {Number} [ params.maxParticles.randomness = 0 ]
 *
 * @param {Object} [ params.particleSize ] - Each particle size,
 *      if value or randomness is a number, it is automatically convert to a vector
 * @param {THREE.Vector3 | number} [ params.particleSize.value = new THREE.Vector3( 0.1, 0.1, 0.1 ) ]
 * @param {THREE.Vector3 | number} [ params.particleSize.randomness = new THREE.Vector3( 0, 0, 0 ) ]
 *
 * @param {Object} [ params.startPositionRandomness ] - Set random position of each particle
 * @param {Number} [ params.startPositionRandomness.randomness = 0 ]
 *
 * @param {Object} [ params.velocity ]Set particles moving trajectory by the path,
 * @param {String} [ params.velocity.type = 'set' | 'add' ] - If type is a 'set' next position vector is setting to
 *                                                           particle current position, if type is a 'add'
 *                                                           next position vector is adding to particle current position
 * @param {THREE.Vector3 | function} [ params.velocity.velocityPath = new THREE.Vector3( 0, 5, 0 ) ]
 *
 *
 * @param {Object} [ params.lifetime ] - A particle life time, it is starting when particle was born and finishing when was died
 * @param {Number} [ params.lifetime.value = 5000 ]
 * @param {Number} [ params.lifetime.randomness = 100 ]
 *
 * @param {THREE.SpriteMaterial} [ params.particlesMaterial = new THREE.SpriteMaterial( { color: 0x00c0ff } )] - Material for each particle
 */

export class ParticleSystem {
    constructor(params) {
        params = Object.deepAssign({
            numberPerSecond: {value: 10,randomness: 0},
            maxParticles: {value: 1000, randomness: 0},
            particleSize: {value: new THREE.Vector3(0.05, 0.05, 0.05), randomness: new THREE.Vector3(0.01, 0.01, 0.01)},
            startPositionRandomness: {randomness: 1},
            velocity: {type: 'set', velocityPath: new THREE.Vector3(0, 3, 0)},
            lifetime: {value: 1000, randomness: 100},
            particlesMaterial: new THREE.SpriteMaterial({
                // color: 0x00c0ff,
                // TODO: inch kareliya anel erb map-e null-a?
                map: new THREE.TextureLoader().load('../src/particle/textures/particle_default_map.png'),
            })
        }, params);

        this.threeObject = new THREE.Group();
        this.particles = [];
        this.params = params;

        const convertToVector = (r = null) => {
            if (r == null) return new THREE.Vector3(0, 0, 0);
            return r.isVector3 ? r : new THREE.Vector3(r, r, r);
        };

        for (let i in this.params) {
            if (!this.params.hasOwnProperty(i)) continue;

            if (['numberPerSecond', 'maxParticles', 'lifetime'].indexOf(i) === -1) {
                this.params[i].randomness = convertToVector(this.params[i].randomness);
                this.params[i].value = convertToVector(this.params[i].value);
            }
        }
    }

    update() {
        // TODO: toshni hashvel qanak@ 0.3, 0.4, 0.5 (mnacorde eli)
        let additionalValue = calcRandom(this.params.numberPerSecond.value, this.params.numberPerSecond.randomness) /
            1000 * RODIN.Time.delta;
        //let b = Math.floor(additionalValue);
        //let a = additionalValue - b;
        //console.log(a);

        let addNewCount = Math.min(
            additionalValue,
            calcRandom(this.params.maxParticles.value, this.params.maxParticles.randomness) - this.particles.length
        );

        for (let i = 0; i < addNewCount; i++) {
            this.createParticle();
        }

        this.particles.map(p => p.update());
        this.particles.map(particle => {
            if (particle.isDead()) {
                return this.destroyParticle(particle);
            }

            if (this.params.velocity.velocityPath instanceof THREE.Vector3) {
                let vec = new THREE.Vector3().copy(this.params.velocity.velocityPath).multiplyScalar(RODIN.Time.delta * .001);
                particle.threeObject.position.add(vec);
            } else {
                let coef = (RODIN.Time.now - particle.bornTime) / 1000;
                let vec = this.params.velocity.velocityPath(coef);
                if (this.params.velocity.type == 'add') {
                    particle.threeObject.position.add(vec);
                } else {
                    particle.threeObject.position.set(vec.x, vec.y, vec.z).add(particle.threeObject.initialPosition);
                }
            }
        });
    }

    destroyParticle(p) {
        this.threeObject.remove(p.threeObject);
        this.particles.splice(this.particles.indexOf(p), 1);
        p.threeObject.material.dispose();
    }

    createParticle() {
        let particle = new Particle(
            this.params.particlesMaterial,
            this.params.lifetime.value,
            this.params.particleSize,
            this.params.startPositionRandomness
        );
        this.particles.push(particle);
        this.threeObject.add(particle.threeObject);
    }
}

// TODO: move it
// TODO: create own deepAssign
/*
 this is a library from https://github.com/sindresorhus/deep-assign/blob/master/index.js
 */

const isObj = function (x) {
    const type = typeof x;
    return x !== null && (type === 'object' /*|| type === 'function'*/);
};
//let isObj = require('is-obj');

const hasOwnProperty = Object.prototype.hasOwnProperty;
const propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
    if (val === null || val === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    return Object(val);
}

function assignKey(to, from, key) {
    let val = from[key];

    if (val === undefined || val === null) {
        return;
    }

    if (hasOwnProperty.call(to, key)) {
        if (to[key] === undefined /*|| to[key] === null*/) {
            throw new TypeError('Cannot convert undefined or null to object (' + key + ')');
        }
    }

    if (!hasOwnProperty.call(to, key) || !isObj(val)) {
        to[key] = val;
    } else {
        to[key] = assign(Object(to[key]), from[key]);
    }
}

function assign(to, from) {
    if (to === from) {
        return to;
    }

    from = Object(from);

    for (let key in from) {
        if (hasOwnProperty.call(from, key)) {
            assignKey(to, from, key);
        }
    }

    if (Object.getOwnPropertySymbols) {
        let symbols = Object.getOwnPropertySymbols(from);

        for (let i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
                assignKey(to, from, symbols[i]);
            }
        }
    }

    return to;
}

Object.deepAssign = function (target) {
    target = toObject(target);

    for (let s = 1; s < arguments.length; s++) {
        assign(target, arguments[s]);
    }

    return target;
};
/*
 end
 */

const calcRandom = (initialParam, randomness) => {
    if (!isNaN(initialParam) && typeof initialParam === 'number') {
        return Math.random() * 2 * randomness - randomness + initialParam;
    } else if (initialParam.isVector3) {
        if (randomness.x === randomness.y ){

        }
        // TODO: check if (randomness.x === randomness.y === randomness.z) set the same random value
        let x = Math.random() * 2 * randomness.x - randomness.x + initialParam.x;
        let y = Math.random() * 2 * randomness.y - randomness.y + initialParam.y;
        let z = Math.random() * 2 * randomness.z - randomness.z + initialParam.z;
        return new THREE.Vector3(x, y, z);
    }
};