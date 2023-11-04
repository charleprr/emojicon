import emojis from "../emojis.json";
import config from "../config.json";

// List of default emojis
export const list = emojis;

// The default emoji for
// transparent backgrounds.
export const defaultBlankEmoji = ":heavy_minus_sign:";
export const customBlankEmoji = config["blank"] || defaultBlankEmoji;

/**
 * Find one emoji that matches
 * the given parameters.
 */
export function findOne(properties: any): any {
  const entries = Object.entries(properties);
  for (const emoji of list) {
    for (const entry of entries) {
      if (emoji[entry[0]] !== entry[1]) {
        break;
      }
      return emoji;
    }
  }
  return null;
}

/**
 * Find all emojis that match
 * the given parameters.
 */
export function findAll(properties: any): any[] {
  const entries = Object.entries(properties);
  const result = [];
  for (const emoji of list) {
    for (const entry of entries) {
      if (emoji[entry[0]] !== entry[1]) {
        break;
      }
      result.push(emoji);
    }
  }
  return result;
}

/**
 * Parses a given string into a
 * default or guild emoji.
 */
export function parse(text: string): any {
  const match = text.match(/(?:<(a)?:)?([\w_]{2,32}):(\d+)>?/);
  if (match) {
    let emoji: any = {};
    emoji.animated = Boolean(match[1]);
    emoji.name = match[2];
    emoji.id = match[3];
    emoji.imageUrl = `https://cdn.discordapp.com/emojis/${emoji.id}.png`;
    return emoji;
  }
  return findOne({ surrogates: text });
}

/**
 * Given an RGB(A) color, find the emoji with the closest
 * average color and return its identifier.
 */
export function closest(color: any): any {
  if (!color.a) return customBlankEmoji;
  const opacity = color.a / 255;
  const target = {
    r: Math.round(color.r * opacity + 54 * (1 - opacity)),
    g: Math.round(color.g * opacity + 57 * (1 - opacity)),
    b: Math.round(color.b * opacity + 63 * (1 - opacity)),
  };
  let result: any;
  let distance: number;
  let minimum = Infinity;
  for (const emoji of list.filter(e => e.usable)) {
    distance = Math.sqrt(
      Math.pow(target.r - emoji.color.r, 2) +
        Math.pow(target.g - emoji.color.g, 2) +
        Math.pow(target.b - emoji.color.b, 2),
    );
    if (distance < minimum) {
      result = `:${emoji.names[0]}:`;
      minimum = distance;
    }
  }
  return result;
}
