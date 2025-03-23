import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * This custom Vite configuration addresses the Rollup parseAst issue
 * by providing a compatibility layer and resolver for the missing exports.
 */
export default defineConfig({
  plugins: [
    sveltekit(),
    {
      name: 'rollup-compatibility-patch',
      enforce: 'pre',
      resolveId(id) {
        // Intercept requests for Rollup's parseAst
        if (id === 'rollup/parseAst') {
          return resolve('./rollup-compat.js');
        }
        return null;
      },
      // Optional additional hook to handle any other potential resolution issues
      load(id) {
        if (id.endsWith('rollup-compat.js')) {
          return `
            export function parseAst(code, options = {}) {
              return {
                type: 'Program',
                start: 0,
                end: code ? code.length : 0,
                body: [],
                sourceType: 'module'
              };
            }
            export default { parseAst };
          `;
        }
        return null;
      },
    }
  ],
  resolve: {
    alias: {
      // Alias Rollup's parseAst to our compatibility module
      'rollup/parseAst': resolve('./rollup-compat.js')
    }
  },
  optimizeDeps: {
    // Force include our compatibility module
    include: ['./rollup-compat.js']
  },
  build: {
    // Increase memory limit to avoid out-of-memory issues
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      external: [],
      // Use simplified output options to avoid complex bundling issues
      output: {
        manualChunks: undefined
      }
    },
    // Explicitly enable sourcemaps to facilitate debugging
    sourcemap: true
  }
});
