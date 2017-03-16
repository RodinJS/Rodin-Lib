import {Sculpt} from '../sculpt';
import {number, vector3} from '../utils';

/**
 * set general parameters for each Particle
 * @constructor
 *
 * @version 0.0.1
 *
 * @param { THREE.SpriteMaterial } [ material = new THREE.SpriteMaterial() ] - particle's material
 *
 * @param { Number } [ lifetime ] - Time till die
 * @param { Number } [ lifetime.value = 1000 ] - set value in milliseconds
 * @param { Number } [ lifetime.randomness = 100 ] - particles create in unit of time
 *
 * @param { object } [ particleSize ] - Particle's scale parameter,
 *                                      if value or randomness is a number, it is scale symmetric
 * @param { THREE.Vector3 | Number } [ particleSize.value = new THREE.Vector3(0.05, 0.05, 0.05) ] particle scaling vector
 * @param { THREE.Vector3 | Number } [ particleSize.randomness = new THREE.Vector3(0.01, 0.01, 0.01) ] particle scaling vector randomising parameter
 *
 * @param { object } [ startPositionRandomness ] - Particle's position parameter by randomness
 * @param { Number } [ startPositionRandomness.randomness = 1 ]
 */

export class Particle extends Sculpt {
    constructor(material, lifetime, particleSize, startPositionRandomness) {

        super(new THREE.Sprite(material));

        this.bornTime = RODIN.Time.now;
        this.lifetime = number.addNoise(lifetime.value, lifetime.randomness);

        particleSize.value = vector3.toVector3(particleSize.value);
        startPositionRandomness.randomness = vector3.toVector3(startPositionRandomness.randomness);

        // set particle random size
        this.scale.copy(number.addNoise(particleSize.value, particleSize.randomness));

        // set particle random position
        let initial = new THREE.Vector3().copy(vector3.addNoise(new THREE.Vector3(0, 0, 0), startPositionRandomness.randomness));
        this.position.copy(initial);
        this.initialPosition = new THREE.Vector3().copy(initial);
    }

    update() {
        // ...
    }

    isDead() {
        return RODIN.Time.now - this.bornTime > this.lifetime;
    }
}
