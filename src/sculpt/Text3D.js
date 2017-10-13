import {Sculpt} from './Sculpt.js';
import {AScheme} from '../utils/index.js';
import {Loader} from '../loader/index.js';

const constructorScheme = {
    text: AScheme.string().default("text"),
    color: AScheme.number().default(0xffffff),
    font: AScheme.string().default('https://cdn.rodin.io/resources/fonts/helvetiker/helvetiker_regular.typeface.json'),
    fontSize: AScheme.number().default(.1),
    lineHeight: AScheme.number().default(-1),
    thickness: AScheme.number().default(0),
    align: AScheme.string().default("left"),
    material: AScheme.any().hasProperty('isMaterial').default(null),
    smoothness: AScheme.number().default(2),
    bevel: AScheme.bool().default(false),
    bevelThickness: AScheme.number().default(0),
    bevelSize: AScheme.number().default(0),
    bevelSegments: AScheme.number().default(5),
    maxWidth: AScheme.number().default(null),
};

const threeFontLoader = new THREE.FontLoader();

const reverseCommands = function (commands) {
    const paths = [];
    let path;

    commands.forEach(function (c) {
        if (c.type.toLowerCase() === "m") {
            path = [c];
            paths.push(path);
        } else if (c.type.toLowerCase() !== "z") {
            path.push(c);
        }
    });

    const reversed = [];
    paths.forEach(function (p) {
        let result = {"type": "m", "x": p[p.length - 1].x, "y": p[p.length - 1].y};
        reversed.push(result);

        for (let i = p.length - 1; i > 0; i--) {
            const command = p[i];
            result = {"type": command.type};
            if (command.x2 !== undefined && command.y2 !== undefined) {
                result.x1 = command.x2;
                result.y1 = command.y2;
                result.x2 = command.x1;
                result.y2 = command.y1;
            } else if (command.x1 !== undefined && command.y1 !== undefined) {
                result.x1 = command.x1;
                result.y1 = command.y1;
            }
            result.x = p[i - 1].x;
            result.y = p[i - 1].y;
            reversed.push(result);
        }

    });

    return reversed;
};

const convert = function (font, reverse = false) {
    font = opentype.parse(font);

    const scale = (100000) / ( (font.unitsPerEm || 2048) * 72);

    const result = {};
    result.glyphs = {};

    for (let k in font.glyphs.glyphs) {
        let glyph = font.glyphs.glyphs[k];
        if (glyph.unicode !== undefined) {
            const token = {};
            token.ha = Math.round(glyph.advanceWidth * scale);
            if (!glyph.xMin && !glyph.xMax) {
                token.x_min = null;
                token.x_max = null;
                token.o = "";
            } else {
                token.x_min = Math.round(glyph.xMin * scale);
                token.x_max = Math.round(glyph.xMax * scale);
                token.o = "";
                if (reverse) {
                    glyph.path.commands = reverseCommands(glyph.path.commands);
                }
                glyph.path.commands.forEach(function (command, i) {
                    if (command.type.toLowerCase() === "c") {
                        command.type = "b";
                    }
                    token.o += command.type.toLowerCase();
                    token.o += " ";
                    if (command.x !== undefined && command.y !== undefined) {
                        token.o += Math.round(command.x * scale);
                        token.o += " ";
                        token.o += Math.round(command.y * scale);
                        token.o += " ";
                    }
                    if (command.x1 !== undefined && command.y1 !== undefined) {
                        token.o += Math.round(command.x1 * scale);
                        token.o += " ";
                        token.o += Math.round(command.y1 * scale);
                        token.o += " ";
                    }
                    if (command.x2 !== undefined && command.y2 !== undefined) {
                        token.o += Math.round(command.x2 * scale);
                        token.o += " ";
                        token.o += Math.round(command.y2 * scale);
                        token.o += " ";
                    }
                });
            }
            result.glyphs[String.fromCharCode(glyph.unicode)] = token;
        }
    }
    result.familyName = font.names.fullName[[Object.keys(font.names.fullName)[0]]];
    result.ascender = Math.round(font.ascender * scale);
    result.descender = Math.round(font.descender * scale);
    result.underlinePosition = font.tables.post.underlinePosition;
    result.underlineThickness = font.tables.post.underlineThickness;
    result.boundingBox = {
        "yMin": font.tables.head.yMin,
        "xMin": font.tables.head.xMin,
        "yMax": font.tables.head.yMax,
        "xMax": font.tables.head.xMax
    };
    result.resolution = 1000;
    result.original_font_information = font.tables.name;

    if (font.names.fullName[[Object.keys(font.names.fullName)[0]]].toLowerCase().indexOf("bold") > -1) {
        result.cssFontWeight = "bold";
    } else {
        result.cssFontWeight = "normal";
    }
    ;

    if (font.names.fullName[[Object.keys(font.names.fullName)[0]]].toLowerCase().indexOf("italic") > -1) {
        result.cssFontStyle = "italic";
    } else {
        result.cssFontStyle = "normal";
    }
    ;

    return JSON.stringify(result);
};


export class Text3D extends Sculpt {

    static loadFont(font, reverse = false) {
        if (Text3D.fonts.hasOwnProperty(font)) return;
        Text3D.fonts[font] = null;
        if (!font.substring(font.lastIndexOf('.') + 1).startsWith("json")) {
            Loader.loadFont(font, (rawFont) => {
                Text3D.fonts[font] = threeFontLoader.parse(
                    JSON.parse(
                        convert(rawFont, reverse)
                    )
                );
                for (let i = 0; i < Text3D.instances.length; i++) {
                    if (Text3D.instances[i]._font === font) {
                        Text3D.instances[i].draw(Text3D.fonts[font]);
                    }
                }
            })
        } else {
            threeFontLoader.load(font, (_font) => {
                Text3D.fonts[font] = _font;
                for (let i = 0; i < Text3D.instances.length; i++) {
                    if (Text3D.instances[i]._font === font) {
                        Text3D.instances[i].draw(Text3D.fonts[font]);
                    }
                }
            });
        }
    }

    /**
     * Text3D is a class for text mesh objects.
     * @param {String|Hex|String|Number|Boolean|Number|THREE.Material|Number|Number|Number|Number} args
     */
    constructor(...args) {
        args = AScheme.validate(args, constructorScheme);
        super(new THREE.Object3D(), "deferReady");
        this._text = args.text;
        this._color = args.color;
        this._font = args.font;
        this._fontSize = args.fontSize;
        this._lineHeight = args.lineHeight > 0 ? args.lineHeight : args.fontSize * 1.4;
        this._align = args.align;
        this._bevel = args.bevel;
        this._thickness = args.thickness;
        this._material = !!args.material ? args.material : new THREE.MeshBasicMaterial({color: this._color});
        this._smoothness = args.smoothness;
        this._bevelThickness = args.bevelThickness;
        this._bevelSize = args.bevelSize;
        this._bevelSegments = args.bevelSegments;
        this._maxWidth = args.maxWidth;

        if (!Text3D.fonts.hasOwnProperty(this._font)) {
            Text3D.instances.push(this);
            Text3D.loadFont(this._font);
        } else if (Text3D.fonts[this._font] === null) {
            Text3D.instances.push(this);
        } else {
            this.draw(Text3D.fonts[this._font]);
        }

    }

    draw(font) {
        const geos = [];
        const textGeometryParams = {
            font: font,
            size: this._fontSize,
            lineHeight: this._lineHeight,
            height: this._thickness,
            curveSegments: this._smoothness,
            bevelEnabled: this._bevel,
            bevelThickness: this._bevelThickness,
            bevelSize: this._bevelSize,
            bevelSegments: this._bevelSegments
        };
        const lines = this._text.replace(/[\t\f\v ]+/g, ' ').split('\n');

        let maxWidth = 0;
        for (let i = 0; i < lines.length; i++) {
            if (this._maxWidth) {
                const words = lines[i].split(/\s/);
                let currentWidth = 0;
                let currentText = '';

                for (let j = 0; j < words.length; j++) {
                    const g = new TextGeometry(words[j], textGeometryParams);
                    g.computeBoundingBox();
                    g.width = g.boundingBox.max.x - g.boundingBox.min.x;

                    if (currentWidth + g.width > this._maxWidth && g.width < this._maxWidth) {
                        lines.splice(i + 1, 0, words.filter((a, index) => index >= j).join(' '));
                        break;
                    }
                    currentWidth += g.width;
                    currentText += words[j] + ' ';

                    if (g.width > this._maxWidth){
                        lines.splice(i + 1, 0, words.filter((a, index) => index > j).join(' '));
                        break;
                    }
                }
                const currentGeometry = new TextGeometry(currentText, textGeometryParams);
                currentGeometry.computeBoundingBox();
                currentGeometry.width = currentGeometry.boundingBox.max.x - currentGeometry.boundingBox.min.x;
                geos.push(currentGeometry);
            } else {
                const g = new TextGeometry(lines[i], textGeometryParams);
                g.computeBoundingBox();
                g.width = g.boundingBox.max.x - g.boundingBox.min.x;
                geos.push(g);
                maxWidth = maxWidth < g.width ? g.width : maxWidth;
            }
        }


        const geometry = new THREE.Geometry();
        if (this._align === "left") {
            for (let i = 0; i < geos.length; i++) {
                const g = geos[i];
                g.translate(0, -i * this._lineHeight, 0);
                geometry.merge(g);
            }
        }
        else if (this._align === "center") {
            for (let i = 0; i < geos.length; i++) {
                const g = geos[i];
                g.translate(-g.width / 2, -i * this._lineHeight, 0);
                geometry.merge(g);
            }
        }
        else if (this._align === "right") {
            for (let i = 0; i < geos.length; i++) {
                const g = geos[i];
                g.translate(-g.width, -i * this._lineHeight, 0);
                geometry.merge(g);
            }
        }


        // Finalizing
        this._threeObject = new THREE.Mesh(geometry, this._material);
        this.emitReady();
    }

    center() {
        this._threeObject.geometry.center();
    }
}
;

class TextGeometry extends THREE.Geometry {
    constructor(text, parameters) {
        super();
        parameters = parameters || {};
        var font = parameters.font;

        if (!( font && font.isFont )) {
            return new Geometry();
        }

        var shapes = font.generateShapes(text, parameters.size, parameters.curveSegments);

        if (!parameters.height) {
            this.copy(new THREE.ShapeGeometry(shapes, parameters.curveSegments));
        } else {
            // translate parameters to ExtrudeGeometry API
            parameters.amount = parameters.height !== undefined ? parameters.height : 50;
            if (parameters.bevelThickness === undefined) parameters.bevelThickness = 10;
            if (parameters.bevelSize === undefined) parameters.bevelSize = 8;
            if (parameters.bevelEnabled === undefined) parameters.bevelEnabled = false;

            this.copy(new THREE.ExtrudeGeometry(shapes, parameters));
        }

        this.type = 'TextBufferGeometry';
        this.mergeVertices();
    }
}

Text3D.instances = [];
Text3D.fonts = {};