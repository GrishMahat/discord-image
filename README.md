# Discord Image Generation 
This package is a  reimplementation of [discord-image-generation](https://www.npmjs.com/package/discord-image-generation), enhanced with additional features . While inspired by the original package, it has been completely rewritten to provide better TypeScript support, improved performance, and compatibility .

# Discord Image Generation

A TypeScript library for generating and modifying images for use with Discord.js.

## Features

- Generate GIFs and static images
- Apply filters (blur, grayscale, sepia, invert, gay)
- Create animated effects (blink, triggered)
- Wide variety of meme generators and image manipulations:
  - Affect, Wanted, Kiss, Tatoo
  - Batslap, Ad, Beautiful, Bed
  - Clown, Hitler, Trash, Stonk/NotStonk
  - Spank, Snyder, RIP
  - Lisa Presentation, Jail
  - Heartbreaking, Facepalm
  - Double Stonk, Confused Stonk
  - Deepfry, Bob Ross
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