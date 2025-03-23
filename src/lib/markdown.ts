// Types
import type { PresetConfig } from './types'

// Utils
import { fetchAndProcessMarkdown } from '$lib/fetchMarkdown'
import { dev } from '$app/environment'

const ONE_DAY = 24 * 60 * 60 * 1000
const CACHE_DURATION = dev ? 0 : ONE_DAY

const cache: { [key: string]: { content: string; timestamp: number } } = {}

export async function getCachedOrFetchMarkdown(preset: PresetConfig): Promise<string> {
	// Create a unique cache key based on preset type and patterns
	let cacheKey: string;
	
	if (preset.type === 'github') {
		cacheKey = `github-${preset.owner}-${preset.repo}`;
	} else if (preset.type === 'web') {
		// For web presets, include the URL patterns in the cache key to ensure different presets
		// with the same baseUrl but different patterns get different cached content
		const patternsHash = JSON.stringify(preset.urlPatterns || []);
		cacheKey = `web-${preset.title}-${preset.baseUrl}-${patternsHash}`;
		
		// In development mode, always bypass cache
		if (dev) {
			cacheKey += `-${Date.now()}`;
		}
	} else {
		cacheKey = `preset-${preset.title}`;
	}
	
	if (dev) {
		console.log(`Cache key for ${preset.title}: ${cacheKey}`);
	}

	if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_DURATION) {
		if (dev) {
			console.log(`Using cached content for ${preset.title}`);
		}
		return cache[cacheKey].content;
	}

	if (dev) {
		console.log(`Fetching fresh content for ${preset.title}`);
	}
	
	const content = await fetchAndProcessMarkdown(preset);
	cache[cacheKey] = { content, timestamp: Date.now() };
	return content;
}
