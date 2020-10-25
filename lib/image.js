const Jimp = require('jimp');

/**
 * Signifies an automatic width or
 * height value when resizing an image.
 */
module.exports.AUTO = Jimp.AUTO;

/**
 * Opens an image from an URL,
 * resizes it and returns it.
 *
 * @param {String} url
 * @param {Number} w
 * @param {Number} h
 */
module.exports.open = async function (url, w, h) {
    return (await Jimp.read(url)).resize(w, h);
};

/**
 * Converts an integer color into
 * an RGBA color object.
 *
 * @param {Number} color
 */
module.exports.toRGBA = function (color) {
    return Jimp.intToRGBA(color);
};

/**
 * Computes the average pixel color of an
 * image from an URL and returns it.
 *
 * @param {String} url
 */
module.exports.averageColor = async function (url) {
    const image = await module.exports.open(url, 1, 1);
    const pixel = module.exports.toRGBA(image.getPixelColor(0, 0));
    const alpha = pixel.a / 255;
    return {
        r: Math.round(pixel.r * alpha + 54 * (1 - alpha)),
        g: Math.round(pixel.g * alpha + 57 * (1 - alpha)),
        b: Math.round(pixel.b * alpha + 63 * (1 - alpha))
    };
};