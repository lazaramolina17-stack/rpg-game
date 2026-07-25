#!/data/data/com.termux/files/usr/bin/bash
# Termux Environment Fixer
# Run this after `npm install` to fix shebangs and verify setup

set -e

echo "🔧 Termux Environment Fixer"
echo "=========================="
echo ""

# 1. Fix npm global config
echo "📦 Configuring npm for Termux..."
npm config set fetch-retries 10
npm config set fetch-retry-mintimeout 600000
npm config set fetch-retry-maxtimeout 600000
npm config set fetch-timeout 600000
npm config set maxsockets 1
npm config set legacy-peer-deps true
npm config set audit false
npm config set fund false
echo "   ✅ npm config updated"

# 2. Fix shebangs in node_modules
echo ""
echo "🔧 Fixing script shebangs..."
if [ -d "node_modules/.bin" ]; then
  termux-fix-shebang node_modules/.bin/* 2>/dev/null
  echo "   ✅ Shebangs fixed (node_modules/.bin)"
fi

# 3. Verify key tools
echo ""
echo "🔍 Verifying tools..."
export PATH="./node_modules/.bin:$PATH"

for tool in node npm vitest tsc tsx; do
  if command -v "$tool" &>/dev/null; then
    echo "   ✅ $tool: $($tool --version 2>&1 | head -1)"
  else
    echo "   ❌ $tool: not found"
  fi
done

# 4. Run tests
echo ""
echo "🧪 Running project tests..."
if [ -f "node_modules/vitest/vitest.mjs" ]; then
  node node_modules/vitest/vitest.mjs run 2>&1 | tail -5
  echo ""
  echo "   ✅ Tests complete"
else
  echo "   ⚠️  vitest not installed (run 'npm install' first)"
fi

echo ""
echo "✅ Environment ready"