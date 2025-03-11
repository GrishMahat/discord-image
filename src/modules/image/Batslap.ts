import {Jimp} from "jimp";
import { validateURL } from "../../utils/utils";
import { ImageInput } from "../../types";


export const Batslap = async   (image1: ImageInput, image2: ImageInput) :Promise<Buffer> => { 
    if (!image1) throw new Error("You must provide an image as a first argument.");
    const isValid1 = await validateURL(image1);
    if (!isValid1) throw new Error("You must provide a valid image URL or buffer.");
    if (!image2) throw new Error("You must provide an image as a second argument.");
    const isValid2 = await validateURL(image2);
    if (!isValid2) throw new Error("You must provide a valid image URL or buffer.");

    const base = await Jimp.read(`${__dirname}/../../assets/batslap.png`);
    const img1 = await Jimp.read(image1);
    const img2 = await Jimp.read(image2);

    img1.circle();
    img2.circle();
    base.resize({ w: 1000, h: 500 });
    img1.resize({ w: 220, h: 220 });
    img2.resize({ w: 200, h: 200 });

    base.composite(img2, 580, 260);
    base.composite(img1, 350, 70);

    return await base.getBuffer("image/png");
  }


