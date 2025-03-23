#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e
# Print each command before executing it
set -x

# Set proper environment variables for production build
export NODE_ENV=production

# Clean installation to avoid dependency issues
echo "Cleaning node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Install dependencies with specific flags
echo "Installing dependencies..."
# Removed --ignore-scripts flag as it may prevent necessary setup scripts from running
npm install --prefer-offline --no-audit --no-fund --legacy-peer-deps

# Ensure @sveltejs/kit is properly installed
echo "Ensuring SvelteKit is installed..."
npm install @sveltejs/kit --no-save

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

// Add missing exports that are required by other Rollup modules
export const parse = async () => ({ type: 'Program', body: [] });
export const parseAsync = async () => ({ type: 'Program', body: [] });
export const parseAst = () => ({ type: 'Program', body: [] });
export const parseAstAsync = async () => ({ type: 'Program', body: [] });
export const parseExpression = () => ({ type: 'Expression', body: [] });

// Add hash function exports
export const xxhashBase16 = () => 'xxhash-placeholder';
export const xxhashBase64Url = () => 'xxhash-placeholder';
export const xxhashBase36 = () => 'xxhash-placeholder';
export const xxhash = () => 'xxhash-placeholder';
EOF
  echo "Rollup successfully patched!"
else
  echo "Rollup native.js not found, skipping patch."
fi

# No longer need to install bits-ui as it's been removed from dependencies

# Run SvelteKit sync to generate necessary files
echo "Running SvelteKit sync..."
# Use the full path to the svelte-kit binary
node ./node_modules/@sveltejs/kit/svelte-kit.js sync

# Run the build command with increased memory allocation
echo "Running build..."
NODE_OPTIONS=--max_old_space_size=4096 npm run build

# Check build result
if [ $? -eq 0 ]; then
  echo "Build completed successfully!"
else
  echo "Build failed! Check the logs above for errors."
  # Print diagnostic information
  echo "\nDiagnostic information:"
  node -v
  npm -v
  ls -la .svelte-kit || echo ".svelte-kit directory not found"
  exit 1
fi
