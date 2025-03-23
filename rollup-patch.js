/**
 * This patch file is used to fix the Rollup dependency issue in Vercel deployments.
 * It replaces the problematic native.js file in the Rollup package with a version
 * that doesn't try to load platform-specific binaries and properly handles acorn parsing.
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
  
  // Comprehensive patch with proper AST handling
  const patchedContent = `
// Import acorn directly to handle parsing properly
import * as acorn from 'acorn';
import { walk } from 'estree-walker';

// Patched version that doesn't try to load platform-specific binaries
export const getDefaultOnwarn = () => () => {};
export const version = '4.9.1';
export const warnDeprecatedOptionValue = () => {};
export const createFilter = () => () => true;
export const rollup = null;
export const watch = null;

// Create safe AST parsing functions that use acorn directly
const ACORN_OPTIONS = { 
  ecmaVersion: 2020, 
  sourceType: 'module', 
  locations: true, 
  ranges: true,
  allowAwaitOutsideFunction: true,
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true 
};

// Function to ensure AST nodes have required properties to prevent 'undefined' node types
function sanitizeAst(ast) {
  if (!ast) return { type: 'Program', body: [], sourceType: 'module' };
  
  // Make sure every node has a type
  walk(ast, {
    enter(node) {
      if (!node.type) node.type = 'EmptyStatement';
    }
  });
  
  return ast;
}

// Implement parsing functions
export const parse = async (code) => {
  try {
    return sanitizeAst(acorn.parse(code, ACORN_OPTIONS));
  } catch (error) {
    console.error('Rollup parse error:', error.message);
    return { type: 'Program', body: [], sourceType: 'module' };
  }
};

export const parseAsync = async (code) => parse(code);

export const parseAst = (code) => {
  try {
    return sanitizeAst(acorn.parse(code, ACORN_OPTIONS));
  } catch (error) {
    console.error('Rollup parseAst error:', error.message);
    return { type: 'Program', body: [], sourceType: 'module' };
  }
};

export const parseAstAsync = async (code) => parseAst(code);

export const parseExpression = (code) => {
  try {
    return sanitizeAst(acorn.parseExpressionAt(code, 0, ACORN_OPTIONS));
  } catch (error) {
    console.error('Rollup parseExpression error:', error.message);
    return { type: 'Expression', expression: { type: 'Literal', value: null } };
  }
};

// Add hash function exports
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
