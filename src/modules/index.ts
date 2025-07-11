/** @format */

// Re-export modules organized by category for better tree-shaking

// Filters
export { blur } from "./filters/blur";
export { gay } from "./filters/gay";
export { greyscale } from "./filters/greyscale";
export { invert } from "./filters/invert";
export { sepia } from "./filters/sepia";
export { pixelate } from "./filters/pixelate";
export { wave } from "./filters/wave";
export { glitch } from "./filters/glitch";
export { sticker } from "./filters/sticker";

// GIFs
export { blink } from "./gif/blink";
export { triggered } from "./gif/triggered";

// Images
export { affect } from "./image/affect";
export { wanted } from "./image/wanted";
export { kiss } from "./image/kiss";
export { tatoo } from "./image/tatoo";
export { Batslap } from "./image/Batslap";
export { ad } from "./image/ad";
export { beautiful } from "./image/beautiful";
export { bed } from "./image/bed";
export { clown } from "./image/clown";
export { hitler } from "./image/hitler";
export { trash } from "./image/trash";
export { stonk } from "./image/stonk";
export { spank } from "./image/spank";
export { snyder } from "./image/snyder";
export { rip } from "./image/rip";
export { notStonk } from "./image/notStonk";
export { lisaPresentation } from "./image/lisaPresentation";
export { jail } from "./image/jail";
export { heartbreaking } from "./image/heartbreaking";
export { facepalm } from "./image/facepalm";
export { doubleStonk } from "./image/doubleStonk";
export { confusedStonk } from "./image/confusedStonk";
export { deepfry } from "./image/deepfry";
export { bobross } from "./image/bobross";
export { Delete } from "./image/delete";

// Fun/Utility
export { Music } from "./fun/music";
export { Quote } from "./fun/quote";
export { drake } from "./fun/drake";
export { distractedBoyfriend } from "./fun/distractedBoyfriend";
export { level } from "./fun/level";
export { welcomeCard, WelcomeCardBuilder } from "./fun/welcomeCard";

// Namespace exports for better organization
export * as filters from "./filters";
export * as gif from "./gif";
export * as image from "./image";
export * as fun from "./fun";