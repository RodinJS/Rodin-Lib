'use strict';

/**
 *
 * @param { THREE.Shape } shape
 */
export function createGeometryFromShape(shape) {

    let geometry = new THREE.ShapeGeometry(shape);
    geometry.center();
    return geometry;

}

export function scaleGeometry(geometry, scale) {

    for (var i = 0; i < geometry.vertices.length; i++) {
        var vertex = geometry.vertices[i];
        vertex.x *= scale.x;
        vertex.y *= scale.y;
        vertex.z *= scale.z;
    }

    geometry.parameters.width *= scale.x;
    geometry.parameters.height *= scale.y;
    geometry.parameters.depth *= scale.z;
    geometry.__dirtyVertices = true;


    return geometry;
}

export function createShape(shape = null, material = null) {

    let geometry = new THREE.ShapeGeometry(shape);
    geometry.center();
    return new THREE.Mesh(geometry, material);

}

export function pill(ctx, width, radius) {
    width = width - 2 * radius;

    ctx.moveTo(radius, 0);

    ctx.lineTo(radius + width, 0);

    ctx.absarc(radius + width, radius, radius, -Math.PI / 2, Math.PI / 2, true);

    ctx.lineTo(radius, 2 * radius);

    ctx.absarc(radius, radius, radius, Math.PI / 2, 3 * Math.PI / 2, true);
}


export function roundRectCanvas(ctx, width, height, radius) {

    radius = radius > width / 2 ? width / 2 : radius;
    radius = radius > height / 2 ? height / 2 : radius;

    width = width - 2 * radius;
    height = height - 2 * radius;

    ctx.moveTo(radius, 0);

    ctx.lineTo(radius + width, 0);

    ctx.arc(radius + width, radius, radius, -Math.PI / 2, 0);

    ctx.lineTo(2 * radius + width, radius + height);

    ctx.arc(radius + width, radius + height, radius, 0, Math.PI / 2);

    ctx.lineTo(radius, 2 * radius + height);

    ctx.arc(radius, radius + height, radius, Math.PI / 2, Math.PI);

    ctx.lineTo(0, radius);

    ctx.arc(radius, radius, radius, Math.PI, 1.5 * Math.PI);
}

export function roundRect(ctx, width, height, radius) {

    radius = radius > width / 2 ? width / 2 : radius;
    radius = radius > height / 2 ? height / 2 : radius;

    width = width - 2 * radius;
    height = height - 2 * radius;

    ctx.moveTo(radius, 0.0000001);

    ctx.lineTo(radius + width, 0.0000001);

    ctx.absarc(radius + width, radius, radius, -Math.PI / 2, 0);

    ctx.lineTo(2 * radius + width, radius + height);

    ctx.absarc(radius + width, radius + height, radius, 0, Math.PI / 2);

    ctx.lineTo(radius, 2 * radius + height);

    ctx.absarc(radius, radius + height, radius, Math.PI / 2, Math.PI);

    ctx.lineTo(0.0000001, radius);

    ctx.absarc(radius, radius, radius, Math.PI, 1.5 * Math.PI);
}

export function createTextTexture(text, font, fontSize, color, clear, textCanvas) {
    let textContext = textCanvas.getContext('2d');
    clear && textContext.clearRect(0, 0, textCanvas.width, textCanvas.height);
    let rgb = hexToRgb(color);
    fontSize *= 100;
    textContext.font = fontSize + "px " + font;
    textCanvas.width = textContext.measureText(text).width;
    textCanvas.height = fontSize;
    textContext.font = fontSize + "px " + font;
    textContext.fillStyle = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
    textContext.fillText(text, 0, fontSize, textCanvas.width);
    return new THREE.Texture(textCanvas);
}

export function setupCanvas({width = 0, height = 0, canvas}) {
    let context = canvas.getContext('2d');
    context.globalAlpha = 1;
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

export function measureTextOnCanvas(text, font = "Arial", fontStyle = '', fontSize = 12, canvas) {
    let textContext = canvas.getContext('2d');
    textContext.font = fontStyle + " " + fontSize + "px " + font;
    return {x: textContext.measureText(text).width, y: fontSize};
}

export function drawImageOnCanvas({image, canvas, width = canvas.width, height = canvas.height, x=0, y=0, opacity = 1}) {
    let context = canvas.getContext('2d');
    context.globalAlpha = opacity;
    context.drawImage(image, x, y, width, height);
    return canvas;
}

export function drawTextOnCanvas({text, font = "Arial", fontStyle = '', fontSize = 12, x = 0, y = 0, color = 0x000000, opacity = 1, canvas}) {
    let textContext = canvas.getContext('2d');
    let rgb = hexToRgb(color);
    textContext.font = fontStyle + " " + fontSize + "px " + font;
    textContext.globalAlpha = opacity;
    textContext.fillStyle = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
    textContext.textBaseline = "bottom";
    textContext.fillText(text, x, y + fontSize);
    return canvas;
}


export function drawDynTextOnCanvas({text, font = "Arial", fontSize = 12, lineHeight = fontSize, x = 0, y = 0, color = 0x000000, opacity = 1, canvas}) {
    let textContext = canvas.getContext('2d');
    let rgb = hexToRgb(color);
    textContext.font = fontSize + "px " + font;
    textContext.globalAlpha = opacity;
    textContext.fillStyle = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
    textContext.textBaseline = "bottom";
    return wrapText({context: textContext, text: text, maxWidth: canvas.width, lineHeight: lineHeight, canvas: canvas});
}
export function wrapText({context, text, x = 0, y = 0, maxWidth, lineHeight, canvas}) {
    var words = text.split(" ");
    var line = "";
    y += lineHeight;
    for(var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if(testWidth+x > maxWidth) {
            context.fillText(line, x, y);
            line = words[n] + " ";
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
    if(y > canvas.height){
        let inMemCanvas = document.createElement('canvas');
        let inMemContext = inMemCanvas.getContext('2d');
        inMemCanvas.width = maxWidth;
        inMemCanvas.height = y;
        inMemContext.font = context.font;
        inMemContext.globalAlpha = context.globalAlpha;
        inMemContext.fillStyle = context.fillStyle;
        inMemContext.textBaseline = context.textBaseline;
        console.log("resizing canvas"+y);
        return wrapText({context: inMemContext, text: text, maxWidth: maxWidth, lineHeight: lineHeight, canvas: inMemCanvas})
    }
    return canvas;
}


export function hexToRgb(hex) {
    return {
        r: (hex >> 16) & 0xFF,        // or `(i & 0xFF0000) >> 16`
        g: (hex >> 8) & 0xFF,        // or `(i & 0x00FF00) >>  8`
        b: hex & 0xFF
    };
}

export function nearestPow2(value) {
    return Math.pow(2, Math.round(Math.log(value) / Math.log(2)));
}
