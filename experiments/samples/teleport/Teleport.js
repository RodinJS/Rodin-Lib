import * as RODIN from 'rodin/core';

export class Teleport {
    constructor(sourceObject, segmentsMaxNumber = 5, step = 0.5, objects) {

        this.sourceObject = sourceObject;
        this.segmentsMaxNumber = segmentsMaxNumber;
        this.step = step;
        this.objects = objects;

        this.sourceObject.on(RODIN.CONST.READY, () => {
            this.createLine(this.sourceObject._threeObject.getWorldDirection());
        });

        this.sourceObject.on(RODIN.CONST.UPDATE, () => {
            this.reDrawLine(this.sourceObject._threeObject.getWorldDirection());
        });
    }

    createLine(rayDirection){
        rayDirection = rayDirection.normalize();
        this.parabola = new RODIN.Parabola(rayDirection, -9.8, 0, 0);

        const pointsSculpt = new RODIN.Sculpt();
        for (let i = 0; i < this.segmentsMaxNumber; i++) {
            const point = new RODIN.Sphere(0.02, new THREE.MeshBasicMaterial({color: 0x00FF00}));
            point.position.copy(this.parabola.eval(this.step * i));
            pointsSculpt.add(point);
        }
        RODIN.Scene.add(pointsSculpt);
        this.pointsSculpt = pointsSculpt;
        this.raycaster = new RODIN.Raycaster();
        this.raycaster.distance = this.segmentsMaxNumber * this.step;
    }

    reDrawLine(rayDirection) {
        rayDirection = rayDirection.normalize();

        // calculate angle between ray vector and XZ plane, for projection it in 2D
        let rayDirectionOnXZ = new RODIN.Vector3(rayDirection.x, 0, rayDirection.z);
        let alpha = -rayDirectionOnXZ.angleTo(rayDirection) * Math.sign(rayDirection.y || 1);

        // calculate coefficient for acceleration, which is equal [0, 1]
        const lerpFactor = Math.pow(alpha / Math.PI + 1 / 2, 3);

        this.parabola.direction = rayDirection;
        this.parabola.a = -lerpFactor;
        this.parabola.b = Math.tan(alpha);
        this.parabola.c = 0;
        this.parabola.shift = this.sourceObject.globalPosition;
        let maxpos = null;
        for (let i = 0; i < this.pointsSculpt.children.length; i++) {
            if(this.step * i < this.raycaster.closest){
                maxpos = this.parabola.eval(this.step * i);
            }
            this.pointsSculpt.children[i].position.copy(maxpos);
        }
    }

    getIntersection(){
        return this.raycaster.raycastCurve(this.parabola, this.objects);
    }
}


