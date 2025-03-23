/**
 * Rollup compatibility layer for Vite
 * This provides the parseAst export that Vite is looking for
 */

// Mock implementation of the parseAst functionality
export function parseAst(code, options = {}) {
  return {
    type: 'Program',
    start: 0,
    end: code.length,
    body: [],
    sourceType: 'module'
  };
}

// Additional exports that might be needed
export default {
  parseAst
};
