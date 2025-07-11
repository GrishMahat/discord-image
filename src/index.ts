/** @format */

// filters
import { blur } from "./modules/filters/blur";
import { gay } from "./modules/filters/gay";
import { greyscale } from "./modules/filters/greyscale";
import { invert } from "./modules/filters/invert";
import { sepia } from "./modules/filters/sepia";
import { pixelate } from "./modules/filters/pixelate";
import { wave } from "./modules/filters/wave";
import { glitch } from "./modules/filters/glitch";
import { sticker } from "./modules/filters/sticker";

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
import { clown } from "./modules/image/clown";
import { hitler } from "./modules/image/hitler";
import { trash } from "./modules/image/trash";
import { stonk } from "./modules/image/stonk";
import { spank } from "./modules/image/spank";
import { snyder } from "./modules/image/snyder";
import { rip } from "./modules/image/rip";
import { notStonk } from "./modules/image/notStonk";
import { lisaPresentation } from "./modules/image/lisaPresentation";
import { jail } from "./modules/image/jail";
import { heartbreaking } from "./modules/image/heartbreaking";
import { facepalm } from "./modules/image/facepalm";
import { doubleStonk } from "./modules/image/doubleStonk";
import { confusedStonk } from "./modules/image/confusedStonk";
import { deepfry } from "./modules/image/deepfry";
import { bobross } from "./modules/image/bobross";
import { Delete } from "./modules/image/delete";

// fun
import { Music } from "./modules/fun/music";
import { Quote } from "./modules/fun/quote";
import { drake } from "./modules/fun/drake";
import { distractedBoyfriend } from "./modules/fun/distractedBoyfriend";
import { level } from "./modules/fun/level";
import { welcomeCard, WelcomeCardBuilder, WelcomeCardOptions, WelcomeTheme } from "./modules/fun/welcomeCard";

// error handling
import { 
  DiscordImageError, 
  ValidationError, 
  NetworkError, 
  ImageProcessingError, 
  FileSystemError, 
  ConfigurationError, 
  TimeoutError, 
  ErrorHandler, 
  RetryHandler 
} from "./utils/errors";

// Export individual functions
export {
  blur,
  gay,
  greyscale,
  invert,
  sepia,
  pixelate,
  wave,
  glitch,
  sticker,
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
  clown,
  hitler,
  trash,
  stonk,
  spank,
  snyder,
  rip,
  notStonk,
  lisaPresentation,
  jail,
  heartbreaking,
  facepalm,
  doubleStonk,
  confusedStonk,
  deepfry,
  bobross,
  Delete,
  Music,
  Quote,
  drake,
  distractedBoyfriend,
  level,
  welcomeCard,
  WelcomeCardBuilder,
  WelcomeCardOptions,
  WelcomeTheme,
  DiscordImageError,
  ValidationError,
  NetworkError,
  ImageProcessingError,
  FileSystemError,
  ConfigurationError,
  TimeoutError,
  ErrorHandler,
  RetryHandler,
};

// Export level as RankCard
export { level as RankCard };

// Group everything into an object and export as default
const dig = {
  blur,
  gay,
  greyscale,
  invert,
  sepia,
  pixelate,
  wave,
  glitch,
  sticker,
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
  clown,
  hitler,
  trash,
  stonk,
  spank,
  snyder,
  rip,
  notStonk,
  lisaPresentation,
  jail,
  heartbreaking,
  facepalm,
  doubleStonk,
  confusedStonk,
  deepfry,
  bobross,
  Delete,
  Music,
  Quote,
  drake,
  distractedBoyfriend,
  level,
  RankCard: level,
  welcomeCard,
  WelcomeCardBuilder,
  DiscordImageError,
  ValidationError,
  NetworkError,
  ImageProcessingError,
  FileSystemError,
  ConfigurationError,
  TimeoutError,
  ErrorHandler,
  RetryHandler,
};

export default dig;
