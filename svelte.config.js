import adapter from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			// Explicitly specify Node.js 18 as the runtime
			runtime: 'nodejs18.x',
			// Set bypassToken for prerender validation
			bypassToken: 'c6a07c8e9ad8b8f0e6a5c5f4d3b2a1e0d9c8b7a6d5e4f3c2b1a0p1o2i3u4y5t6r7e8w9q0'
		})
	}
}

export default config
