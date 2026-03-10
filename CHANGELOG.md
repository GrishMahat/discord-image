# Changelog

## [0.1.6] - 2026-03-10
### Added
- New npm scripts for generation checks:
  - `test:gen-all`
  - `test:gen-all:fast`
  - `test:gen-all:full`
- Local TypeScript declarations for `gifenc` in `src/types/gifenc.d.ts`.
- Added preparatory TypeScript type definitions for a possible future gradient generator API in `src/types/index.ts`:
  - This is type scaffolding only for now and not a documented, stable feature.
- `generated/` added to `.gitignore`.

### Changed
- GIF stack migration from `gifencoder` to `gifenc` for `blink` and `triggered`.
- `blink` defaults and internals updated for faster generation:
  - Default size changed from `480x480` to `360x360`.
  - Input images are resolved once before frame generation.
  - Adaptive palette sizing and transparent color index handling added.
- `triggered` now uses `gifenc` frame writing and reduced quantization palette size for lower frame cost.
- `confusedStonk` rendering moved from Jimp compositing to canvas compositing with cached template loading.
- Rank/level card rendering was redesigned with a new modern layout shared across the default and futuristic HUD variants:
  - Added richer panel styling, glow treatments, stat cards, and a new progress bar renderer.
  - Background images now use cover rendering with improved overlays and vignette treatment.
- Core utility hardening and validation improvements:
  - `validateURL` now supports HTTPS/HTTP URLs, data URLs, local file paths, and strict image size checks.
  - `ErrorHandler`/error classes upgraded with safer serialization, improved wrapping, and richer metadata.
  - `ImageCache` redesigned with generics, input validation, LRU-style refresh, pruning, stats, and `getOrSet`.
  - `canvas-compat` now caches local template file buffers and normalizes source handling.
  - `paths` now sanitizes asset paths and blocks traversal outside assets.
  - `asset-validator` expanded (duplicate detection, typed error codes, sorted error output, extra font checks).
- Multiple modules refactored for stronger validation/error boundaries and consistent buffer checks:
  - Filters: `pixelate`, `wave`, `sticker`, `glitch`
  - GIF: `blink`, `triggered`
  - Image: `delete`, `doubleStonk`, `notStonk`, `confusedStonk`
  - Fun: `drake`, `distractedBoyfriend`, `welcomeCard`
  - Utils: `circle`, `color`, `denoise`, `mirror`
- Welcome card revamp:
  - Reworked the overall card layout and visual treatment across themes.
  - Fixed footer/body spacing and text-overflow collisions in long server and metadata values.
  - Replaced the fixed footer fields with customizable metadata labels and values for user-defined meta rows.
  - Added richer theme-specific welcome card outputs for previewing theme variations during generation checks.
  - Registered bundled Noto fonts for more consistent theme typography.
- Music card typography now registers bundled Noto and emoji fonts instead of relying on Arial/system defaults.

### Documentation
- `CONTRIBUTING.md` now documents the local build/lint/generation checks for PRs.
- `docs/ERROR_HANDLING.md` was rewritten to match the current exported error classes, helpers, and import paths.
- `docs/level-card-examples.md` rewritten to a shorter practical guide.

### Dependencies
- Added: `gifenc`.
- Removed: `gifencoder`, `@types/gifencoder`, and direct `canvas` dependency from `package.json`.

## [0.1.5] - 2025-12
### Added
- Party Hat Meme Generator: Overlay a colorful party hat on any avatar image
  - Simple one-parameter API: `partyHat(imageUrl)`
  - Automatic hat positioning at top-center of avatar
  - Returns PNG buffer ready for Discord attachment
  - (fix) path error

## [0.1.2]
  - WelcomeCard System
  - Dynamic welcome message generator with extensive customization options
  - Rich theme selection (Default, Dark, Light, Colorful, Minimal, Tech) with unique styling
  - Powerful Builder API for seamless customization
  - Advanced avatar system with glow effects, borders and caching
  - Flexible background options including custom images and preset patterns
  - Customizable member statistics display
  - Complete style control over fonts, borders, shadows and layout
  - Production-ready with full TypeScript support, error handling and validation

## [0.0.9] - 2025-04
### Added
  - level/Rankcard
    - Advanced layout system with multiple design options:
      - Futuristic HUD with hexagonal elements and glowing accents
      - Classic layout with rounded elements
      - Split, Ribbon, Diagonal, and Stacked layouts (placeholders)
    - Enhanced background pattern generation:
      - Theme-specific procedural backgrounds
      - Improved noise textures with multiple layers
      - Tech pattern with digital data flow
      - Glow pattern with neon elements
      - Aurora pattern with flowing waves
      - Geometric patterns with rays for sunset theme
  - Imported level module into the main index and updated distractedBoyfriend for improved variable handling
  - Enhanced validateURL function with special handling for Discord CDN errors

## [0.0.8] - 2025-03
### Added
 - sticker
 - glitch
 - distractedBoyfriend
### Fixed
 - URL redirect handling: Added support for HTTP redirects when fetching images

## [0.0.7] - 2025-03 - New Features
### Added
- Drake Meme Generator: Create Drake approval/disapproval memes with customizable text styling, font size, and colors
- Wave Distortion Filter: Apply configurable wave effects with amplitude (1-50) and frequency (1-20) controls for creative image manipulation
- Glitch Art Generator: Create artistic glitch effects with adjustable distortion levels, RGB shift, and scan line parameters

### [0.0.6] - 2025-02 - Image Generation Update
### Added
- Interactive Music Player Generator: Create dynamic music visualizations featuring:
  - Album artwork integration
  - Customizable progress bars
  - Animated playback controls
  - Real-time timestamps
  - Multiple theme options

- Professional Quote Image Creator: Design polished quote images with:
  - Rich typography options
  - Multiple background styles
  - Custom color schemes
  - Decorative elements and borders
  - Social media-optimized formats


## [0.0.5] - 2023-31 - Feature Update
### Added
- Delete Image Effect: New module for creating "Delete this" meme template

## [0.0.2] - 2025-3 - Feature Release
### Added
- Comprehensive Image Filter Suite
  - Blur: Adjustable gaussian blur effect
  - Pride: Rainbow overlay filter
  - Greyscale: Black and white conversion
  - Invert: Color inversion effect
  - Sepia: Vintage photo tone

- Dynamic Animations
  - Blink: Smooth blinking animation generator
  - Triggered: Classic "triggered" meme effect with shake and red overlay

- Advanced Meme Generation
  - Social Media Templates
    - Lisa Presentation: Custom text on Lisa Simpson template
    - Advertisement: Create mock advertisements
    - Heartbreaking News: Breaking news style meme

  - Character-Based Memes
    - Batman Slap: Classic Batman slapping Robin format
    - Bob Ross: Place images in Bob Ross painting
    - Hitler: Historical figure meme template

  - Reaction Memes
    - Affect: "This will affect my baby" format
    - Beautiful: Framed "beautiful" meme
    - Clown: Clown transformation template
    - Facepalm: Facepalm reaction image
    - Kiss: Generate kissing scene
    - Spank: Spanking meme template

  - Status Effects
    - Jail: Add jail bar overlay
    - RIP: Create memorial gravestone
    - Wanted: Generate wanted poster
    - Trash: "This is trash" meme

  - Stonks Series
    - Stonks: Original "stonks" meme
    - Not Stonks: Declining stonks variant
    - Double Stonks: Dual stonks format
    - Confused Stonks: Puzzled stonks version

  - Special Effects
    - Deep Fry: Deep fried meme effect
    - Snyder Cut: Snyder-style aspect ratio
    - Tattoo: Add tattoo overlay to images

## [0.0.1] - 2025-3 - Initial Release
### Added
- Core Framework Implementation
  - Modular architecture for image processing
  - Support for URL and Buffer inputs
  - Error handling and input validation
  - Basic image manipulation capabilities
