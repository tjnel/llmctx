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
			// Configure prerendering with a secure bypass token (64 characters)
			prerender: {
				bypassToken: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
			}
		})
	}
}

export default config
