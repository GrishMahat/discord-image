# Discord Image Generation 
This package is a  recreation of [discord-image-generation](https://www.npmjs.com/package/discord-image-generation).

# Discord Image Generation

A TypeScript library for generating and modifying images for use with Discord.js.

## Features

- Generate GIFs and static images
- Apply filters (blur, grayscale, sepia, invert, etc.)
- Create animated effects
- Compatible with Discord.js v14+
- Highly customizable image handling

## Installation

```bash
npm install discord-image
```

## Requirements

- Node.js 16.0.0 or newer
- TypeScript 4.5.0 or newer

## Usage

```typescript
import { blur, blink, greyscale, invert, sepia } from 'discord-image-generation';
import { AttachmentBuilder } from 'discord.js';

// Example: Create a blurred image
async function createBlurredImage(imageUrl: string) {
  // Apply blur effect
  const blurredImage = await blur(5, imageUrl);
  
  // Create Discord.js attachment
  const attachment = new AttachmentBuilder(blurredImage, { name: 'blurred-image.png' });
  
  // Send in Discord message
  message.channel.send({ files: [attachment] });
}

// Example: Create a basic blinking GIF
async function createBasicBlinkGif(imageUrl1: string, imageUrl2: string) {
  // Create blinking effect between two images (300ms delay)
  const blinkGif = await blink(300, imageUrl1, imageUrl2);
  
  // Create Discord.js attachment
  const attachment = new AttachmentBuilder(blinkGif, { name: 'blink.gif' });
  
  // Send in Discord message
  message.channel.send({ files: [attachment] });
}

// Example: Create an advanced blinking GIF with options
async function createAdvancedBlinkGif(imageUrl1: string, imageUrl2: string) {
  // Create customized blinking effect
  const options = {
    width: 800,             // Width of output GIF (default: 480)
    height: 500,            // Height of output GIF (default: 480)
    quality: 5,             // Quality of GIF compression, 1-20 (default: 10, lower is better)
    repeat: 0,              // Number of times to repeat (0 = loop forever)
    transparent: '#FFFFFF', // Transparent color (default: 0 - black)
    fitMethod: 'contain'    // How to fit images: 'cover', 'contain', or 'stretch' (default: 'cover')
  };
  
  const blinkGif = await blink(300, options, imageUrl1, imageUrl2);
  
  // Create Discord.js attachment
  const attachment = new AttachmentBuilder(blinkGif, { name: 'custom-blink.gif' });
  
  // Send in Discord message
  message.channel.send({ files: [attachment] });
}
```

## API Reference

### GIF Functions

#### `blink(delay, [options], ...images)`

Creates a blinking GIF that cycles through multiple images.

- `delay` - Time in milliseconds between frames
- `options` (optional) - Configuration object:
  - `width` - Width of output GIF (default: 480)
  - `height` - Height of output GIF (default: 480)
  - `quality` - GIF compression quality, 1-20 (default: 10, lower is better)
  - `repeat` - Number of times to repeat animation (0 = loop forever)
  - `transparent` - Transparent color as string or number (default: 0 - black)
  - `fitMethod` - How to fit images: 'cover', 'contain', or 'stretch'
- `...images` - URLs or Buffer objects of images

Returns: `Promise<Buffer>` - Buffer containing the generated GIF

### Filter Functions

#### `blur(intensity, image)`
#### `greyscale(image)` 
#### `invert(image)`
#### `sepia(image)`
#### `gay(image)`

Each filter takes an image (URL or Buffer) and returns a `Promise<Buffer>`.

## Development

To set up this project for development:

```bash
# Clone the repository
git clone https://github.com/GrishMahat/discord-image-generation.git
cd discord-image-generation

# Install dependencies
npm install

# Start TypeScript compiler in watch mode
npm run dev

# Build for production
npm run build
```

## Contributing and Releases

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and package publishing. Releases are automatically triggered by commits to the main branch that follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

- `fix:` commits trigger a PATCH release (e.g., 1.0.0 → 1.0.1)
- `feat:` commits trigger a MINOR release (e.g., 1.0.0 → 1.1.0)
- `BREAKING CHANGE:` in the commit footer or a `!` after the type/scope triggers a MAJOR release (e.g., 1.0.0 → 2.0.0)

For more details on how to contribute, please see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT 