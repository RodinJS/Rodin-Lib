'use strict';

import {Sculpt} from '../Sculpt';
import {utils3D} from '../../utils';

/**
 * Element Class (experimental), used to create flat objects, parameters have the following structure:
 *
 * <div class="codeSample">
 * <p>{</p>
 * <p class="tab1"> name: string,</p>
 * <p class="tab1"> width: number,</p>
 * <p class="tab1"> height: number,</p>
 * <p class="tab1"> background: {</p>
 * <p class="tab2"> opacity: number,</p>
 * <p class="tab2"> color: hex,</p>
 * <p class="tab2"> image: { url: string }</p>
 * <p class="tab1"> },</p>
 * <p class="tab1"> border: {</p>
 * <p class="tab2"> radius: number,</p>
 * <p class="tab2"> color: hex,</p>
 * <p class="tab2"> width: number,</p>
 * <p class="tab2"> opacity: number</p>
 * <p class="tab1"> },</p>
 * <p class="tab1"> label: {</p>
 * <p class="tab2"> text: string,</p>
 * <p class="tab2"> position: { v: number, h: number },</p>
 * <p class="tab2"> fontFamily: string,</p>
 * <p class="tab2"> fontSize: number,</p>
 * <p class="tab2"> opacity: number,</p>
 * <p class="tab2"> color: Hex</p>
 * <p class="tab1"> },</p>
 * <p class="tab1"> image: {</p>
 * <p class="tab2"> url: string,</p>
 * <p class="tab2"> position: { v: number, h: number },</p>
 * <p class="tab2"> width: number,</p>
 * <p class="tab2"> height: number,</p>
 * <p class="tab2"> opacity: number</p>
 * <p class="tab1"> },</p>
 * <p class="tab1"> transparent: boolean,</p>
 * <p class="tab1"> ppm: number</p>
 * <p>}</p>
 * </div>
 *
 * @param {!Object} params - parameters
 * @param {Object} [params.name="element"] - the element name
 * @param {number} [params.width=0.2] - the element width in meters
 * @param {number} [params.height=0.15] - the element height in meters
 * @param {Object} [params.background] - the element background parameters
 * @param {Object} [params.border] - the element border parameters
 * @param {Object} [params.label] - a Text label that should appear on the element
 * @param {Object} [params.image] - an image that should appear on the element
 * @param {boolean} [params.transparent=true] - defines whether the mesh should be rendered as a transparent object or not
 * @param {number} [params.ppm=500] - the pixel per meter resolution
 */
export class Element extends Sculpt {


    constructor({
        name = "element",
        width = 0.2,
        height = 0.15,
        background = {},
        border = {},
        label,
        image,
        transparent = true,
        ppm = 500
        }) {
        super(new THREE.Object3D(), true);
        this.name = name;
        this.width = width;
        this.height = height;
        this.background = background;
        this.border = border;
        this.label = label;
        this.image = image;
        this.transparent = transparent;
        this.ppm = ppm;
        this.canvas = document.createElement("canvas");
        if (this.background.opacity === undefined && (this.background.color !== undefined || this.background.image !== undefined)) {
            this.background.opacity = 1;
        }
        if (!this.border.radius || this.border.radius <= 0) {
            this.border.radius = 0.001;
        }
        if (this.border.radius >= Math.min(this.width / 2, this.height / 2)) {
            this.border.radius = Math.min(this.width / 2, this.height / 2) - 0.001;
        }
        if (this.label && this.label.fontSize === undefined) {
            this.label.fontSize = Math.min(this.height, this.width) / 4;
        }
        if (this.image !== undefined && this.image.url === undefined) {
            this.image = null;
        }
        const checkImageLoad = () => {
            if (this.image && !this.image.loaded) return false;
            if (this.background.image && !this.background.image.loaded) return false;
            return true;
        };
        const draw = () => {
            if (!checkImageLoad()) return;
            let buttonShape = new THREE.Shape();
            utils3D.roundRect(buttonShape, this.width, this.height, this.border.radius);
            let buttonGeo = utils3D.createGeometryFromShape(buttonShape);

            let canvas = utils3D.setupCanvas({
                width: this.ppm * this.width,
                height: this.ppm * this.height,
                canvas: this.canvas
            });
            // Background
            /*            let buttonBGMat = new THREE.MeshBasicMaterial({
             color: this.background.color ? this.background.color : 0xffffff,
             transparent: !isNaN(parseFloat(this.background.opacity)),
             opacity: this.background.opacity,
             side:THREE.DoubleSide
             });
             if(this.background.image){
             let tex = this.background.image.texture;
             tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
             tex.repeat.set(1/this.width, 1/this.height);
             buttonBGMat.map = tex;
             }*/
            if (this.background.image) {
                utils3D.drawImageOnCanvas({
                    image: this.background.image.element,
                    opacity: this.background.opacity,
                    canvas: this.canvas
                });

                delete this.background.image.element;
                /*
                 document.body.appendChild(canvas);
                 canvas.style.zIndex = 9999999999;
                 canvas.style.position = "absolute";
                 canvas.style.top = "0";
                 canvas.style.left = "0";
                 */
            }
            else if (this.background.color !== undefined) {
                let ctx = this.canvas.getContext("2d");
                let rgb = utils3D.hexToRgb(this.background.color);
                ctx.fillStyle = "rgba("
                    + rgb.r + ", "
                    + rgb.g + ", "
                    + rgb.b + ", "
                    + this.background.opacity
                    + ")";
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }

            // label
            if (this.label) {
                let x = 50;
                let y = 50;
                let textSize = utils3D.measureTextOnCanvas(
                    this.label.text,
                    this.label.fontFamily,
                    this.label.fontStyle,
                    this.label.fontSize * this.ppm,
                    this.canvas
                );

                if (textSize.x > (this.ppm * this.width)) {
                    this.label.fontSize *= (this.ppm * this.width) / (textSize.x * 1.01);
                    console.warn("Text label '" + this.label.text + "' (" + textSize.x + " px) exceeds the element size (" + (this.ppm * this.width) + " px). " +
                        "\nThe label has been resized to fit the element.");
                    textSize = utils3D.measureTextOnCanvas(
                        this.label.text,
                        this.label.fontFamily,
                        this.label.fontStyle,
                        this.label.fontSize * this.ppm,
                        this.canvas
                    );
                }
                if (this.label.position && this.label.position.h) {
                    x = this.label.position.h * (this.ppm * this.width) / 100 - textSize.x / 2;
                }
                if (this.label.position && this.label.position.v) {
                    y = this.label.position.v * (this.ppm * this.height) / 100 - textSize.y / 2;
                }
                utils3D.drawTextOnCanvas({
                    text: this.label.text,
                    font: this.label.fontFamily,
                    fontSize: this.label.fontSize * this.ppm,
                    x,
                    y,
                    color: this.label.color,
                    opacity: this.label.opacity,
                    canvas: this.canvas
                });
            }

            // image
            if (this.image) {
                let x = 50;
                let y = 50;
                let w = this.ppm * this.image.width;
                let h = this.ppm * this.image.height;
                if (this.image.position && this.image.position.h) {
                    x = this.image.position.h * (this.ppm * this.width) / 100 - w / 2;
                }
                if (this.image.position && this.image.position.v) {
                    y = this.image.position.v * (this.ppm * this.height) / 100 - h / 2;
                }
                utils3D.drawImageOnCanvas({
                    image: this.image.element,
                    width: w,
                    height: h,
                    x,
                    y,
                    opacity: this.image.opacity,
                    canvas: this.canvas
                });
                delete this.image.element;
                /*                document.body.appendChild(canvas);
                 canvas.style.zIndex = 9999999999;
                 canvas.style.position = "absolute";
                 canvas.style.top = "0";
                 canvas.style.left = "0";*/
            }
            if (this.border && this.border.width) {
                let ctx = this.canvas.getContext("2d");
                ctx.globalAlpha = 1;
                ctx.beginPath();
                utils3D.roundRectCanvas(ctx, this.width * this.ppm, this.height * this.ppm, this.border.radius * this.ppm);
                ctx.closePath();
                ctx.lineWidth = this.border.width * 2 * this.ppm;
                let rgb = utils3D.hexToRgb(this.border.color);
                ctx.strokeStyle = "rgba("
                    + rgb.r + ", "
                    + rgb.g + ", "
                    + rgb.b + ", "
                    + (this.border.opacity ? this.border.opacity : 1)
                    + ")";
                ctx.stroke();
                /*                          document.body.appendChild(canvas);
                 canvas.style.zIndex = 9999999999;
                 canvas.style.position = "absolute";
                 canvas.style.top = "0";
                 canvas.style.left = "0";*/
            }

            let buttonMat = null;

            if (this.image || this.label || this.background.image || this.background.color !== undefined || this.border.width) {
                let w = utils3D.nearestPow2(this.canvas.width) / this.canvas.width;
                let h = utils3D.nearestPow2(this.canvas.height) / this.canvas.height;

                let inMemCanvas = document.createElement('canvas');
                let inMemCtx = inMemCanvas.getContext('2d');
                inMemCanvas.width = this.canvas.width * w;
                inMemCanvas.height = this.canvas.height * h;
                inMemCtx.drawImage(this.canvas, 0, 0, this.canvas.width * w, this.canvas.height * h);

                let tex = new THREE.Texture(inMemCanvas);
                tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
                tex.repeat.set(1 / this.width, 1 / this.height);

                buttonMat = new THREE.MeshBasicMaterial({
                    side: THREE.DoubleSide,
                    map: tex,
                    transparent: this.transparent
                });
                tex.needsUpdate = true;
                delete this.canvas;
                inMemCanvas = null;
            }


            // Mesh
            let buttonMesh = null;
            if (buttonMat) {
                buttonMesh = new THREE.Mesh(buttonGeo, buttonMat);
            }


            // Finalizing
            this._threeObject = buttonMesh;
            this.emitReady();

        };

        draw();
        let textureLoader = new THREE.TextureLoader();
        if (this.image) {
            let img = document.createElement("img");
            img.onload = () => {
                this.image.loaded = true;
                this.image.element = img;
                draw();
            };
            img.src = this.image.url;
        }
        if (this.background.image) {
            let img = document.createElement("img");
            img.onload = () => {
                this.background.image.loaded = true;
                this.background.image.element = img;
                draw();
            };
            img.src = this.background.image.url;
        }

    }


    /*    createMaterial(configs, imageObj) {
     let tileSize = imageObj.height / 3;
     let left = configs.position[0] * tileSize + 1;
     let top = configs.position[1] * tileSize + 1;
     let canvas = document.createElement('canvas');
     let context = canvas.getContext('2d');

     canvas.width = tileSize;
     canvas.height = tileSize;


     canvas.style.position = "absolute";
     canvas.style.left = "-150%";
     canvas.style.top = "-150%";

     context.rotate(configs.rotate);
     context.translate(configs.translate[0] * tileSize, configs.translate[1] * tileSize);
     context.drawImage(imageObj, left, top, tileSize - 2, tileSize - 2, 0, 0, tileSize, tileSize);

     let texture = new THREE.Texture();
     texture.image = canvas;
     texture.needsUpdate = true;
     return texture;
     }*/
}