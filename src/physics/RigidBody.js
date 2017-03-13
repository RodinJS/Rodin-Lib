'use strict';

const getSculptType = sculpt => {
    switch (true) {
        case sculpt.isBox:
            return 'box';
        case sculpt.isSphere:
            return 'sphere';

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

        let isGeometry;
        let geometry = this.sculpt._threeObject.geometry;
        // // TODO: redirect this.sculpt._threeObject.geometry to this.sculpt.geometry
        if (geometry.parameters) {
            isGeometry = true;
        }

        let width = 0.002;
        let height = 0.002;
        let depth = 0.002;
        let radius = 0.002;
        switch (this.body.type) {
            case 'plane':
                if (isGeometry) {
                    width = geometry.parameters.width;
                    height = geometry.parameters.height;
                } else {
                    geometry.computeBoundingBox();
                    let bBox = geometry.boundingBox;
                    width = Math.abs(bBox.max.x) + Math.abs(bBox.min.x) + 0.01;
                    height = Math.abs(bBox.max.y) + Math.abs(bBox.min.y) + 0.01;
                }

                this.body.size = [
                    width * this.body.scale.x * 100,
                    height * this.body.scale.y * 100,
                    depth * this.body.scale.z * 100];
                break;

            case 'box':
                // TODO: cylinder
            case 'cylinder':
                if (isGeometry) {
                    //console.log(geometry);
                    width = geometry.parameters.width;
                    height = geometry.parameters.height;
                    depth = geometry.parameters.depth;
                } else {
                    geometry.computeBoundingBox();
                    let bBox = geometry.boundingBox;
                    width = Math.abs(bBox.max.x) + Math.abs(bBox.min.x) + 0.01;
                    height = Math.abs(bBox.max.y) + Math.abs(bBox.min.y) + 0.01;
                    depth = Math.abs(bBox.max.z) + Math.abs(bBox.min.z) + 0.01;
                }

                this.body.size = [
                    width * this.body.scale.x * 100,
                    height * this.body.scale.y * 100,
                    depth * this.body.scale.z * 100];

                break;

            case 'sphere':
                if (isGeometry) {
                    radius = geometry.parameters.radius;
                } else {
                    geometry.computeBoundingSphere();
                    let bSphere = geometry.boundingSphere;
                    radius = bSphere.radius + 0.005;
                }

                // TODO: this is a Oimo.js problem only for sphere (x, y, z) real position
                this.body.size = [
                    radius * this.body.scale.y * 100,
                    radius * this.body.scale.z * 100,
                    radius * this.body.scale.x * 100];
                break;

            default:
                return
        }
    }
}