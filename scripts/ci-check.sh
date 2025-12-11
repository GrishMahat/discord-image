#!/bin/bash
# CI check script to enforce code standards

set -e

echo "🔍 Running CI checks..."
echo ""

# 1. Check for banned __dirname patterns in modules
echo "📋 CHECK 1: Banned __dirname patterns"
if grep -r '\${__dirname}' src/modules/ --include="*.ts" 2>/dev/null; then
    echo "❌ FAIL: Found \${__dirname} pattern. Use getAssetPath() instead."
    exit 1
fi
if grep -r 'join(__dirname' src/modules/ --include="*.ts" 2>/dev/null; then
    echo "❌ FAIL: Found join(__dirname) pattern. Use getAssetPath() instead."
    exit 1
fi
echo "✅ No banned path patterns found"
echo ""

# 2. Check for console.log in production code
echo "📋 CHECK 2: console.log statements"
if grep -r 'console\.log' src/modules/ --include="*.ts" 2>/dev/null | grep -v 'console.warn' | grep -v 'console.error'; then
    echo "⚠️  WARNING: Found console.log statements in modules"
fi
echo "✅ Console.log check complete"
echo ""

# 3. Check for toBuffer() without mime type
echo "📋 CHECK 3: toBuffer() without mime type"
if grep -r '\.toBuffer()' src/modules/ --include="*.ts" 2>/dev/null; then
    echo "❌ FAIL: Found toBuffer() without mime type. Use toBuffer('image/png')."
    exit 1
fi
echo "✅ All toBuffer calls have mime type"
echo ""

# 4. Validate assets exist
echo "📋 CHECK 4: Asset validation"
ASSETS_DIR="src/assets"
REQUIRED_ASSETS=(
    "drake.jpeg"
    "wanted.png"
    "stonk.png"
    "triggered.png"
    "jail.png"
    "lisa-presentation.png"
    "fonts/Noto-Regular.ttf"
)
for asset in "${REQUIRED_ASSETS[@]}"; do
    if [ ! -f "$ASSETS_DIR/$asset" ]; then
        echo "❌ FAIL: Missing required asset: $asset"
        exit 1
    fi
done
echo "✅ All required assets present"
echo ""

# 5. TypeScript compilation
echo "📋 CHECK 5: TypeScript compilation"
pnpm run build
echo "✅ Build successful"
echo ""

# 6. Lint check
echo "📋 CHECK 6: Lint check"
pnpm run lint
echo "✅ Lint passed"
echo ""

echo "🎉 All CI checks passed!"
