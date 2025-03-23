<script>
	import { presets as _presets } from '$lib/presets'

	let presets = $derived(
		Object.entries(_presets)
			.map(([key, value]) => ({ key: key.toLowerCase(), title: value.title }))
			.sort()
	)

	const instructions = [
		{
			title: 'Cursor',
			description: `Cursor supports adding context via URL using the <a href="https://docs.cursor.com/context/@-symbols/@-link#paste-links">Paste Links</a> feature.`,
			command: '@https://pocketctx.click/[preset]'
		},
		{
			title: 'Zed',
			description:
				'You can use PocketCTX directly in Zed using a <a href="https://zed.dev/docs/assistant/commands">/fetch command</a>.',
			command: '/fetch https://pocketctx.click/[preset]'
		},
		{
			title: 'cURL',
			description: `Let's be real—if you clicked this, you probably already know how to use cURL. But if you don't, here's a quick example:`,
			command: 'curl https://pocketctx.click/[preset] -o context.txt'
		},
		{
			title: 'Download',
			description: `Download the context as a text file for offline use.`,
			command: 'Click the download link next to any preset'
		}
	]
</script>

<main>
	<article>
		<div>pocketctx.click</div>
		<h1>PocketBase documentation in an LLM-ready format</h1>

		<p>
			PocketCTX transforms PocketBase docs into LLM-friendly formats. Pick a preset, get AI-ready context.
			Perfect for coding with AI assistants like Cursor or Zed.
		</p>
	</article>

	<section>
		<p>
			<code>https://pocketctx.click/</code><code>[preset]</code>
		</p>
		<h2>Currently supported presets:</h2>
		<ul>
			{#each presets as preset}
				<li>
					<a href="/{preset.key}">{preset.title}</a>
					<a href="/{preset.key}?download=true" class="download-link" title="Download as text file" aria-label="Download {preset.title} as text file">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
							<polyline points="7 10 12 15 17 10"></polyline>
							<line x1="12" y1="15" x2="12" y2="3"></line>
						</svg>
					</a>
				</li>
			{/each}
			<li><a target="_blank" href="https://github.com/didier/llmctx">Add your own...</a></li>
		</ul>
	</section>

	<br />
	{#each instructions as { title, description, command }}
		<details>
			<summary>{title}</summary>
			<p>{@html description}</p>
			<pre><code>{command}</code></pre>
		</details>
	{/each}

	<br />
	<footer>
		Adapted from <a href="https://github.com/didier/llmctx">work by Didier Catz</a>.
	</footer>
</main>

<style>
	:global(body) {
		line-height: 1.4;
		font-size: 16px;
		padding: 0 10px;
		margin: 50px auto;
		max-width: 650px;
	}

	main {
		max-width: 42em;
		margin: 15 auto;
	}

	.download-link {
		margin-left: 8px;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.download-link:hover {
		opacity: 1;
	}

	li {
		display: flex;
		align-items: center;
		margin-bottom: 8px;
	}
</style>
