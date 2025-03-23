#!/bin/bash
set -e

# Clean installation to avoid dependency issues
echo "Cleaning node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Install dependencies with specific flags to avoid Rollup issues
echo "Installing dependencies..."
npm install --no-optional --prefer-offline --no-audit --no-fund

# Apply the Rollup patch to fix dependency issues
echo "Applying Rollup patch..."
node rollup-patch.js

# Run the build command
echo "Running build..."
npm run build
