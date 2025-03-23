// Types
import type { RequestHandler } from './$types'

// Env - Use try/catch to handle missing environment variables
let VERCEL_DEPLOY_HOOK_URL: string;
try {
	// Import dynamically to prevent build errors
	VERCEL_DEPLOY_HOOK_URL = import.meta.env.VERCEL_DEPLOY_HOOK_URL || 
							  process.env.VERCEL_DEPLOY_HOOK_URL || 
							  'https://api.vercel.com/v1/integrations/deploy/placeholder-for-build';
} catch (e) {
	// Fallback for build process
	VERCEL_DEPLOY_HOOK_URL = 'https://api.vercel.com/v1/integrations/deploy/placeholder-for-build';
}

export const GET: RequestHandler = async () => {
	// Check if we have a valid hook URL
	if (!VERCEL_DEPLOY_HOOK_URL || VERCEL_DEPLOY_HOOK_URL.includes('placeholder-for-build')) {
		console.warn('No valid VERCEL_DEPLOY_HOOK_URL found. Skipping rebuild trigger.');
		return new Response('Rebuild not triggered: No valid deploy hook URL configured', { status: 200 });
	}

	try {
		const response = await fetch(VERCEL_DEPLOY_HOOK_URL, { method: 'POST' });
		if (!response.ok) {
			throw new Error(`Deploy hook failed: ${response.statusText}`);
		}
		return new Response('Rebuild triggered successfully', { status: 200 });
	} catch (error) {
		console.error('Failed to trigger rebuild:', error);
		return new Response('Failed to trigger rebuild', { status: 500 });
	}
}
