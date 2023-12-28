<script lang="ts">
	import { site } from '$lib/site'
	import { Button, DarkMode } from 'flowbite-svelte'

	export let mainClass = 'bg-gray-50 dark:bg-gray-900'
	export let mainDivClass =
		'flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen pt:mt-0 dark:bg-gray-900'
	export let siteLinkClass =
		'flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white'
	export let siteImgClass = 'mr-4 h-11'
</script>

<main class={mainClass}>
	<div class="absolute p-4">
		<DarkMode />
	</div>
	<div class={mainDivClass}>
		<a href={site.href} class={siteLinkClass}>
			<img src={site.img} class={siteImgClass} alt={site.imgAlt} />
			<span>{site.name}</span>
		</a>
		<div class="flex">
			<Button href="/admin" size="lg" pill>Enter Dashboard</Button>
		</div>
	</div>
</main>
