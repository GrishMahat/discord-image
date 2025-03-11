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
};

export default dig;
