# Installation Guide

This guide helps you install `discord-image-utils` and resolve common issues, especially canvas-related compilation problems.

## Quick Installation

```bash
# Using npm
npm install discord-image-utils

# Using yarn  
yarn add discord-image-utils

# Using pnpm
pnpm add discord-image-utils
```

## Canvas Dependencies

This library uses canvas for image processing. We support two canvas implementations:

### Option 1: @napi-rs/canvas (Recommended)

**Best for**: Modern Node.js versions (v16+), better performance, easier installation

```bash
npm install @napi-rs/canvas
```

**Advantages:**
- ✅ Works with Node.js v24+
- ✅ Better performance (Rust-based)
- ✅ No system dependencies required
- ✅ Faster installation
- ✅ Better memory management

### Option 2: node-canvas (Fallback)

**Best for**: Compatibility with older systems, specific use cases

```bash
npm install canvas
```

**Note:** This may require system dependencies and can have compilation issues with newer Node.js versions.

## System Requirements

### For @napi-rs/canvas (Recommended)
- Node.js 16+
- No additional system dependencies required

### For node-canvas (Fallback)
- Node.js 16+
- System dependencies vary by OS:

#### Ubuntu/Debian
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

#### CentOS/RHEL/Amazon Linux
```bash
sudo yum install gcc-c++ cairo-devel pango-devel libjpeg-turbo-devel giflib-devel
```

#### macOS
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

#### Windows
- Install [Windows Build Tools](https://github.com/felixrieseberg/windows-build-tools)
- Or use [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2019)

## Troubleshooting

### Issue: Canvas compilation failed with Node.js v24+

**Problem:** Getting errors like:
```
'const class v8::FunctionCallbackInfo<v8::Value>' has no member named 'Holder'
```

**Solution:** Use @napi-rs/canvas instead:
```bash
npm uninstall canvas
npm install @napi-rs/canvas
```

### Issue: "Cannot find module 'canvas'"

**Problem:** No canvas implementation installed

**Solution:** Install the recommended canvas implementation:
```bash
npm install @napi-rs/canvas
```

Or fallback to node-canvas:
```bash
npm install canvas
```

### Issue: "gyp ERR! build error" with node-canvas

**Problem:** System dependencies missing or incompatible

**Solutions:**
1. **Switch to @napi-rs/canvas** (recommended):
   ```bash
   npm uninstall canvas
   npm install @napi-rs/canvas
   ```

2. **Install system dependencies** (see System Requirements above)

3. **Use a different Node.js version:**
   ```bash
   # Use Node.js v20 LTS for better canvas compatibility
   nvm install 20
   nvm use 20
   npm install
   ```

### Issue: Memory or performance problems

**Solution:** Switch to @napi-rs/canvas for better performance:
```bash
npm install @napi-rs/canvas
```

### Issue: Dockerfile/Container builds failing

**Option 1: Use @napi-rs/canvas (recommended)**
```dockerfile
FROM node:20-alpine
# No additional dependencies needed for @napi-rs/canvas
COPY package*.json ./
RUN npm install
```

**Option 2: Use node-canvas with dependencies**
```dockerfile
FROM node:20-alpine
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

COPY package*.json ./
RUN npm install
```

## Verifying Installation

Create a test file to verify everything works:

```javascript
// test-canvas.js
const { createCanvas } = require('discord-image-utils');

async function test() {
  try {
    const canvas = createCanvas(200, 200);
    console.log('✅ Canvas working correctly!');
    console.log('Canvas size:', canvas.width, 'x', canvas.height);
  } catch (error) {
    console.error('❌ Canvas error:', error.message);
  }
}

test();
```

Run the test:
```bash
node test-canvas.js
```

## Environment-Specific Setup

### GitHub Actions
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '20'

- name: Install dependencies
  run: npm install @napi-rs/canvas
```

### Heroku
Add to your `package.json`:
```json
{
  "engines": {
    "node": "20.x"
  },
  "dependencies": {
    "@napi-rs/canvas": "^0.1.56"
  }
}
```

### Railway/Render
These platforms work well with @napi-rs/canvas out of the box.

### AWS Lambda
Use @napi-rs/canvas with a Node.js 20 runtime for best results.

## Performance Tips

1. **Use @napi-rs/canvas** for better performance
2. **Cache canvas instances** when possible
3. **Use appropriate Node.js version** (20 LTS recommended)
4. **Limit concurrent image processing** to avoid memory issues

## Getting Help

If you're still having issues:

1. **Check your Node.js version**: `node --version`
2. **Check installed packages**: `npm list canvas @napi-rs/canvas`
3. **Try the test script** above
4. **Report issues** with full error logs and system info

## Supported Combinations

| Node.js | @napi-rs/canvas | node-canvas | Status |
|---------|----------------|-------------|---------|
| v16     | ✅             | ✅          | Full support |
| v18     | ✅             | ✅          | Full support |
| v20     | ✅             | ✅          | Recommended |
| v22     | ✅             | ⚠️          | @napi-rs/canvas recommended |
| v24+    | ✅             | ❌          | Use @napi-rs/canvas only |

**Legend:**
- ✅ Fully supported
- ⚠️ May have issues
- ❌ Not supported/compilation errors