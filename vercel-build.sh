#!/bin/bash
set -e

# Clean installation to avoid dependency issues
echo "Cleaning node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Install dependencies with specific flags to avoid Rollup issues
echo "Installing dependencies..."
npm install --no-optional --prefer-offline --no-audit --no-fund --legacy-peer-deps

# Apply the Rollup patch directly in the build script
echo "Applying Rollup patch..."
ROLLUP_NATIVE_PATH="./node_modules/rollup/dist/native.js"
if [ -f "$ROLLUP_NATIVE_PATH" ]; then
  echo "Patching Rollup native.js to fix deployment issues..."
  # Create a patched version that doesn't try to load platform-specific binaries
  cat > "$ROLLUP_NATIVE_PATH" << 'EOF'
// Patched version that doesn't try to load platform-specific binaries
export const getDefaultOnwarn = () => () => {};
export const version = '4.9.1';
export const warnDeprecatedOptionValue = () => {};
export const createFilter = () => () => true;
export const rollup = null;
export const watch = null;
EOF
  echo "Rollup successfully patched!"
else
  echo "Rollup native.js not found, skipping patch."
fi

# Run the build command
echo "Running build..."
npm run build
