'use strict';
import * as RODIN from 'rodin/core';

const getSculptType = sculpt => {
    switch (true) {
        case sculpt.isBox:
            return 'box';
        case sculpt.isSphere:
            return 'sphere';

        case sculpt.isCylinder:
            return 'cylinder';
        default:
            return 'boundingBox';
    }
};

export class RigidBody {
    constructor(...args) {
        if (!args.length) {
            return;
        }

        this.sculpt = null;
        let params = {};
        let lastArgument = 0;
        if (args[lastArgument].isSculpt) {
            this.sculpt = args[lastArgument];
            lastArgument++;
        }
        if (args[lastArgument]) {
            params = args[lastArgument];
        }

        // TODO: implement pivot idea
        this.body = Object.assign({
            type: getSculptType(this.sculpt), // type of shape : 'sphere', 'box', 'cylinder'
            scale: this.sculpt.globalScale, // size of shape
            position: this.sculpt.globalPosition, // start position in degree
            rotation: this.sculpt.rotation, // start rotation in degree
            move: true, // dynamic or statique
            density: 1,
            friction: 0.2,
            restitution: 0.2,
            belongsTo: 1, // The bits of the collision groups to which the shape belongs.
            collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
        }, params);
        this.setCollider();
    }

    setCollider() {
        this.body.pos = [
            this.body.position.x * 100,
            this.body.position.y * 100,
            this.body.position.z * 100
        ];

        // TODO: in degree
        // TODO: get global rotation
        this.body.rot = [
            this.body.rotation.x * (180 / Math.PI),
            this.body.rotation.y * (180 / Math.PI),
            this.body.rotation.z * (180 / Math.PI)
        ];

        const geometry = this.sculpt._threeObject.geometry;

        let width = 0.002;
        let height = 0.002;
        let depth = 0.002;
        switch (this.body.type) {
            case 'plane':
                if (this.sculpt.isBox) {
                    width = this.sculpt.width + 0.01;
                    height = this.sculpt.height + 0.01;
                } else {
                    geometry.computeBoundingBox();
                    const bBox = geometry.boundingBox;
                    width = Math.abs(bBox.max.x) + Math.abs(bBox.min.x) + 0.01;
                    height = Math.abs(bBox.max.y) + Math.abs(bBox.min.y) + 0.01;
                }
                break;

            case 'box':
                if (this.sculpt.isBox) {
                    width = this.sculpt.width + 0.01;
                    height = this.sculpt.height + 0.01;
                    depth = this.sculpt.depth + 0.01;
                } else {
                    geometry.computeBoundingBox();
                    const bBox = geometry.boundingBox;
                    width = Math.abs(bBox.max.x) + Math.abs(bBox.min.x) + 0.01;
                    height = Math.abs(bBox.max.y) + Math.abs(bBox.min.y) + 0.01;
                    depth = Math.abs(bBox.max.z) + Math.abs(bBox.min.z) + 0.01;
                }
                break;

            case 'sphere':
                let radius;
                if (this.sculpt.isSphere) {
                    radius = this.sculpt.radius + 0.005;
                } else {
                    geometry.computeBoundingSphere();
                    const bSphere = geometry.boundingSphere;
                    radius = bSphere.radius + 0.005;
                }

                // TODO: calculate sphere scale deformation
                width = radius;
                height = radius;
                depth = radius;
                break;

            case 'cylinder':
                if (this.sculpt.isCylinder) {
                    width = this.sculpt.radiusTop + 0.01;
                    height = this.sculpt.height   + 0.01;
                    depth = this.sculpt.radiusTop + 0.01;
                } else {
                    geometry.computeBoundingBox();
                    const bBox = geometry.boundingBox;
                    width = Math.abs(bBox.max.x) + Math.abs(bBox.min.x) + 0.01;
                    height = Math.abs(bBox.max.y) + Math.abs(bBox.min.y) + 0.01;
                    depth = Math.abs(bBox.max.z) + Math.abs(bBox.min.z) + 0.01;
                }
                break;

            default:
                geometry.computeBoundingBox();
                const bBox = geometry.boundingBox;
                width = Math.abs(bBox.max.x) + Math.abs(bBox.min.x) + 0.01;
                height = Math.abs(bBox.max.y) + Math.abs(bBox.min.y) + 0.01;
                depth = Math.abs(bBox.max.z) + Math.abs(bBox.min.z) + 0.01;

        }

        this.body.size = [
            width * this.body.scale.x * 100,
            height * this.body.scale.y * 100,
            depth * this.body.scale.z * 100];
    }
}