// Types
import type { RequestHandler } from './$types'

// Import environment variables if available
let BYPASS_TOKEN: string | undefined
try {
	// Try to import the bypass token if it exists
	BYPASS_TOKEN = process.env.BYPASS_TOKEN
} catch (e) {
	// If it doesn't exist, that's fine for development
	BYPASS_TOKEN = 'dev-token'
}

// Utils
import { error } from '@sveltejs/kit'
import { presets } from '$lib/presets'
import { getCachedOrFetchMarkdown } from '$lib/markdown'
import { dev } from '$app/environment'

export const GET: RequestHandler = async ({ params, url }) => {
	// Check if this is a download request
	const isDownload = url.searchParams.get('download') === 'true'
	const presetNames = params.preset.split(',').map((p) => p.trim())

	if (dev) {
		console.log(`Received request for presets: ${presetNames.join(', ')}`)
	}

	// Validate all preset names first
	const invalidPresets = presetNames.filter((name) => !(name in presets))
	if (invalidPresets.length > 0) {
		error(400, `Invalid preset(s): "${invalidPresets.join('", "')}"`)
	}

	try {
		// Fetch all contents in parallel
		const contentPromises = presetNames.map(async (presetName) => {
			if (dev) {
				console.time(`Fetching markdown for ${presetName}`)
			}

			const content = await getCachedOrFetchMarkdown(presets[presetName])

			if (dev) {
				console.timeEnd(`Fetching markdown for ${presetName}`)
				console.log(`Content length for ${presetName}: ${content.length}`)
			}

			if (content.length === 0) {
				throw new Error(`No content found for ${presetName}`)
			}

			// Add the prompt if it exists
			return presets[presetName].prompt
				? `${content}\n\nInstructions for LLMs: <SYSTEM>${presets[presetName].prompt}</SYSTEM>`
				: content
		})

		const contents = await Promise.all(contentPromises)

		// Join all contents with a delimiter
		const response = contents.join('\n\n---\n\n')

		if (dev) {
			console.log(`Final combined response length: ${response.length}`)
		}

		// Create appropriate headers based on whether this is a download or not
		const headers: HeadersInit = {
			'Content-Type': 'text/plain; charset=utf-8'
		}

		// If this is a download request, add the Content-Disposition header
		if (isDownload) {
			// Create a filename based on the preset names
			const filename = presetNames.join('-') + '.txt'
			headers['Content-Disposition'] = `attachment; filename="${filename}"`
		}

		return new Response(response, {
			status: 200,
			headers
		})
	} catch (e) {
		console.error(`Error fetching documentation for presets [${presetNames.join(', ')}]:`, e)
		error(500, `Failed to fetch documentation for presets "${presetNames.join(', ')}"`)
	}
}

export const config = {
	isr: {
		expiration: 3600,
		bypassToken: BYPASS_TOKEN || 'dev-token'
	}
}
