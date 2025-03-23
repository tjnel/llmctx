type GlobPattern = string
import type { MinimizeOptions, PresetConfig } from './types'
import type { WebDocsConfig } from './fetchWebDocs'

export const presets: Record<string, PresetConfig> = {
	pocketbase: {
		title: 'PocketBase',
		type: 'web',
		baseUrl: 'https://pocketbase.io/docs/',
		urlPatterns: ['**/*', '!js-*', '!go-*'],
		focusAreas: ['introduction', 'api', 'authentication', 'collections', 'records'],
		excludeAreas: ['going-to-production', 'dart-'],
		minimize: {
			removeCodeBlocks: false,
			removeSquareBrackets: false,
			removeParentheses: false,
			normalizeWhitespace: true,
			trim: true
		}
	},
	'pocketbase-js': {
		title: 'PocketBase JavaScript',
		type: 'web',
		baseUrl: 'https://pocketbase.io/docs/',
		urlPatterns: ['js-*'],
		includeUrlPatterns: ['js-'],
		minimize: {
			removeCodeBlocks: false,
			removeSquareBrackets: false,
			removeParentheses: false,
			normalizeWhitespace: true,
			trim: true
		}
	},
	'pocketbase-go': {
		title: 'PocketBase Go',
		type: 'web',
		baseUrl: 'https://pocketbase.io/docs/',
		urlPatterns: ['go-*'],
		includeUrlPatterns: ['go-'],
		focusAreas: ['go-'],
		minimize: {
			removeCodeBlocks: false,
			removeSquareBrackets: false,
			removeParentheses: false,
			normalizeWhitespace: true,
			trim: true
		}
	},
	pocketpages: {
		title: 'PocketPages',
		type: 'web',
		baseUrl: 'https://pocketpages.dev/docs',
		urlPatterns: ['**/*.html'],
		minimize: {
			removeCodeBlocks: false,
			removeSquareBrackets: false,
			removeParentheses: false,
			normalizeWhitespace: true,
			trim: true
		}
	}
}
