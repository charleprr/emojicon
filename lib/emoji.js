// List of default emojis
module.exports.list = require('../emojis.json');

// The blank emoji for
// transparent backgrounds.
const config = require('../config.json');
if (config.blank && config.blank !== '') {
    module.exports.BLANK = config.blank;
} else {
    module.exports.BLANK = ':dark_sunglasses:';
}

/**
 * Find one emoji that matches
 * the given parameters.
 *
 * @param {object} params
 */
module.exports.findOne = function (params) {
    const entries = Object.entries(params);
    for (const emoji of module.exports.list) {
        for (const entry of entries) {
            if (emoji[entry[0]] !== entry[1]) {
                break;
            }
            return emoji;
        }
    }
    return null;
};

/**
 * Find all emojis that match
 * the given parameters.
 *
 * @param {object} params
 */
module.exports.findAll = function (params) {
    const entries = Object.entries(params);
    const result = [];
    for (const emoji of module.exports.list) {
        for (const entry of entries) {
            if (emoji[entry[0]] !== entry[1]) {
                break;
            }
            result.push(emoji);
        }
    }
    return result;
};

/**
 * Parses a given string into a
 * default or guild emoji.
 *
 * @param {String} text
 */
module.exports.parse = function (text) {
    const match = text.match(/(?:<(a)?:)?([\w_]{2,32}):(\d+)>?/);
    if (match) {
        let emoji = {};
        emoji.animated = Boolean(match[1]);
        emoji.name = match[2];
        emoji.id = match[3];
        emoji.imageUrl = `https://cdn.discordapp.com/emojis/${emoji.id}.png`;
        return emoji;
    }
    return module.exports.findOne({surrogates: text});
};

/**
 * Given an RGB(A) color, find the emoji with the closest
 * average color and return its identifier.
 *
 * @param {object} color
 */
module.exports.closest = function (color) {
    if (!color.a) return module.exports.BLANK;
    const opacity = color.a / 255;
    const target = {
        r: Math.round(color.r * opacity + 54 * (1 - opacity)),
        g: Math.round(color.g * opacity + 57 * (1 - opacity)),
        b: Math.round(color.b * opacity + 63 * (1 - opacity))
    };
    let result;
    let distance;
    let minimum = Infinity;
    for (const emoji of module.exports.list.filter(e => e.usable)) {
        distance = Math.sqrt(
            Math.pow(target.r - emoji.color.r, 2) +
            Math.pow(target.g - emoji.color.g, 2) +
            Math.pow(target.b - emoji.color.b, 2)
        );
        if (distance < minimum) {
            result = `:${emoji.names[0]}:`;
            minimum = distance;
        }
    }
    return result;
};