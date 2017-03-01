THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

export const loadOBJ = (URL, callback) => {
    let onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            let percentComplete = xhr.loaded / xhr.total * 100;
            // console.log(Math.round(percentComplete, 2) + '% downloaded');
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
                callback(mesh);

            }, onProgress, onError);
        });

        console.log("OBJ file was loaded");
    }, onProgress, onError);
};
