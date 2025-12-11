/** @format */

// filters
import { blur } from "./modules/filters/blur";
import { gay } from "./modules/filters/gay";
import { glitch } from "./modules/filters/glitch";
import { greyscale } from "./modules/filters/greyscale";
import { invert } from "./modules/filters/invert";
import { pixelate } from "./modules/filters/pixelate";
import { sepia } from "./modules/filters/sepia";
import { sticker } from "./modules/filters/sticker";
import { wave } from "./modules/filters/wave";
import { distractedBoyfriend } from "./modules/fun/distractedBoyfriend";
import { drake } from "./modules/fun/drake";
import { level } from "./modules/fun/level";
// fun
import { Music } from "./modules/fun/music";
import { Quote } from "./modules/fun/quote";
import {
	WelcomeCardBuilder,
	WelcomeCardOptions,
	WelcomeTheme,
	welcomeCard,
} from "./modules/fun/welcomeCard";
// gifs
import { blink } from "./modules/gif/blink";
import { triggered } from "./modules/gif/triggered";
import { ad } from "./modules/image/ad";
// images
import { affect } from "./modules/image/affect";
import { Batslap } from "./modules/image/Batslap";
import { beautiful } from "./modules/image/beautiful";
import { bed } from "./modules/image/bed";
import { bobross } from "./modules/image/bobross";
import { clown } from "./modules/image/clown";
import { confusedStonk } from "./modules/image/confusedStonk";
import { deepfry } from "./modules/image/deepfry";
import { Delete } from "./modules/image/delete";
import { doubleStonk } from "./modules/image/doubleStonk";
import { facepalm } from "./modules/image/facepalm";
import { heartbreaking } from "./modules/image/heartbreaking";
import { hitler } from "./modules/image/hitler";
import { jail } from "./modules/image/jail";
import { kiss } from "./modules/image/kiss";
import { lisaPresentation } from "./modules/image/lisaPresentation";
import { notStonk } from "./modules/image/notStonk";
import { partyHat } from "./modules/image/partyHat";
import { rip } from "./modules/image/rip";
import { snyder } from "./modules/image/snyder";
import { spank } from "./modules/image/spank";
import { stonk } from "./modules/image/stonk";
import { tatoo } from "./modules/image/tatoo";
import { trash } from "./modules/image/trash";
import { wanted } from "./modules/image/wanted";
// asset validation
import {
	assertAssets,
	getRegisteredAssets,
	validateAssets,
} from "./utils/asset-validator";
// error handling
import {
	ConfigurationError,
	DiscordImageError,
	ErrorHandler,
	FileSystemError,
	ImageProcessingError,
	NetworkError,
	RetryHandler,
	TimeoutError,
	ValidationError,
} from "./utils/errors";

// types
export * from "./types";

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
	partyHat,
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
	validateAssets,
	assertAssets,
	getRegisteredAssets,
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
	partyHat,
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
