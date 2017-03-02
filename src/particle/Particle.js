'use strict';

import * as RODIN from 'rodin/core';

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

export class Particle {
    constructor(material, lifetime, particleSize, startPositionRandomness) {
        this.threeObject = new THREE.Sprite(material);
        this.bornTime = RODIN.Time.now;
        this.lifetime = calcRandom(lifetime.value, lifetime.randomness);

        const convertToVector = (r = null) => {
            if (r == null) return new THREE.Vector3(0, 0, 0);
            return r.isVector3 ? r : new THREE.Vector3(r, r, r);
        };
        particleSize.value = convertToVector(particleSize.value);
        startPositionRandomness.randomness = convertToVector(startPositionRandomness.randomness);

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
    if (!isNaN(initialParam) && typeof initialParam === 'number' && !isNaN(randomness) && typeof randomness === 'number') {
        return Math.random() * 2 * randomness - randomness + initialParam;
    }

    let x;
    let y;
    let z;
    if (initialParam.isVector3 && !isNaN(randomness) && typeof randomness === 'number') {
        let randomValue = Math.random();
        x = randomValue * 2 * randomness - randomness + initialParam.x;
        y = randomValue * 2 * randomness - randomness + initialParam.y;
        z = randomValue * 2 * randomness - randomness + initialParam.z;
        return new THREE.Vector3(x, y, z);
    }
    if ((initialParam.isVector3 || (!isNaN(initialParam) && typeof initialParam === 'number')) && randomness.isVector3) {
        x = Math.random() * 2 * randomness.x - randomness.x + initialParam.x;
        y = Math.random() * 2 * randomness.y - randomness.y + initialParam.y;
        z = Math.random() * 2 * randomness.z - randomness.z + initialParam.z;
        return new THREE.Vector3(x, y, z);
    }
};