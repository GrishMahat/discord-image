# Discord Image Generation 
This package is a  reimplementation of [discord-image-generation](https://www.npmjs.com/package/discord-image-generation), enhanced with additional features . While inspired by the original package, it has been completely rewritten to provide better TypeScript support, improved performance, and compatibility .

# Discord Image Generation

A TypeScript library for generating and modifying images for use with Discord.js.

## Features

- Generate GIFs and static images
- Apply filters (blur, grayscale, sepia, invert, gay)
- Create animated effects (blink, triggered)
- Wide variety of meme generators and image manipulations:
  - Drake Meme Generator (NEW!)
  - Wave Effect Animation (NEW!)
  - Glitch Effect Filter (NEW!)
  - Sticker Effect Filter (NEW!)
  - Distracted Boyfriend Meme (NEW!)
  - Affect, Wanted, Kiss, Tatoo
  - Batslap, Ad, Beautiful, Bed
  - Clown, Hitler, Trash, Stonk/NotStonk
  - Spank, Snyder, RIP
  - Lisa Presentation, Jail
  - Heartbreaking, Facepalm
  - Double Stonk, Confused Stonk
  - Deepfry, Bob Ross
  - Music Player Image Generator
  - Quote Image Generator with Custom Styles
- Compatible with Discord.js v14+
- Highly customizable image handling

## Installation
```bash
# Using npm
npm install discord-image-utils

# Using yarn
yarn add discord-image-utils

# Using pnpm
pnpm add discord-image-utils
```

## Quick Start

```typescript
import { AttachmentBuilder } from 'discord.js';
import { blur, gay, triggered, wanted } from 'discord-image-utils';

// Example: Using in a Discord.js command
async function imageCommand(message, imageUrl) {
  try {
    // Apply a filter
    const blurredImage = await blur(5, imageUrl);
    const attachment = new AttachmentBuilder(blurredImage, { name: 'blurred.png' });
    await message.reply({ files: [attachment] });

    // Create a GIF
    const triggeredGif = await triggered(imageUrl);
    const gifAttachment = new AttachmentBuilder(triggeredGif, { name: 'triggered.gif' });
    await message.reply({ files: [gifAttachment] });
  } catch (error) {
    console.error('Error processing image:', error);
  }
}
```

## API Reference

### Filters

All filter functions return a Promise that resolves to a Buffer containing the modified image.

#### `blur(intensity: number, imageUrl: string): Promise<Buffer>`
Applies a Gaussian blur effect to the image.
- `intensity`: Blur intensity (1-20)
- `imageUrl`: URL or file path of the source image

#### `gay(imageUrl: string): Promise<Buffer>`
Applies a rainbow overlay effect.

#### `greyscale(imageUrl: string): Promise<Buffer>`
Converts the image to grayscale.

#### `invert(imageUrl: string): Promise<Buffer>`
Inverts the colors of the image.

#### `sepia(imageUrl: string): Promise<Buffer>`
Applies a sepia tone effect.

### GIF Generators

#### `blink(delay: number, imageUrl1: string, imageUrl2: string): Promise<Buffer>`
Creates a blinking effect between two images.
- `delay`: Time in milliseconds between frames
- `imageUrl1`: First image URL/path
- `imageUrl2`: Second image URL/path

#### `triggered(imageUrl: string): Promise<Buffer>`
Creates a "triggered" meme GIF.

### Image Manipulations

#### `wanted(imageUrl: string): Promise<Buffer>`
Creates a "wanted" poster with the image.

#### `kiss(image1Url: string, image2Url: string): Promise<Buffer>`
Creates a kissing scene with two images.

#### `Batslap(image1Url: string, image2Url: string): Promise<Buffer>`
Creates a Batman slapping meme with two images.

#### `stonk(imageUrl: string): Promise<Buffer>`
Creates a "stonks" meme with the image.

#### `notStonk(imageUrl: string): Promise<Buffer>`
Creates a "not stonks" meme with the image.

#### `lisaPresentation(text: string): Promise<Buffer>`
Creates a Lisa Simpson presentation meme with custom text.

## Advanced Usage


## Fun

### Drake Meme Generator

#### `drake(text1: string, text2: string, options?: DrakeOptions): Promise<Buffer>`
Creates a Drake meme with customizable text and styling.

Options:
```typescript
interface DrakeOptions {
  fontSize?: number;        // Text size (default: 32)
  textColor?: string;      // Text color (default: "#000000")
  bold?: boolean;          // Use bold text (default: true)
  maxWidth?: number;       // Max text width before wrapping (default: 300)
  padding?: number;        // Text padding from edges (default: 20)
}
```

Example:
```typescript
const drakeMeme = await drake(
  "Using complex code",
  "Using simple solutions",
  {
    fontSize: 36,
    textColor: "#333333",
    bold: true
  }
);
```

### Wave Effect

#### `wave(image: ImageInput, options?: WaveOptions): Promise<Buffer>`
Applies a wave distortion effect to an image.

Options:
```typescript
interface WaveOptions {
  amplitude?: number;     // Wave height (1-50, default: 10)
  frequency?: number;     // Wave frequency (1-20, default: 5)
  phase?: number;        // Wave phase (0-360, default: 0)
  direction?: "horizontal" | "vertical" | "both";  // Wave direction (default: "both")
}
```

Example:
```typescript
const wavedImage = await wave(imageUrl, {
  amplitude: 15,
  frequency: 8,
  direction: "horizontal"
});
```

### Glitch Effect

#### `glitch(image: ImageInput, intensity?: number): Promise<Buffer>`
Creates a digital glitch art effect with RGB channel shifts and visual corruption.

- `image`: URL or file path of the source image
- `intensity`: Glitch intensity (1-10, default: 5)

Example:
```typescript
const glitchedImage = await glitch(userAvatarUrl, 7);
```

### Sticker Effect

#### `sticker(image: ImageInput, borderSize?: number): Promise<Buffer>`
Applies a sticker effect with white border and drop shadow to an image.

- `image`: URL or file path of the source image
- `borderSize`: Size of the white border (5-50, default: 15)

Example:
```typescript
const stickerImage = await sticker(userAvatarUrl, 20);
```

### Music Image Generator

#### `Music(options: MusicImageOptions): Promise<Buffer>`
Creates a stylized music player image with album art and progress bar, perfect for Discord music bots and rich presence displays.

Options:
```typescript
interface MusicImageOptions {
  image: string;              // URL or path of album artwork
  title: string;              // Song title
  artist: string;             // Artist name
  time: {
    currentTime: number;      // Current playback time in seconds
    totalTime: number;        // Total song duration in seconds
  };
  progressBar?: {
    color?: string;           // Progress bar color (default: "#ffffff")
    backgroundColor?: string; // Background color (default: "#000000")
    width?: number;          // Bar width in pixels (default: 300)
    height?: number;         // Bar height in pixels (default: 10)
    rounded?: boolean;       // Rounded corners (default: true)
  };
  background?: {
    type?: "blur" | "gradient" | "solid";  // Background style
    color?: string;          // For solid background
    gradient?: string[];     // For gradient background
    blurAmount?: number;     // For blur background (1-20)
  };
  font?: {
    title?: string;         // Title font family
    artist?: string;        // Artist font family
    time?: string;          // Time font family
  };
}
```

Example:
```typescript
const musicCard = await Music({
  image: "https://example.com/album-art.jpg",
  title: "Never Gonna Give You Up",
  artist: "Rick Astley",
  time: {
    currentTime: 42,
    totalTime: 213
  },
  progressBar: {
    color: "#ff0000",
    backgroundColor: "#333333",
    rounded: true
  },
  background: {
    type: "gradient",
    gradient: ["#1e1e1e", "#2d2d2d"]
  }
});
```

### Quote Image Generator

#### `quote(options: QuoteOptions): Promise<Buffer>`
Creates beautifully styled quote images with customizable typography, backgrounds, and visual effects.

Options:
```typescript
interface QuoteOptions {
  quote: string;             // The quote text
  author?: string;           // Quote author (optional)
  style?: {
    theme?: "light" | "dark" | "minimal" | "elegant";
    fontFamily?: string;     // Custom font for quote text
    fontSize?: number;       // Base font size
    textAlign?: "left" | "center" | "right";
    padding?: number;        // Padding around text
  };
  background?: {
    type: "gradient" | "pattern" | "solid" | "image";
    gradient?: {
      type: "linear" | "radial";
      colors: string[];      // Array of color values
      angle?: number;        // For linear gradients (0-360)
    };
    pattern?: {
      type: "dots" | "lines" | "grid" | "waves" | "chevron";
      color?: string;
      opacity?: number;      // Pattern opacity (0-1)
      scale?: number;        // Pattern size multiplier
    };
    image?: string;         // URL for background image
    color?: string;         // For solid backgrounds
  };
  effects?: {
    shadow?: boolean;       // Text shadow effect
    glow?: boolean;        // Text glow effect
    blur?: number;         // Background blur amount
    vignette?: boolean;    // Vignette effect
    noise?: number;        // Noise overlay amount (0-1)
  };
  dimensions?: {
    width?: number;        // Output image width
    height?: number;       // Output image height
    aspectRatio?: string;  // Or use aspect ratio (e.g., "16:9")
  };
}
```

Example:
```typescript
const quoteImage = await quote({
  quote: "Be the change you wish to see in the world.",
  author: "Mahatma Gandhi",
  style: {
    theme: "elegant",
    fontFamily: "Playfair Display",
    textAlign: "center"
  },
  background: {
    type: "gradient",
    gradient: {
      type: "linear",
      colors: ["#2193b0", "#6dd5ed"],
      angle: 45
    }
  },
  effects: {
    shadow: true,
    glow: true,
    vignette: true
  },
  dimensions: {
    aspectRatio: "1:1"
  }
});
```

### Custom Options

Many functions accept an optional configuration object:

```typescript
interface ImageOptions {
  width?: number;      // Output width
  height?: number;     // Output height
  quality?: number;    // Image quality (1-100)
  format?: string;     // Output format ('png' | 'jpeg' | 'gif')
  background?: string; // Background color (CSS color string)
}

// Example with options
const customImage = await wanted(imageUrl, {
  width: 800,
  height: 600,
  quality: 90,
  format: 'png'
});
```

### Error Handling

```typescript
try {
  const image = await blur(5, imageUrl);
} catch (error) {
  if (error.message.includes('INVALID_URL')) {
    console.error('Invalid image URL provided');
  } else if (error.message.includes('UNSUPPORTED_FORMAT')) {
    console.error('Unsupported image format');
  } else {
    console.error('An error occurred:', error);
  }
}
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [GitHub Issues](https://github.com/GrishMahat/discord-image/issues) for existing problems/questions
2. Create a new issue if your problem hasn't been reported

## Acknowledgments

- Original inspiration from [discord-image-generation](https://www.npmjs.com/package/discord-image-generation)
- Built with [Canvas](https://www.npmjs.com/package/canvas) and [GIFEncoder](https://www.npmjs.com/package/gifencoder)
- Thanks to all contributors who have helped shape this project
