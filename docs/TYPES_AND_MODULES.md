# Types and Module Structure

This document outlines the comprehensive type system and improved module structure of `discord-image-utils`.

## Enhanced Types System

### Base Types

```typescript
import type { 
  ImageInput, 
  Color, 
  Position, 
  Dimensions, 
  Rectangle 
} from 'discord-image-utils/types';

// Core image input type - accepts URLs or buffers
type ImageInput = string | Buffer;

// Enhanced color type system
type Color = HexColor | RGBColor | RGBAColor | string;
type HexColor = `#${string}`;
type RGBColor = `rgb(${number}, ${number}, ${number})`;
type RGBAColor = `rgba(${number}, ${number}, ${number}, ${number})`;

// Position and dimension utilities
interface Position { x: number; y: number; }
interface Dimensions { width: number; height: number; }
interface Rectangle extends Position, Dimensions {}
```

### Filter Types

```typescript
import type { 
  FilterLevel, 
  FilterOptions, 
  BlurOptions, 
  PixelateOptions, 
  WaveOptions, 
  GlitchOptions 
} from 'discord-image-utils/types';

type FilterLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

interface BlurOptions extends FilterOptions {
  radius?: number;
  sigma?: number;
}

interface PixelateOptions extends FilterOptions {
  size?: number;
}

interface WaveOptions extends FilterOptions {
  amplitude?: number;
  frequency?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
}
```

### Welcome Card Types

```typescript
import type { 
  WelcomeTheme, 
  WelcomeCardOptions, 
  WelcomeCardCustomization 
} from 'discord-image-utils/types';

type WelcomeTheme = 'default' | 'dark' | 'light' | 'colorful' | 'minimal' | 'tech';

interface WelcomeCardOptions {
  username: string;
  avatar: ImageInput;
  servername?: string;
  memberCount?: number;
  background?: ImageInput;
  theme?: WelcomeTheme;
  message?: string;
  customization?: WelcomeCardCustomization;
}

interface WelcomeCardCustomization {
  textColor?: Color;
  borderColor?: Color;
  backgroundColor?: Color;
  avatarBorderColor?: Color;
  font?: string;
  fontSize?: number;
}
```

### GIF and Animation Types

```typescript
import type { 
  GifOptions, 
  TriggeredOptions, 
  BlinkOptions, 
  AnimationOptions 
} from 'discord-image-utils/types';

interface GifOptions {
  frameDelay?: number;
  quality?: number;
  frameCount?: number;
}

interface TriggeredOptions extends GifOptions {
  intensity?: FilterLevel;
}

interface AnimationOptions {
  duration?: number;
  fps?: number;
  loop?: boolean;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}
```

### Utility Types

```typescript
import type { 
  DeepPartial, 
  RequiredFields, 
  OptionalFields, 
  OperationResult 
} from 'discord-image-utils/types';

// Advanced TypeScript utility types
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Operation result wrapper
interface OperationResult<T = Buffer> {
  success: boolean;
  data?: T;
  error?: string;
  details?: ErrorDetails;
}
```

## Module Structure

### Improved Import Options

#### 1. Full Library Import (Traditional)
```typescript
import dig from 'discord-image-utils';
// or
import * as dig from 'discord-image-utils';

const blurredImage = await dig.blur(image, 5);
```

#### 2. Named Imports (Recommended)
```typescript
import { blur, wanted, WelcomeCardBuilder } from 'discord-image-utils';

const blurredImage = await blur(image, 5);
const wantedPoster = await wanted(avatar, '$', 50000);
```

#### 3. Category-Based Imports (Tree-shaking friendly)
```typescript
// Import specific categories
import { filters } from 'discord-image-utils/modules';
import { gif } from 'discord-image-utils/modules';
import { image } from 'discord-image-utils/modules';
import { fun } from 'discord-image-utils/modules';

const blurred = await filters.blur(image, 5);
const triggered = await gif.triggered(image);
```

#### 4. Direct Category Imports (Best for bundle size)
```typescript
// Import only the category you need
import { blur, greyscale, pixelate } from 'discord-image-utils/filters';
import { triggered, blink } from 'discord-image-utils/gif';
import { wanted, affect } from 'discord-image-utils/image';
import { welcomeCard, level } from 'discord-image-utils/fun';
```

#### 5. Types-Only Imports
```typescript
import type { 
  WelcomeCardOptions, 
  FilterLevel, 
  Color 
} from 'discord-image-utils/types';

import type { 
  ValidationError, 
  NetworkError 
} from 'discord-image-utils/errors';
```

### Module Categories

#### Filters (`discord-image-utils/filters`)
- `blur` - Apply blur effect
- `gay` - Apply rainbow filter
- `greyscale` - Convert to grayscale
- `invert` - Invert colors
- `sepia` - Apply sepia tone
- `pixelate` - Pixelate effect
- `wave` - Wave distortion
- `glitch` - Glitch effect
- `sticker` - Sticker effect

#### GIF (`discord-image-utils/gif`)
- `triggered` - Create triggered meme GIF
- `blink` - Create blinking GIF

#### Image (`discord-image-utils/image`)
- `wanted` - Generate wanted poster
- `affect` - Apply affect meme
- `kiss` - Kiss meme template
- `tatoo` - Tattoo effect
- `beautiful` - Beautiful meme
- `trash` - Trash meme
- `jail` - Jail bars effect
- And many more...

#### Fun (`discord-image-utils/fun`)
- `welcomeCard` - Generate welcome cards
- `WelcomeCardBuilder` - Builder pattern for welcome cards
- `level` / `RankCard` - Generate rank/level cards
- `Music` - Music now playing cards
- `Quote` - Quote image generation
- `drake` - Drake meme format

### Bundle Optimization Examples

#### For Discord Bots (Filters Only)
```typescript
// Only import what you need
import { blur, greyscale } from 'discord-image-utils/filters';

// Reduces bundle size significantly
```

#### For Welcome Systems
```typescript
// Import only welcome card functionality
import { 
  welcomeCard, 
  WelcomeCardBuilder,
  type WelcomeCardOptions 
} from 'discord-image-utils/fun';
```

#### For Meme Bots
```typescript
// Import image generation functions
import { 
  wanted, 
  triggered, 
  drake 
} from 'discord-image-utils';

// Or category-specific
import * as memes from 'discord-image-utils/image';
import * as gifs from 'discord-image-utils/gif';
```

## TypeScript Configuration

### Strict Mode Support
The library is built with strict TypeScript configuration and supports:
- Strict null checks
- No implicit any
- Exact optional property types
- Full type inference

### Type-Only Imports
```typescript
// Import types without importing runtime code
import type { 
  ImageInput,
  WelcomeCardOptions,
  FilterLevel,
  ValidationError
} from 'discord-image-utils';
```

## Error Handling Integration

```typescript
import { 
  blur,
  ValidationError,
  ImageProcessingError,
  NetworkError
} from 'discord-image-utils';

try {
  const result = await blur(image, level);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation errors with full type support
    console.log(`Field: ${error.details?.field}`);
  } else if (error instanceof ImageProcessingError) {
    // Handle processing errors
    console.log(`Operation: ${error.details?.operation}`);
  }
}
```

## Advanced Usage Patterns

### Generic Type Safety
```typescript
import type { OperationResult, ImageInput } from 'discord-image-utils/types';

function processImage<T extends ImageInput>(
  input: T,
  processor: (img: T) => Promise<Buffer>
): Promise<OperationResult<Buffer>> {
  // Fully typed processing function
}
```

### Builder Pattern with Types
```typescript
import { 
  WelcomeCardBuilder, 
  type WelcomeCardOptions 
} from 'discord-image-utils/fun';

const card = new WelcomeCardBuilder()
  .setUsername('User123')
  .setAvatar(avatarBuffer)
  .setTheme('dark')
  .setMemberCount(1337)
  .render(); // Returns Promise<Buffer> with full type safety
```

### Configuration Types
```typescript
import type { ModuleConfig } from 'discord-image-utils/types';
import { ErrorHandler } from 'discord-image-utils/errors';

const config: ModuleConfig = {
  logLevel: 'debug',
  defaultTimeout: 30000,
  maxRetries: 3,
  cacheEnabled: true
};

ErrorHandler.setLogLevel(config.logLevel);
```

## Migration Guide

### From v0.0.x to v0.1.x

#### Before:
```typescript
import dig from 'discord-image-utils';

// Limited type support
const result = await dig.blur(image, 5);
```

#### After:
```typescript
// Option 1: Enhanced default import
import dig from 'discord-image-utils';
const result = await dig.blur(image, 5); // Now with full types

// Option 2: Named imports (recommended)
import { blur } from 'discord-image-utils';
const result = await blur(image, 5);

// Option 3: Category imports (best for bundle size)
import { blur } from 'discord-image-utils/filters';
const result = await blur(image, 5);
```

## Best Practices

1. **Use category imports** for better tree-shaking
2. **Import types separately** when you only need type information
3. **Use the builder pattern** for complex configurations
4. **Handle specific error types** for better error recovery
5. **Configure logging levels** appropriately for your environment

The enhanced module structure provides maximum flexibility while maintaining backward compatibility and enabling optimal bundle sizes for different use cases.