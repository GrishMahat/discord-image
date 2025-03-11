import { Jimp } from "jimp";
import { validateURL } from "../../utils/utils";
import { ImageInput } from "../../types";

/**
 * Creates a bed meme from two images
 * @param image1 - The first image URL or buffer to use
 * @param image2 - The second image URL or buffer to use  
 * @returns Promise<Buffer> - The generated bed meme image
 */
export const bed = async (image1: ImageInput, image2: ImageInput): Promise<Buffer> => {
  if (!image1) {
    throw new Error("You must provide an image as the first argument.");
  }

  const isValid1 = await validateURL(image1);
  if (!isValid1) {
    throw new Error("You must provide a valid image URL or buffer.");
  }

  if (!image2) {
    throw new Error("You must provide an image as the second argument.");
  }

  const isValid2 = await validateURL(image2);
  if (!isValid2) {
    throw new Error("You must provide a valid image URL or buffer.");
  }

  try {
    const bg = await Jimp.read(`${__dirname}/../../assets/bed.png`);
    const img1 = await Jimp.read(image1);
    const img2 = await Jimp.read(image2);

    img1.circle();
    img2.circle();
    img1.resize({ w: 100, h: 100 });
    img2.resize({ w: 70, h: 70 });
    
    const img3 = img1.clone().resize({ w: 70, h: 70 });

    bg.composite(img1, 25, 100);
    bg.composite(img1, 25, 300);
    bg.composite(img3, 53, 450);
    bg.composite(img2, 53, 575);

    return await bg.getBuffer("image/png");
  } catch (error) {
    throw new Error(`Failed to process image: ${error}`);
  }
};
