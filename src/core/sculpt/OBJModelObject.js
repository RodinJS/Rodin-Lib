import {RodinEvent} from '../rodinEvent';
import {Sculpt} from './Sculpt.js';


THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

/**
 * Loads .obj file to the scene.
 * <p>If You want to use OBJ file, then in order to avoid path problems,
 * please export your file and material in the same folder and make sure object and material names are the same.</p>
 * Obj format doesn't support animation.
 * @param {string} URL - file url
 */
export class OBJModelObject extends Sculpt {
    constructor(URL) {

        super();

        let onProgress = function (xhr) {
            if (xhr.lengthComputable) {
                let percentComplete = xhr.loaded / xhr.total * 100;
                console.log(Math.round(percentComplete, 2) + '% downloaded');
            }
        };

        let onError = function (xhr) {
            console.log('cannot load file');
        };

        let objLoader = new THREE.OBJLoader();
        let mtlLoader = new THREE.MTLLoader();

        objLoader.load(URL, mesh => {
            const mtlDir = URL.slice(0, URL.lastIndexOf("/") + 1);

            mtlLoader.setPath(mtlDir);
            mtlLoader.load(mesh.materialLibraries[0], (materials) => {
                materials.preload();

                objLoader.setMaterials(materials);
                objLoader.load(URL, mesh => {
                    this._threeObject = mesh;
                    this.emit('ready', new RodinEvent(this, {}));

                }, onProgress, onError);
            });

            console.log("OBJ file was loaded");
        }, onProgress, onError);
    }
}
