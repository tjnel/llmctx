import adapter from '@sveltejs/adapter-vercel'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// Use the Vercel adapter with minimal configuration
		adapter: adapter({
			runtime: 'nodejs20.x'
		})
	}
}

export default config
