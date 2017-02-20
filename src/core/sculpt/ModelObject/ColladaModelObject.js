import {RodinEvent} from '../../rodinEvent';
import {ModelObject} from './ModelObject.js';
import {Time} from '../../time';

/**
 *  This class allows you to load JD exported files to the scene.
 * <p>For better experience you can export collada file from blender.</p>
 * Select 'include Material Texture' option.
 */

export class ColladaModelObject extends ModelObject {

    /**
     * ColladaModelObject constructor.
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

        let onError = function () {
            console.log(`cannot download file`);
        };

        new THREE.ColladaLoader().load(URL, mesh => {
            mesh.scene.traverse((child) => {
                if (child instanceof THREE.SkinnedMesh) {
                    let animation = new THREE.Animation(child, child.geometry.animation);
                    animation.isPlaying = animation.isRunning;
                    animation.name = animation.name || 'unnamed';
                    console.log(animation);
                    this.animator.add(animation);
                }
            });

            this.init(mesh.scene);

            console.log("COLLADA file was loaded");
            this.emit('ready', new RodinEvent(this));
        }, onProgress, onError);

        this.on("update", (evt) => {
           THREE.AnimationHandler.update(Time.delta / 1000);
        });
    }
}
