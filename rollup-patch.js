/**
 * This patch file is used to fix the Rollup dependency issue in Vercel deployments.
 * It replaces the problematic native.js file in the Rollup package with a version
 * that doesn't try to load platform-specific binaries.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Rollup native.js file
const nativeJsPath = path.resolve('./node_modules/rollup/dist/native.js');

// Check if the file exists
if (fs.existsSync(nativeJsPath)) {
  console.log('Patching Rollup native.js to fix deployment issues...');
  
  // Simple replacement that doesn't try to load platform-specific binaries
  const patchedContent = `
// Patched version that doesn't try to load platform-specific binaries
export const getDefaultOnwarn = () => () => {};
export const version = '4.9.1';
export const warnDeprecatedOptionValue = () => {};
export const createFilter = () => () => true;
export const rollup = null;
export const watch = null;
`;

  // Write the patched content to the file
  fs.writeFileSync(nativeJsPath, patchedContent);
  console.log('Rollup successfully patched!');
} else {
  console.log('Rollup native.js not found, skipping patch.');
}
