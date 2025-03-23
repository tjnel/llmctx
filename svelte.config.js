import adapter from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// Use the Vercel adapter with explicit Node.js version and timeout settings
		adapter: adapter({
			runtime: 'nodejs20.x',
			// Set maximum function execution time to 60 seconds
			edgeConfig: {
				maxDuration: 60
			}
		})
	}
}

export default config
