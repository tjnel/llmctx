import adapter from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// Completely disable prerendering
		prerender: {
			enabled: false
		},
		
		// Use the Vercel adapter with minimal configuration
		adapter: adapter({
			runtime: 'nodejs18.x',
			// Explicitly disable adapter-level prerendering
			prerender: {
				enabled: false
			}
		})
	}
}

export default config
