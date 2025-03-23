type GlobPattern = string
import type { MinimizeOptions, PresetConfig } from './types'
import type { WebDocsConfig } from './fetchWebDocs'

export const presets: Record<string, PresetConfig> = {
	pocketbase: {
		title: 'PocketBase',
		type: 'web',
		baseUrl: 'https://pocketbase.io/docs/',
		urlPatterns: ['**/*', '!js-*', '!go-*', '!dart-*'],
		focusAreas: ['introduction', 'api', 'authentication', 'collections', 'records'],
		excludeAreas: ['going-to-production'],
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
		// Only match URLs that start with js-
		urlPatterns: ['js-*'],
		// Explicitly include only js- URLs to ensure proper filtering
		includeUrlPatterns: ['js-'],
		focusAreas: ['js-'],
		// Exclude any non-JS content
		excludeAreas: ['go-', 'dart-', 'introduction', 'authentication'],
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
		// Only match URLs that start with go-
		urlPatterns: ['go-*'],
		// Explicitly include only go- URLs to ensure proper filtering
		includeUrlPatterns: ['go-'],
		focusAreas: ['go-'],
		// Exclude any non-Go content
		excludeAreas: ['js-', 'dart-', 'introduction', 'authentication'],
		minimize: {
			removeCodeBlocks: false,
			removeSquareBrackets: false,
			removeParentheses: false,
			normalizeWhitespace: true,
			trim: true
		}
	},
	'pocketbase-dart': {
		title: 'PocketBase Dart',
		type: 'web',
		baseUrl: 'https://pocketbase.io/docs/',
		// Only match URLs that start with dart-
		urlPatterns: ['dart-*'],
		// Explicitly include only dart- URLs to ensure proper filtering
		includeUrlPatterns: ['dart-'],
		focusAreas: ['dart-'],
		// Exclude any non-Dart content
		excludeAreas: ['js-', 'go-', 'introduction', 'authentication'],
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
		urlPatterns: ['**/*'],
		focusAreas: ['introduction', 'directory-structure', 'structure', 'layouts', 'plugins', 'htmx'],
		minimize: {
			removeCodeBlocks: false,
			removeSquareBrackets: false,
			removeParentheses: false,
			normalizeWhitespace: true,
			trim: true
		}
	}
}
