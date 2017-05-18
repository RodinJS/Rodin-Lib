import {Particle} from './Particle';
import {Sculpt} from '../sculpt';
import {Time} from '../time';
import {number, vector3, object} from '../utils';
import {ErrorProtectedMethodCall} from '../error';
import * as CONST from '../constants';
import {Loader} from '../loader';
import {Vector3} from '../math';

const enforce = function () {
};

/**
 * set general parameters for Particle System
 * @constructor
 *
 * @version 0.0.1
 *
 * @param {Object} [ params ] - General parameters of particle system
 *
 * @param {Object} [ params.numberPerSecond ] - Set random number of particles, which creating per second.
 * @param {Number} [ params.numberPerSecond.value = 10 ]
 * @param {Number} [ params.numberPerSecond.randomness = 0 ]
 *
 * @param {Object} [ params.maxParticles ] - Set maximum random number of particles in scene.
 * @param {Number} [ params.maxParticles.value = 1000 ]
 * @param {Number} [ params.maxParticles.randomness = 0 ]
 *
 * @param {Object} [ params.particleSize ] - Each particle size,
 *                                           if value or randomness is a number, it is scale symmetric
 * @param {THREE.Vector3 | Number} [ params.particleSize.value = new THREE.Vector3(0.05, 0.05, 0.05) ]
 * @param {THREE.Vector3 | Number} [ params.particleSize.randomness = new THREE.Vector3(0.01, 0.01, 0.01) ]
 *
 * @param {Object} [ params.startPositionRandomness ] - Set random start position of each particle
 * @param {THREE.Vector3 | Number} [ params.startPositionRandomness.randomness = new THREE.Vector3(1, 1, 1) ]
 *
 * @param {Object} [ params.velocity ] Set particles moving trajectory by the path,
 * @param {String} [ params.velocity.type = 'set' | 'add' ] - If type is a 'set' next position vector is setting to
 *                                                            particle current position, if type is a 'add'
 *                                                            next position vector is adding to particle current position
 * @param {THREE.Vector3 | function} [ params.velocity.path = new THREE.Vector3( 0, 3, 0 ) ]
 *
 *
 * @param {Object} [ params.lifetime ] - A particle life time, it is starting when particle was born and finishing when was died
 * @param {Number} [ params.lifetime.value = 1000 ]
 * @param {Number} [ params.lifetime.randomness = 100 ]
 *
 * @param {THREE.SpriteMaterial} [ params.particlesMaterial = new THREE.SpriteMaterial()] - Material for each particle
 */

// TODO: make particle systems more flexible (let change path when you want)

export class ParticleSystem extends Sculpt {
    constructor(params) {
        // params = object.deepAssign({
        //     startCount: {value: 0, randomness: 0},
        //     numberPerSecond: {value: 10, randomness: 0},
        //     maxParticles: {value: 100, randomness: 0},
        //     particleSize: {value: new THREE.Vector3(0.05, 0.05, 0.05), randomness: new THREE.Vector3(0.01, 0.01, 0.01)},
        //     startPosition: {randomness: new THREE.Vector3()},
        //     velocity: {
        //         type: 'add',
        //         path: (c, p) => {
        //             if(!p.direction) {
        //                 p.direction = vector3.addNoise(new THREE.Vector3(0, .5, 0), params.velocity.randomness);
        //             }
        //
        //             return new THREE.Vector3().copy(p.direction).multiplyScalar(Time.delta * .001);
        //         },
        //         randomness: new THREE.Vector3(.2, 0, .2)
        //     },
        //     lifetime: {value: 3000, randomness: 100}
        // }, params);

        if (params && !params.particlesMaterial) {
            params.particlesMaterial = new THREE.SpriteMaterial({
                map: Loader.loadTexture('https://cdn.rodin.io/resources/img/particleSystem/particle_default_map.png'),
            });
        }

        super();
        this.particles = [];
        this.params = params;

        this._halfParticles = 0;

        for (let i = 1; i < Math.min(params.startCount.value, params.maxParticles.value); i++) {
            this.createParticle();
        }

        this.on(CONST.UPDATE, () => {
            this.update(enforce);
        });
    }

    update(e) {
        if(e !== enforce) {
            throw new ErrorProtectedMethodCall('update');
        }

        let addNewCount = Math.min(
            number.addNoise(this.params.numberPerSecond.value, this.params.numberPerSecond.randomness) / 1000 * Time.delta,
            number.addNoise(this.params.maxParticles.value, this.params.maxParticles.randomness) - this.particles.length
        ) + this._halfParticles;

        this._halfParticles = addNewCount - Math.floor(addNewCount);

        for (let i = 1; i < addNewCount; i++) {
            this.createParticle();
        }

        this.particles.map(particle => {
            if (particle.isDead()) {
                return this.destroyParticle(particle);
            }

            if (this.params.velocity.path instanceof Vector3) {
                const noise = new Vector3().copy(this.params.velocity.randomness).multiplyScalar(Time.delta * .001);
                let vec = vector3.addNoise(new Vector3().copy(this.params.velocity.path).multiplyScalar(Time.delta * .001), noise);
                particle.position.add(vec);
            } else {
                let coef = Time.now - particle.bornTime;
                let vec = this.params.velocity.path(coef, particle);
                if (this.params.velocity.type == 'add') {
                    particle.position.add(vec);
                } else {
                    particle.position.set(vec.x, vec.y, vec.z).add(particle.initialPosition);
                }
            }
        });
    }
    // TODO: make particles destroy easier
    destroyParticle(p) {
        p.parent = null;
        this.particles.splice(this.particles.indexOf(p), 1);
        p._threeObject.material.dispose();
    }

    createParticle() {
        let particle = new Particle(
            this.params.particlesMaterial,
            this.params.lifetime,
            this.params.particleSize,
            this.params.startPosition
        );

        this.particles.push(particle);
        this.add(particle);
    }
}