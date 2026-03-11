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
- `securityCamera(image, label?)`
- `snyder(image)`
- `stonk(image)`
- `tatoo(image)`
- `trash(image)`

### Fun

- `level(options)`
- `RankCard` as a compatibility alias of `level`
- `welcomeCard(options)`
- `WelcomeCardBuilder`
- `alwaysHasBeen({ planet?, reveal?, ...options })`
- `drake(text1, text2, options?)`
- `distractedBoyfriend(girlfriend, boyfriend, newGirl, options?)`
- `twoButtons(button1, button2, bottomText, options?)`
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

## Always Has Been Example

```ts
import { alwaysHasBeen } from "discord-image-utils";

const meme = await alwaysHasBeen({
  planet: { text: "Every browser is" },
  reveal: { text: "Chromium" },
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

## FAQ

### Why does this package exist, and why is it called `discord-image-utils`?

This project started as a reimplementation of `discord-image` because that package was no longer maintained and I needed something I could keep extending for my own Discord bot. That is why the name stayed close to the original idea. Even though it is Discord-focused, most of the generators are just general image utilities, meme templates, and card generators, so you can still use them in other backend projects if they fit your use case.

### Who is this for, and should I use this instead of a site like `imgflip.com`?

This package was originally built for me and my own bot. If you just want to make a meme quickly, a site like [imgflip.com](https://imgflip.com/) is probably easier than using this library. This package is more useful if you want to generate images programmatically inside a Node.js backend, especially for a bot or automated workflow.

### Is it production-ready, stable, and consistent?

It is workable, and I use it in production for my own Discord bot, but I would not describe it as a polished general-purpose library yet. A lot of the codebase is still rough. The project started handwritten, then I used AI for some parts in the middle, and in some places that actually made the code quality worse. There is too much duplication, too many inconsistent patterns, and the API shape is not fully standardized, which is why some generators are simple while others are object-based. Older templates also tend to be more polished than newer ones because they have been exercised in production for longer. The plan is to clean up and progressively rewrite the source for better readability, maintainability, and more user customization.

### Can I use this in the browser or frontend, and why do some generators return PNG while others return GIF?

Browser/frontend use is not really supported. This package is built around Node.js image generation and native canvas dependencies, so it fits backend use much better. If you need it for a web app, the practical setup is to generate images on the backend and return them to the frontend. As for output format, static generators return PNG and animated ones return GIF. In the future I want output formats and customization to be more flexible, but right now each generator mostly returns the format that fits its behavior.

### Will you add more memes or change the APIs?

Probably yes to both. If you want a new meme or image generator, open a GitHub issue and ask for it. If the idea fits the project and is not too degenerate, I will probably add it. The API surface will also likely change in a future major rewrite so things can become more consistent and easier to customize.

### What about performance, customization, copyright, and bug reports?

Performance depends on the generator, the input image sizes, whether remote images have to be fetched, and how much compositing or animation work is involved, so some outputs will naturally feel slower than others. Some generators already let you customize text placement or styling, while others do not yet because that work is still being centralized. I do not claim copyright ownership over all bundled image assets/templates used in this repository. If you are a copyright holder and want an asset removed, contact me and I will remove it. If you find a broken template, bad text alignment, or another issue, open a GitHub issue. Node `>=16` is supported.

## License

MIT
