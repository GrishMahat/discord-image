import { Jimp } from "jimp";
import { validateURL } from "../../utils/utils";
import { ImageInput } from "../../types";

/**
 * Add a jail image to an image
 * @param image - The image URL or buffer to add the jail image to
 * @returns Buffer containing the processed image
 */
export const jail = async (image: ImageInput): Promise<Buffer> => {
  if (!image) {
    throw new Error("Image is required");
  }

  const isValid = await validateURL(image);
  if (!isValid) {
    throw new Error("Invalid URL provided");
  }

  const bg = await Jimp.read(`${__dirname}/../../assets/jail.png`);
  const img = await Jimp.read(image);
  const compositeImage = new Jimp({
    width: 400,
    height: 400,
    color: 0xffffffff,
  });
  img.resize({ w: 400, h: 400 });
  bg.resize({ w: 400, h: 400 });
  compositeImage.composite(img, 0, 0);
  compositeImage.composite(bg, 0, 0);
  return await compositeImage.getBuffer("image/png");
};
