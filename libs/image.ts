import Jimp from "jimp";

/**
 * Signifies an automatic width or
 * height value when resizing an image.
 */
export const SIZE_AUTO = Jimp.AUTO;

/**
 * Opens an image from an URL,
 * resizes it and returns it.
 */
export async function open(url: string, w: number, h: number): Promise<Jimp> {
  return (await Jimp.read(url)).resize(w, h);
}

/**
 * Converts an integer color into
 * an RGBA color object.
 */
export function toRGBA(color: number): { r: number; g: number; b: number; a: number } {
  return Jimp.intToRGBA(color);
}

/**
 * Computes the average pixel color of an
 * image from an URL and returns it.
 */
export async function averageColor(url: string): Promise<{ r: number; g: number; b: number }> {
  const image = await open(url, 1, 1);
  const pixel = toRGBA(image.getPixelColor(0, 0));
  const alpha = pixel.a / 255;
  return {
    r: Math.round(pixel.r * alpha + 54 * (1 - alpha)),
    g: Math.round(pixel.g * alpha + 57 * (1 - alpha)),
    b: Math.round(pixel.b * alpha + 63 * (1 - alpha)),
  };
}
