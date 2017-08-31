import {Sculpt} from './Sculpt';
import {AScheme} from '../utils';
import {Loader} from '../loader';

const constructorScheme = {
    text: AScheme.string().default("text"),
    color: AScheme.number().default(0xffffff),
    font: AScheme.string().default('https://cdn.rodin.io/resources/fonts/helvetiker/helvetiker_regular.typeface.json'),
    fontSize: AScheme.number().default(.1),
    thickness: AScheme.number().default(.001),
    material: AScheme.any().hasProperty('isMaterial').default(null),
    smoothness: AScheme.number().default(3),
    bevel: AScheme.bool().default(false),
    bevelThickness: AScheme.number().default('$thickness'),
    bevelSize: AScheme.number().default('$thickness'),
    bevelSegments: AScheme.number().default(5)
};
const threeFontLoader = new THREE.FontLoader();
/**
 *
 */

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
    };

    return JSON.stringify(result);
};




/*var convert = function(font){

 font = opentype.parse(font);
 console.log(font);

 var scale = (1000 * 100) / ( (font.unitsPerEm || 2048) *72);
 var result = {};
 result.glyphs = {};


 font.glyphs.forEach(function(glyph){
 if (glyph.unicode !== undefined) {
 var glyphCharacter = String.fromCharCode (glyph.unicode);
 var needToExport = true;
 if (needToExport) {

 var token = {};
 token.ha = Math.round(glyph.advanceWidth * scale);
 token.x_min = Math.round(glyph.xMin * scale);
 token.x_max = Math.round(glyph.xMax * scale);
 token.o = ""
 //if (reverseTypeface.checked) {glyph.path.commands = reverseCommands(glyph.path.commands);}
 glyph.path.commands.forEach(function(command,i){
 if (command.type.toLowerCase() === "c") {command.type = "b";}
 token.o += command.type.toLowerCase();
 token.o += " "
 if (command.x !== undefined && command.y !== undefined){
 token.o += Math.round(command.x * scale);
 token.o += " "
 token.o += Math.round(command.y * scale);
 token.o += " "
 }
 if (command.x1 !== undefined && command.y1 !== undefined){
 token.o += Math.round(command.x1 * scale);
 token.o += " "
 token.o += Math.round(command.y1 * scale);
 token.o += " "
 }
 if (command.x2 !== undefined && command.y2 !== undefined){
 token.o += Math.round(command.x2 * scale);
 token.o += " "
 token.o += Math.round(command.y2 * scale);
 token.o += " "
 }
 });
 result.glyphs[String.fromCharCode(glyph.unicode)] = token;
 }
 };
 });
 result.familyName = font.familyName;
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
 if (font.styleName.toLowerCase().indexOf("bold") > -1){
 result.cssFontWeight = "bold";
 } else {
 result.cssFontWeight = "normal";
 };

 if (font.styleName.toLowerCase().indexOf("italic") > -1){
 result.cssFontStyle = "italic";
 } else {
 result.cssFontStyle = "normal";
 };

 if(true) {
 return JSON.stringify(result);
 } else {
 return "if (_typeface_js && _typeface_js.loadFace) _typeface_js.loadFace("+ JSON.stringify(result) + ");"
 }
 };*/

export class Text3D extends Sculpt {
    static instances = [];
    static fonts = {};

    static loadFont(font, reverse = false) {
        if (Text3D.fonts.hasOwnProperty(font)) return;
        Text3D.fonts[font] = null;
        if (!font.substring(font.lastIndexOf('.') + 1).startsWith("json")) {
            Loader.loadFont(font, (rawFont)=> {
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
            threeFontLoader.load(font, (_font)=> {
                Text3D.fonts[font] = _font;
                for (let i = 0; i < Text3D.instances.length; i++) {
                    if (Text3D.instances[i]._font === font) {
                        Text3D.instances[i].draw(Text3D.fonts[font]);
                    }
                }
            });
        }
    }

    constructor(...args) {
        args = AScheme.validate(args, constructorScheme);
        super(new THREE.Object3D(), "deferReady");
        this._text = args.text;
        this._color = args.color;
        this._font = args.font;
        this._fontSize = args.fontSize;
        this._bevel = args.bevel;
        this._thickness = args.thickness;
        this._material = !!args.material ? args.material : new THREE.MeshBasicMaterial({color: this._color});
        this._smoothness = args.smoothness;
        this._bevelThickness = args.bevelThickness;
        this._bevelSize = args.bevelSize;
        this._bevelSegments = args.bevelSegments;

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
        const geometry = new THREE.TextGeometry(this._text, {
            font: font,
            size: this._fontSize,
            height: this._thickness,
            curveSegments: this._smoothness,
            bevelEnabled: this._bevel,
            bevelThickness: this._bevelThickness,
            bevelSize: this._bevelSize,
            bevelSegments: this._bevelSegments
        });

        // Finalizing
        this._threeObject = new THREE.Mesh(geometry, this._material);
        this.emitReady();
    };

    center() {
        this._threeObject.geometry.center();
    }
}
