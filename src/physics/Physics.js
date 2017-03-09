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
        this.world = new OIMO.World({
            timestep: params.timestep,
            iterations: params.iterations,
            broadphase: params.broadphase,
            worldscale: params.worldscale,
            random: params.random,
            info: params.info
        });

        this.world.gravity = new OIMO.Vec3(params.gravity.x, params.gravity.y, params.gravity.z);

        //console.log(this.world.rigidBodies);
        this.rigidBodies = [];
        this.target = [];
        this.a = 0;
    }
    add(target) {
        if(!target.isSculpt) return;
        let body = this.world.add({
            type: target.RigidBody.params.type,
            size: [
                target.RigidBody.params.scale.x * 100,
                target.RigidBody.params.scale.y * 100,
                target.RigidBody.params.scale.z * 100
            ],
            pos:  [
                target.RigidBody.params.position.x * 100,
                target.RigidBody.params.position.y * 100,
                target.RigidBody.params.position.z * 100
            ],
            rot:  [
                target.RigidBody.params.rotation.x * (180 / Math.PI),
                target.RigidBody.params.rotation.y * (180 / Math.PI),
                target.RigidBody.params.rotation.z * (180 / Math.PI)
            ],
            move: target.RigidBody.params.move,
            density: target.RigidBody.params.density,
            friction: target.RigidBody.params.friction,
            restitution: target.RigidBody.params.restitution,
            belongsTo: target.RigidBody.params.belongsTo,
            collidesWith: target.RigidBody.params.collidesWith,
            //mesh: target
        });
        //this.target.push(target);
        //body.mesh = target;
        body.target = target;
        this.rigidBodies.push(body);
    }
    update() {
        this.a ++;
        if (!this.world) return;
        if (this.a>=50){
            this.world.timeStep = Time.delta/1000;
            this.world.step();
            //console.log(this.world.rigidBodies);
            let i = this.rigidBodies.length;
            while (i--) {
                if (!this.rigidBodies[i].sleeping) {

                    let newGlobalMatrix = new THREE.Matrix4();
                    newGlobalMatrix.compose(
                        oimoToThree(this.rigidBodies[i].body.position),
                        oimoToThree(this.rigidBodies[i].body.getQuaternion()),
                        this.rigidBodies[i].target.globalScale);

                    console.log(this.rigidBodies[i].getPosition());
                    this.rigidBodies[i].target.globalMatrix = newGlobalMatrix;
                }
            }
        }

    }

}

function oimoToThree(a) {
    //console.log("a", a);
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