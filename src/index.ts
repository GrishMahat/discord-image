/** @format */

// filters
import { blur } from "./modules/filters/blur";
import { gay } from "./modules/filters/gay";
import { greyscale } from "./modules/filters/greyscale";
import { invert } from "./modules/filters/invert";
import { sepia } from "./modules/filters/sepia";

// gifs
import { blink } from "./modules/gif/blink";
import { triggered } from "./modules/gif/triggered";

// images
import { affect } from "./modules/image/affect";
import { wanted } from "./modules/image/wanted";
import { kiss } from "./modules/image/kiss";
import { tatoo } from "./modules/image/tatoo";
import { Batslap } from "./modules/image/Batslap";
import { ad } from "./modules/image/ad";
import { beautiful } from "./modules/image/beautiful";
import { bed } from "./modules/image/bed";
export {
  blur,
  gay,
  greyscale,
  invert,
  sepia,
  blink,
  triggered,
  affect,
  wanted,
  tatoo,
  kiss,
  Batslap,
  ad,
  beautiful,
  bed,
};

// Group everything into an object and export as default
const dig = {
  blur,
  gay,
  greyscale,
  invert,
  sepia,
  blink,
  triggered,
  affect,
  wanted,
  tatoo,
  kiss,
  Batslap,
  ad,
  beautiful,
  bed,
};

export default dig;
