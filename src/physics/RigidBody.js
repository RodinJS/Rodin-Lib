'use strict';
import * as RODIN from 'rodin/core';
import {Physics} from './Physics';

// TODO: add rigidBody to physics world here

export class RigidBody {
    constructor(...args) {
        if (!args.length) {
            return;
        }

        let target = null;
        let params = {};
        let lastArgument = 0;
        if (args[lastArgument].isSculpt) {
            target = args[lastArgument];
            lastArgument++;
        }
        if (args[lastArgument]){
            params = args[lastArgument];
        }

        this.params = Object.assign({
            type: 'box', // type of shape : 'sphere', 'box', 'cylinder'
            scale: target.globalScale, // size of shape
            position: target.globalPosition, // start position in degree
            rotation: target.rotation, // start rotation in degree
            move: true, // dynamic or statique
            //mass: this.mass,
            density: 1,
            friction: 0.2,
            restitution: 0.2,
            belongsTo: 1, // The bits of the collision groups to which the shape belongs.
            collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
        }, params );

        /*this.params = Object.assign({
            // TODO: let's user set type of collider
            type: 'sphere', // type of shape : 'sphere', 'box', 'cylinder'
            // TODO: calc scale of parent
            size: new THREE.Vector3(1, 1, 1), // size of shape
            // TODO: calc pos of parent
            pos: new THREE.Vector3(0, 0, 0), // start position in degree
            // TODO: calc rot of parent
            rot: new THREE.Vector3(0, 0, Math.PI / 2), // start rotation in degree
            move: true, // dynamic or statique
            //mass: this.mass,
            density: 1,
            friction: 0.2,
            restitution: 0.2,
            belongsTo: 1, // The bits of the collision groups to which the shape belongs.
            collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
        }, params);

        this.body = physics.world.add({
            type: this.params.type,
            size: [this.params.size.x, this.params.size.y, this.params.size.z],
            pos: [this.params.size.x, this.params.size.y, this.params.size.z],
            rot: [this.params.size.x, this.params.size.y, this.params.size.z],
            move: this.params.move,
            density: this.params.density,
            friction: this.params.friction,
            restitution: this.params.restitution,
            belongsTo: this.params.belongsTo,
            collidesWith: this.params.collidesWith,
            mesh: target
        });
        this.body.mesh = target;
        console.log(this.body);*/
    }

    createObjectCollision(type) {

    }
}