import {RodinEvent} from '../../rodinEvent';
import {Time} from '../../time/Time.js';
import {ModelObject} from './ModelObject.js';

/**
 * This class allows you to load JD exported files to the scene.
 * <p>You can export JD file from 3ds max.</p>
 * For export use Json 3D Exporter for 3ds Max 2016 - http://www.cgdev.net/json/download.php
 */

export class JDModelObject extends ModelObject {
    /**
     * JDModelObject constructor.
     * @param {string} [URL = '']
     */
    constructor (URL = '') {

        super();

        let onProgress = function (xhr) {
            if (xhr.lengthComputable) {
                let percentComplete = xhr.loaded / xhr.total * 100;
                console.log(Math.round(percentComplete, 2) + '% downloaded');
            }
        };

        let onError = function (xhr) {
        };

        new THREE.JDLoader().load(URL, (data) => { // data: { materials, geometries, boundingSphere }
            let multiMaterial = new THREE.MultiMaterial(data.materials);
            let meshes = new THREE.Group();

            for (let i = 0; i < data.geometries.length; ++i) {
                let mesh = new THREE.SkinnedMesh(data.geometries[i], multiMaterial);
                mesh.matrixAutoUpdate = false;
                mesh.updateMatrix();

                meshes.add(mesh);
                this.resolveMeshAnimations(mesh);
            }

            this.init(meshes);
            this.emit('ready', new RodinEvent(this));

            console.log("JD file was loaded");
        }, onProgress, onError);

        this.on("update", () => {
            this._mixers.map(mixer => mixer.update(Time.delta / 1000));
        });
    }
}
