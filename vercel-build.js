// vercel-build.js
// This script will be run during the Vercel build process
// to set required environment variables and bypass token

// Set a long bypass token for prerendering
process.env.BYPASS_TOKEN = 'c6a07c8e9ad8b8f0e6a5c5f4d3b2a1e0d9c8b7a6d5e4f3c2b1a0p1o2i3u4y5t6r7e8w9q0';

// Run the actual build process
const { execSync } = require('child_process');
console.log('Running custom Vercel build script...');

// Execute the normal build process with the environment variables set
try {
  execSync('npm run prebuild && npm run build:original', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
