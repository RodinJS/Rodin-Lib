'use strict';
import {Time} from '../core';

export class Physics {
    constructor(params) {
        params = Object.assign({
            timestep: 1 / 60,
            iterations: 8, // The number of iterations for constraint solvers : default 8.
            broadphase: 2, // Algorithm used for collision
                           // 1: BruteForceBroadPhase  2: sweep and prune  3: dynamic bounding volume tree
                           // default is 2 : best speed and lower cpu use.
            worldscale: 100, // scale full world
            random: true, // randomize sample
            info: true, // calculate statistic or not
            gravity: new THREE.Vector3(0, -9.8, 0)
        }, params);

        // create oimo world contains all rigidBodys and joint.
        this.world = new OIMO.World(params);
        this.world.maxSubSteps = 3;

        this.world.gravity = new OIMO.Vec3(params.gravity.x, params.gravity.y, params.gravity.z);

        this.rigidBodies = [];
        this.a = 0;
    }

    add(target) {
        if (!target.isSculpt) return;

        let body = this.world.add(target.rigidBody.body);
        body.target = target;
        this.rigidBodies.push(body);
    }

    // TODO: after implementation plug in idea
    remove() {

    }

    update() {
        this.a++;
        if (!this.world) return;
        if (this.a >= 10) {
            this.world.timeStep = Time.delta / 1000;
            this.world.step();

            let i = this.rigidBodies.length;
            while (i--) {
                if (!this.rigidBodies[i].sleeping) {


                    this.rigidBodies[i].target.globalPosition = oimoToThree(this.rigidBodies[i].position);
                    this.rigidBodies[i].target.globalQuaternion = oimoToThree(this.rigidBodies[i].getQuaternion());

                    if (this.rigidBodies[i].target.name === 'box'){
                        //console.log(this.rigidBodies[i].target._threeObject.scale);
                        //if (this.rigidBodies[i].target._scale.x != 1)
                        //{
                            //console.log('collision');
                            //console.log('scale',this.rigidBodies[i].target.globalScale.valueOf());
                            //console.log('size',this.rigidBodies[i].target.rigidBody.body.size);
                        //}

                    }
                }
            }
        }

    }

}

function oimoToThree(a) {
    switch (a.constructor) {
        case (new OIMO.Vec3()).constructor:
            return new THREE.Vector3(a.x, a.y, a.z);
        case (new Float32Array).constructor:
            let res;

            if (a.length === 16)
                res = new THREE.Matrix4();
            else if (a.length === 9)
                res = new THREE.Matrix3();
            else
                return undefined;

            res.fromArray(a);
            return res;

        /*case (new OIMO.Euler()).constructor:
         return new THREE.Vector3(a.x, a.y, a.z);*/

        case (new OIMO.Quat()).constructor:
            return new THREE.Quaternion(a.x, a.y, a.z, a.w);
    }
}