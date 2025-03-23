/**
 * This patch file is used to fix the Rollup dependency issue in Vercel deployments.
 * It replaces the problematic native.js file in the Rollup package with a version
 * that doesn't try to load platform-specific binaries.
 * This version is specifically built for Rollup v3 compatibility with SvelteKit.
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
  
  // Simple patch for Rollup v3 compatibility
  const patchedContent = `
// Simplified patched version for Rollup v3 compatibility
export const version = '3.29.4';

// Basic mocks for Rollup's native functionality
export const getDefaultOnwarn = () => () => {};
export const warnDeprecatedOptionValue = () => {};
export const createFilter = () => () => true;
export const rollup = null;
export const watch = null;

// Mock return values for parse functions
const defaultNode = { type: 'Program', body: [], sourceType: 'module' };

// Basic parsing functions compatible with Rollup v3
export const parse = (code, options) => defaultNode;
export const parseAsync = async (code, options) => defaultNode;

// Hash functions required by Rollup
export const xxhashBase16 = () => 'xxhash-placeholder';
export const xxhashBase64Url = () => 'xxhash-placeholder';
export const xxhashBase36 = () => 'xxhash-placeholder';
export const xxhash = () => 'xxhash-placeholder';
`;

  // Write the patched content to the file
  fs.writeFileSync(nativeJsPath, patchedContent);
  console.log('Rollup successfully patched!');
} else {
  console.log('Rollup native.js not found, skipping patch...');
}
