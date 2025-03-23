import type { MinimizeOptions } from './types'
import { minimizeContent } from './fetchMarkdown'

export type WebDocsConfig = {
    /** The pretty title of the preset */
    title: string
    /** The base URL of the documentation */
    baseUrl: string
    /** List of URL patterns to include/exclude */
    urlPatterns: string[]
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

export async function fetchWebDocs(config: WebDocsConfig): Promise<string> {
    const { baseUrl, urlPatterns, minimize, title, focusAreas, excludeAreas, includeUrlPatterns } = config
    
    console.log('==============================================================');
    console.log(`Starting fetch for: ${title}`);
    console.log(`Config: includeUrlPatterns=${JSON.stringify(includeUrlPatterns)}, focusAreas=${JSON.stringify(focusAreas)}, excludeAreas=${JSON.stringify(excludeAreas)}`);
    console.log('==============================================================');
    
    // Start with appropriate seed URLs based on the preset type
    const visitedUrls = new Set<string>()
    let pendingUrls: string[] = [];
    const contents: string[] = []
    
    // To ensure we're getting distinct content, each preset needs specific starting points
    if (includeUrlPatterns && includeUrlPatterns.length > 0) {
        // Start by scanning the main page for SDK-specific links
        try {
            console.log(`Fetching main index page to find all ${title} documentation links`);
            const response = await fetch(baseUrl);
            if (response.ok) {
                const html = await response.text();
                const allLinks = extractLinks(html, baseUrl);
                
                // Discover all SDK-specific pages
                for (const link of allLinks) {
                    const relativePath = link.replace(baseUrl, '').toLowerCase();
                    for (const pattern of includeUrlPatterns) {
                        if (relativePath.startsWith(pattern.toLowerCase())) {
                            pendingUrls.push(link);
                            console.log(`Found SDK page: ${link}`);
                            break;
                        }
                    }
                }
                
                console.log(`Found ${pendingUrls.length} initial ${title} documentation links`);
                
                // If we didn't find any SDK pages, add a fallback
                if (pendingUrls.length === 0) {
                    pendingUrls = [`${baseUrl}${includeUrlPatterns[0]}`];
                    console.log(`No SDK pages found, using fallback: ${pendingUrls[0]}`);
                }
            }
        } catch (error) {
            console.error(`Error fetching main index: ${error}`);
            // Fallback to the first URL pattern
            pendingUrls = [`${baseUrl}${includeUrlPatterns[0]}`];
        }
    } else {
        // For general PocketBase, start with the main page
        pendingUrls = [baseUrl];
    }
    
    // Ensure we have distinct crawling behavior for each preset type
    
    // Maximum number of pages to crawl - reduced to prevent serverless function timeouts
    const maxPages = 25
    
    console.log(`Starting to crawl ${title} documentation from ${baseUrl}`)
    
    // Track page count
    let pageCount = 0
    
    // Timeout protection - ensure we don't exceed Vercel's function timeout
    const startTime = Date.now();
    const timeoutMs = 45000; // 45 seconds timeout to allow for response processing
    
    // Process pages in batches to improve efficiency
    const processBatch = async (url: string): Promise<void> => {
        if (visitedUrls.has(url)) {
            return;
        }
        
        // Check if we're approaching the timeout limit
        if (Date.now() - startTime > timeoutMs) {
            console.log('Approaching timeout limit, stopping crawl');
            return;
        }
        
        // Check if the URL matches the focus areas and doesn't match excluded areas
        const shouldProcess = shouldProcessUrl(url, baseUrl, focusAreas, excludeAreas, includeUrlPatterns);
        if (!shouldProcess) {
            console.log(`SKIPPING URL (filtered out): ${url}`);
            return;
        }
        
        console.log(`PROCESSING URL: ${url}`);
        visitedUrls.add(url);
        pageCount++;
        console.log(`Fetching ${url} (${pageCount}/${maxPages})`);
        
        try {
            const response = await fetch(url, {
                // Set a timeout for the fetch operation
                signal: AbortSignal.timeout(10000) // 10 second timeout per request
            });
            
            if (!response.ok) {
                console.error(`Failed to fetch ${url}: ${response.statusText}`);
                return;
            }
            
            const html = await response.text();
            
            // Extract and process content
            const pageContent = extractContentFromHtml(html);
            if (pageContent.trim()) {
                // Add the URL as a header to help organize content
                const contentWithHeader = `## Documentation: ${url.replace(baseUrl, '')}\n\n${pageContent}`;
                contents.push(contentWithHeader);
            }
            
            // Find more links to crawl
            const links = extractLinks(html, baseUrl);
            
            // Process only a limited number of links to avoid timeout
            const linksToProcess = [];
            
            // If we have focus areas, prioritize links that match those areas
            if (focusAreas && focusAreas.length > 0) {
                const prioritizedLinks = prioritizeLinks(links, baseUrl, focusAreas);
                for (const link of prioritizedLinks) {
                    if (!visitedUrls.has(link) && shouldCrawl(link, baseUrl, urlPatterns)) {
                        linksToProcess.push(link);
                    }
                }
            } else {
                for (const link of links) {
                    if (!visitedUrls.has(link) && shouldCrawl(link, baseUrl, urlPatterns)) {
                        linksToProcess.push(link);
                    }
                }
            }
            
            // Add limited number of discovered links to pending URLs
            for (const link of linksToProcess.slice(0, 5)) { // Only process up to 5 links per page
                pendingUrls.push(link);
            }
        } catch (error) {
            console.error(`Error processing ${url}:`, error);
        }
    };
    
    // Main crawling loop with timeout protection
    while (pendingUrls.length > 0 && pageCount < maxPages) {
        // Check if we're approaching the timeout limit
        if (Date.now() - startTime > timeoutMs) {
            console.log('Approaching timeout limit, stopping crawl');
            break;
        }
        
        const currentUrl = pendingUrls.shift()!;
        await processBatch(currentUrl);
    }
    
    console.log(`Crawled ${visitedUrls.size} pages from ${title} documentation`)
    
    // Combine all content
    let combinedContent = contents.join('\n\n')
    
    // No additional minimization needed
    
    // Apply standard minimization if specified
    if (minimize) {
        combinedContent = minimizeContent(combinedContent, minimize)
    }
    
    return combinedContent
}

/**
 * Extract meaningful content from HTML
 */
function extractContentFromHtml(html: string): string {
    // First, try to extract the main content area
    let mainContent = ''
    
    // For PocketBase docs, the main content is in the main element
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    if (mainMatch && mainMatch[1]) {
        mainContent = mainMatch[1]
    } else {
        // Fallback to the body content
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
        if (bodyMatch && bodyMatch[1]) {
            mainContent = bodyMatch[1]
        } else {
            mainContent = html
        }
    }
    
    // Try to extract article content if available
    const articleMatch = mainContent.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    if (articleMatch && articleMatch[1]) {
        mainContent = articleMatch[1]
    }
    
    // Clean up the content
    const cleanedContent = mainContent
        // Remove scripts
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove styles
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        // Remove comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Replace headers with markdown equivalent
        .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n')
        .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n')
        .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n')
        .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n')
        .replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '##### $1\n')
        .replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '###### $1\n')
        // Replace paragraphs
        .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
        // Replace lists
        .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n')
        .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '$1\n')
        .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
        // Replace code blocks
        .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n')
        .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
        // Replace links
        .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
        // Replace remaining HTML tags
        .replace(/<[^>]+>/g, '')
        // Replace HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        // Remove excessive whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    
    return cleanedContent
}

/**
 * Check if a URL should be processed based on focus and exclude areas
 */
function shouldProcessUrl(url: string, baseUrl: string, focusAreas?: string[], excludeAreas?: string[], includeUrlPatterns?: string[]): boolean {
    const relativePath = url.replace(baseUrl, '').toLowerCase();
    
    // First, check if the URL is explicitly excluded
    if (excludeAreas && excludeAreas.length > 0) {
        for (const excludeArea of excludeAreas) {
            if (relativePath.includes(excludeArea.toLowerCase())) {
                return false;
            }
        }
    }
    
    // If includeUrlPatterns is specified, the URL MUST match one of these patterns
    if (includeUrlPatterns && includeUrlPatterns.length > 0) {
        for (const pattern of includeUrlPatterns) {
            if (relativePath.startsWith(pattern.toLowerCase())) {
                return true;
            }
        }
        // If includeUrlPatterns is specified but none matched, exclude the URL
        return false;
    }
    
    // If no includeUrlPatterns but we have focusAreas, check those
    if (focusAreas && focusAreas.length > 0) {
        for (const focusArea of focusAreas) {
            if (relativePath.includes(focusArea.toLowerCase())) {
                console.log(`FOCUS match: URL ${relativePath} matches focusArea ${focusArea}`);
                return true;
            }
        }
        // If focusAreas is specified but none matched, exclude the URL
        console.log(`EXCLUDE: URL ${relativePath} doesn't match any focusAreas`);
        return false;
    }
    
    // If we have neither includeUrlPatterns nor focusAreas, include the URL
    return true
}

/**
 * Extract links from HTML
 */
function extractLinks(html: string, baseUrl: string): string[] {
    const links: string[] = []
    const regex = /<a[^>]*href=["']([^"'#]+)["'][^>]*>/gi
    let match
    
    while ((match = regex.exec(html)) !== null) {
        let href = match[1]
        
        // Skip external links, mailto, etc.
        if (href.startsWith('http') && !href.startsWith(baseUrl)) {
            continue
        }
        
        // Handle relative URLs
        if (!href.startsWith('http')) {
            if (href.startsWith('/')) {
                // Absolute path relative to domain
                const baseUrlObj = new URL(baseUrl)
                href = `${baseUrlObj.protocol}//${baseUrlObj.host}${href}`
            } else {
                // Relative path
                const currentUrlObj = new URL(baseUrl)
                href = new URL(href, currentUrlObj.href).href
            }
        }
        
        links.push(href)
    }
    
    return [...new Set(links)] // Remove duplicates
}

/**
 * Prioritize links based on focus areas or includeUrlPatterns
 */
function prioritizeLinks(links: string[], baseUrl: string, priorityPatterns?: string[]): string[] {
    // If no priority patterns are specified, use default important keywords
    const priorityKeywords = priorityPatterns || [
        'api', 'collections', 'authentication', 'records', 'realtime', 
        'files', 'users', 'admin', 'sdk', 'javascript', 'go', 'dart',
        'query', 'create', 'update', 'delete', 'getting-started', 'guide'
    ]
    
    // Sort links based on importance
    return links.sort((a, b) => {
        const aImportance = getImportanceScore(a, priorityKeywords, baseUrl)
        const bImportance = getImportanceScore(b, priorityKeywords, baseUrl)
        return bImportance - aImportance // Higher score first
    })
}

/**
 * Calculate importance score for a link
 */
function getImportanceScore(url: string, keywords: string[], baseUrl: string): number {
    const relativePath = url.replace(baseUrl, '')
    let score = 0
    
    // Higher score for shorter paths (likely more important/general docs)
    score += 5 - Math.min(relativePath.split('/').length, 5)
    
    // Check for important keywords
    for (const keyword of keywords) {
        if (relativePath.toLowerCase().includes(keyword)) {
            score += 3
        }
    }
    
    return score
}

/**
 * Determine if a URL should be crawled based on patterns
 */
function shouldCrawl(url: string, baseUrl: string, patterns: string[]): boolean {
    // Always crawl if it's under the base URL
    if (!url.startsWith(baseUrl)) {
        return false
    }
    
    // Skip common non-documentation files
    if (url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i)) {
        return false
    }
    
    // If no patterns specified, crawl all pages under the base URL
    if (!patterns || patterns.length === 0) {
        return true
    }
    
    // Check against patterns
    const relativePath = url.substring(baseUrl.length)
    console.log(`shouldCrawl checking ${relativePath} against patterns: ${JSON.stringify(patterns)}`)
    
    // First check for negated patterns - these take precedence
    for (const pattern of patterns) {
        if (pattern.startsWith('!')) {
            const matchPattern = pattern.slice(1)
            // Simple wildcard matching
            const regexPattern = matchPattern
                .replace(/\./g, '\\.')
                .replace(/\*/g, '.*')
            
            const matches = new RegExp(`^${regexPattern}$`).test(relativePath)
            
            if (matches) {
                console.log(`URL ${relativePath} negated by pattern ${pattern}`)
                return false
            }
        }
    }
    
    // Check for specific pattern matches
    const hasWildcardCatchAll = patterns.includes('**/*')
    
    // Check for specific matches first
    for (const pattern of patterns) {
        if (!pattern.startsWith('!')) {
            // Simple wildcard matching
            const regexPattern = pattern
                .replace(/\./g, '\\.')
                .replace(/\*/g, '.*')
            
            const matches = new RegExp(`^${regexPattern}$`).test(relativePath)
            
            if (matches) {
                console.log(`URL ${relativePath} matched pattern ${pattern}`)
                return true
            }
        }
    }
    
    // If we have a catch-all pattern and no specific patterns matched, allow it
    if (hasWildcardCatchAll) {
        console.log(`URL ${relativePath} allowed by catch-all wildcard pattern **/*`)
        return true
    }
    
    console.log(`URL ${relativePath} did not match any patterns, skipping`)
    return false
}
