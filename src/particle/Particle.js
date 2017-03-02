'use strict';

import * as RODIN from 'rodin/core';

/**
 * set general parameters for each Particle
 * @constructor
 *
 * @version 0.0.1
 *
 * @param { THREE.SpriteMaterial } [ material = new THREE.SpriteMaterial({color: 0x00c0ff}) ] - particle's material
 *
 * @param { Number } [ lifetime ] - Time till die
 * @param { Number } [ lifetime.value = 5000 ] - set value in milliseconds
 * @param { Number } [ lifetime.randomness = 100 ] - particles create in unit of time
 *
 * @param { object } [ particleSize ] - Particle's scale parameter
 * @param { THREE.Vector3 } [ particleSize.value = new THREE.Vector3( 0.1, 0.1, 0.1 ) ] particle scaling vector
 * @param { THREE.Vector3 } [ particleSize.randomness = new THREE.Vector3( 0, 0, 0 ) ] particle scaling vector randomising parameter
 *
 * @param { object } [ startPositionRandomness ] - Particle's position parameter by randomness
 * @param { THREE.Vector3 } [ startPositionRandomness.randomness = 0 ]
 */

export class Particle {
    constructor(material, lifetime, particleSize, startPositionRandomness) {
        this.threeObject = new THREE.Sprite(material);
        this.bornTime = RODIN.Time.now;
        this.lifetime = lifetime;

        // set particle random size
        this.threeObject.scale.copy(calcRandom(particleSize.value, particleSize.randomness));

        // set particle random position
        let initial = new THREE.Vector3().copy(calcRandom(new THREE.Vector3(0, 0, 0), startPositionRandomness.randomness));
        this.threeObject.position.copy(initial);
        this.threeObject.initialPosition = new THREE.Vector3().copy(initial);
    }

    update() {
        // ...
    }

    isDead() {
        return RODIN.Time.now - this.bornTime > this.lifetime;
    }
}

// TODO: move it
const calcRandom = (initialParam, randomness) => {
    if (!isNaN(initialParam) && typeof initialParam === 'number') {
        return Math.random() * 2 * randomness - randomness + initialParam;
    } else if (initialParam.isVector3) {
        let x = Math.random() * 2 * randomness.x - randomness.x + initialParam.x;
        let y = Math.random() * 2 * randomness.y - randomness.y + initialParam.y;
        let z = Math.random() * 2 * randomness.z - randomness.z + initialParam.z;
        return new THREE.Vector3(x, y, z);
    }
};