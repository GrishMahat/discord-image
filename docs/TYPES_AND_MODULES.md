# Types and Module Structure

This guide reflects the package exports that exist today.

## Import Paths

There are three practical import styles.

### 1. Root imports

This is the primary and most convenient option. The root export already includes generators, error classes, and exported types.

```ts
import {
  blur,
  welcomeCard,
  ValidationError,
  ErrorHandler,
} from "discord-image-utils";

import type { ImageInput, WelcomeCardOptions } from "discord-image-utils";
```

### 2. Category imports

```ts
import { blur, glitch } from "discord-image-utils/filters";
import { blink, triggered } from "discord-image-utils/gif";
import { wanted, deepfry } from "discord-image-utils/image";
import { level, WelcomeCardBuilder } from "discord-image-utils/fun";
```

### 3. Module namespaces

```ts
import { filters, gif, image, fun } from "discord-image-utils/modules";
```

`discord-image-utils/modules` exports grouped namespaces and also re-exports the same named functions.

The `./errors` and `./types` subpaths still work, but they are optional, not required.

## Core Types

These are exported from the root package and from `discord-image-utils/types`.

### Image and color types

```ts
import type {
  ImageInput,
  Color,
  HexColor,
  RGBColor,
  RGBAColor,
} from "discord-image-utils/types";
```

`ImageInput` is typed as `string | Buffer`. At runtime, the library accepts:

- URL strings
- data URL strings
- local file paths
- `Buffer`

### Shared geometry and utility types

```ts
import type {
  Position,
  Dimensions,
  Rectangle,
  DeepPartial,
  RequiredFields,
} from "discord-image-utils/types";
```

### Feature-specific types

```ts
import type {
  WelcomeTheme,
  WelcomeCardOptions,
  WelcomeCardMetaItem,
  WelcomeCardCustomization,
  MusicImageOptions,
  QuoteResponse,
  GifOptions,
  BlinkOptions,
  TriggeredOptions,
  BlurOptions,
  PixelateOptions,
  WaveOptions,
  GlitchOptions,
} from "discord-image-utils/types";
```

## Important Note About `level(...)`

The exported type file includes `LevelCardOptions`, but the current `level(...)` helper supports a richer runtime object shaped around fields such as:

- `name`
- `level`
- `avatar`
- `xp`
- `maxXp`
- `theme`
- `layout`
- `nextLevelXp`
- `levelUpXp`

If you are calling `level(...)`, prefer following the examples in [docs/level-card-examples.md](./level-card-examples.md) and the function signature in the generated typings for your installed package version.

## Error Exports

These are available from the root package and from `discord-image-utils/errors`:

```ts
import {
  DiscordImageError,
  ValidationError,
  NetworkError,
  ImageProcessingError,
  FileSystemError,
  ConfigurationError,
  TimeoutError,
  ErrorHandler,
  RetryHandler,
} from "discord-image-utils";
```

## Module Groups

### `discord-image-utils/filters`

- `blur`
- `gay`
- `greyscale`
- `invert`
- `sepia`
- `pixelate`
- `wave`
- `glitch`
- `sticker`

### `discord-image-utils/gif`

- `blink`
- `triggered`

### `discord-image-utils/image`

- `ad`
- `affect`
- `Batslap`
- `beautiful`
- `bed`
- `bobross`
- `clown`
- `confusedStonk`
- `deepfry`
- `Delete`
- `doubleStonk`
- `facepalm`
- `heartbreaking`
- `hitler`
- `jail`
- `kiss`
- `lisaPresentation`
- `notStonk`
- `partyHat`
- `rip`
- `snyder`
- `spank`
- `stonk`
- `tatoo`
- `trash`
- `wanted`

### `discord-image-utils/fun`

- `distractedBoyfriend`
- `drake`
- `level`
- `Music`
- `Quote`
- `welcomeCard`
- `WelcomeCardBuilder`

## Example

```ts
import { filters, fun } from "discord-image-utils/modules";

const blurred = await filters.blur("./avatar.png", 5);
const welcome = await fun.welcomeCard({
  username: "grish",
  avatar: "./avatar.png",
  theme: "tech",
});
```
