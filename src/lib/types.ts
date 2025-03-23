export interface MinimizeOptions {
    normalizeWhitespace: boolean
    removeCodeBlocks: boolean
    removeSquareBrackets: boolean
    removeParentheses: boolean
    trim: boolean
}

export interface PresetConfig {
    /** The pretty title of the preset */
    title: string
    /** The source type of the documentation */
    type: 'github' | 'web'
    /** The owner of the GitHub repository (for GitHub type) */
    owner?: string
    /** The name of the GitHub repository (for GitHub type) */
    repo?: string
    /** List of glob patterns for including and excluding files (for GitHub type) */
    glob?: string[]
    /** Base URL for web documentation (for web type) */
    baseUrl?: string
    /** URL patterns for web documentation (for web type) */
    urlPatterns?: string[]
    /** Specific URL patterns that must be included */
    includeUrlPatterns?: string[]
    /** Areas to focus on when crawling documentation */
    focusAreas?: string[]
    /** Areas to exclude when crawling documentation */
    excludeAreas?: string[]
    /** Optional prompt to provide additional context or instructions to language models */
    prompt?: string
    /** Minimization options for the content */
    minimize?: MinimizeOptions
}
