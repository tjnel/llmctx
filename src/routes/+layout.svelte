<script lang="ts">
	import { dev } from '$app/environment'
	import { injectAnalytics } from '@vercel/analytics/sveltekit'

	// Types
	import type { PageData } from './$types'
	import type { Snippet } from 'svelte'

	type Props = {
		data: PageData
		children: Snippet
	}

	let { children }: Props = $props()
	
	// Initialize Vercel Analytics
	injectAnalytics()
</script>

<svelte:head>
	<title>PocketCTX - PocketBase documentation in LLM-ready format</title>
	<meta name="description" content="PocketCTX transforms PocketBase docs into LLM-friendly formats for AI assistants" />
	{#if !dev}
		<script
			defer
			data-domain="pocketctx.click"
			src="/metrics/metrics.js"
			data-api="/metrics/api/event"
		></script>
		<script>
			window.plausible =
				window.plausible ||
				function () {
					;(window.plausible.q = window.plausible.q || []).push(arguments)
				}
		</script>
	{/if}
</svelte:head>

<div class="container mx-auto">
	{@render children?.()}
</div>
