"use strict";

System.register(["rodin/core"], function (_export, _context) {
    "use strict";

    var R, logoPlane, logoTitle, sloganLine1, sloganLine2;
    function startLogoAnim() {
        R.Scene.add(logoPlane);
        logoPlane.position.set(0, 1.6, -2);

        R.Scene.add(logoTitle);
        logoTitle.position.set(.42, 1.69, -2);
        R.Scene.add(sloganLine1);
        sloganLine1.position.set(.42, 1.47, -2);
        R.Scene.add(sloganLine2);
        sloganLine2.position.set(.42, 1.35, -2);
    }

    _export("startLogoAnim", startLogoAnim);

    return {
        setters: [function (_rodinCore) {
            R = _rodinCore;
        }],
        execute: function () {
            logoPlane = new R.Plane(.5, .47, new THREE.MeshBasicMaterial({
                map: R.Loader.loadTexture("./img/KnoxlabsLogo.png"),
                transparent: true
            }));
            logoTitle = new R.Text3D("Be a Part of the Story", 0xffffff, "./fonts/Product_sans_bold.ttf", 0.14);
            sloganLine1 = new R.Text3D("Let us build your first VR campaign", 0xffffff, "./fonts/Product_sans_regular.ttf", 0.07);
            sloganLine2 = new R.Text3D("or enhance your current one", 0xffffff, "./fonts/Product_sans_regular.ttf", 0.07);
        }
    };
});