# discord-image-utils

TypeScript utilities for generating Discord-ready images, GIFs, meme templates, welcome cards, and rank cards.

## Installation

```bash
npm install discord-image-utils
```

Node `>=16` is required. The package uses `@napi-rs/canvas`, so install in an environment that supports native packages.

## What You Can Pass As Image Input

Most APIs accept:

- HTTPS image URLs
- HTTP image URLs
- `Buffer`
- data URLs
- readable local file paths

All generators return `Promise<Buffer>`.

## Import Patterns

There are three import styles:

### 1. Root imports (recommended)

This is the simplest and most convenient option. You can import generators, errors, and types directly from the package root.

```ts
import {
  blur,
  wanted,
  welcomeCard,
  ValidationError,
  ImageProcessingError,
} from "discord-image-utils";

import type { ImageInput, WelcomeCardOptions } from "discord-image-utils";
```

### 2. Category imports

Use these if you want imports grouped by feature area.

```ts
import { blur, glitch } from "discord-image-utils/filters";
import { blink, triggered } from "discord-image-utils/gif";
import { wanted, kiss, deepfry } from "discord-image-utils/image";
import { level, WelcomeCardBuilder } from "discord-image-utils/fun";
```

### 3. Module namespaces

```ts
import { filters, gif, image, fun } from "discord-image-utils/modules";

const out = await filters.blur("./avatar.png", 6);
const card = await fun.welcomeCard({
  username: "grish",
  avatar: "./avatar.png",
});
```

You do not need `discord-image-utils/errors` or `discord-image-utils/types` for ordinary usage unless you specifically prefer those subpaths.

## Quick Start

```ts
import { AttachmentBuilder } from "discord.js";
import { blur, triggered, wanted } from "discord-image-utils";

async function makeAssets(image: string) {
  const blurred = await blur(image, 5);
  const trig = await triggered(image, 15);
  const poster = await wanted(image, "$", 500000);

  return [
    new AttachmentBuilder(blurred, { name: "blur.png" }),
    new AttachmentBuilder(trig, { name: "triggered.gif" }),
    new AttachmentBuilder(poster, { name: "wanted.png" }),
  ];
}
```

## API Surface

### Filters

- `blur(image, level = 10)`
- `gay(image)`
- `greyscale(image)`
- `invert(image)`
- `sepia(image)`
- `pixelate(image, pixelSize = 5)`
- `wave(image, amplitude = 10, frequency = 5)`
- `glitch(image, intensity = 5)`
- `sticker(image, borderSize = 15)`

### GIF

- `triggered(image, timeout = 15)`
- `blink(delay, optionsOrFirstImage?, ...images)`

`blink(...)` needs at least two images.

### Image Templates

- `wanted(image, currency = "$", amount?)`
- `affect(image1, image2)`
- `kiss(image1, image2)`
- `Batslap(image1, image2)`
- `spank(image1, image2)`
- `ad(image)`
- `beautiful(image)`
- `bed(image1, image2)`
- `bobross(image)`
- `clown(image)`
- `confusedStonk(image)`
- `deepfry(image)`
- `Delete(image)`
- `doubleStonk(image)`
- `facepalm(image)`
- `heartbreaking(image)`
- `hitler(image)`
- `jail(image)`
- `lisaPresentation(text)`
- `notStonk(image)`
- `partyHat(image)`
- `rip(image)`
- `snyder(image)`
- `stonk(image)`
- `tatoo(image)`
- `trash(image)`

### Fun

- `level(options)`
- `RankCard` as a compatibility alias of `level`
- `welcomeCard(options)`
- `WelcomeCardBuilder`
- `drake(text1, text2, options?)`
- `distractedBoyfriend(girlfriend, boyfriend, newGirl, options?)`
- `Music(options)`
- `Quote({ quote, author, gradient?, pattern? })`

## Rank Card Example

```ts
import { level } from "discord-image-utils";

const card = await level({
  name: "Commander",
  level: 42,
  avatar: "https://example.com/avatar.png",
  xp: 8750,
  maxXp: 10000,
  theme: "futuristic",
  layout: "futuristicHUD",
});
```

## Welcome Card Example

```ts
import { welcomeCard } from "discord-image-utils";

const card = await welcomeCard({
  username: "new-user",
  avatar: "https://example.com/avatar.png",
  servername: "My Server",
  theme: "tech",
  meta: [
    { label: "Role", value: "Member" },
    { label: "Joined", value: "Today" },
  ],
});
```

## Error Handling

```ts
import { blur, ValidationError, ImageProcessingError } from "discord-image-utils";

try {
  await blur("https://example.com/avatar.png", 8);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Invalid input", error.details);
  } else if (error instanceof ImageProcessingError) {
    console.error("Processing failed", error.details);
  }
}
```

## Development

```bash
pnpm run build
pnpm run lint
pnpm run test:gen-all
pnpm run test:gen-all:fast
pnpm run test:gen-all:full
```

`test:gen-all*` builds or exercises the exported generators and writes sample outputs to `generated/`.

## Docs

- [docs/ERROR_HANDLING.md](./docs/ERROR_HANDLING.md)
- [docs/TYPES_AND_MODULES.md](./docs/TYPES_AND_MODULES.md)
- [docs/level-card-examples.md](./docs/level-card-examples.md)
- [docs/welcome-card-examples.md](./docs/welcome-card-examples.md)

## License

MIT
