import { Jimp } from "jimp";
import { ImageInput } from "../../types";
import { validateURL } from "../../utils/utils";

export const deepfry = async (image: ImageInput): Promise<Buffer> => {
  if (!image) {
    throw new Error("Image is required");
  }
  const isValid = await validateURL(image);
  if (!isValid) {
    throw new Error("Invalid URL provided");
  }

  const img = await Jimp.read(image);
  img.resize({w: 100, h: 100});
  img.contrast(1);
  img.pixelate(2);
  img.posterize(10);
  return await img.getBuffer("image/png");
};