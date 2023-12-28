<script lang="ts">
	import { site } from '$lib/site'

	export let mainClass = 'bg-gray-50 dark:bg-gray-900'
	export let mainDivClass =
		'flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen pt:mt-0 dark:bg-gray-900'
	export let siteLinkClass =
		'flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white'
	export let siteImgClass = 'mr-4 h-11'

	export let cardDivClass =
		'w-full max-w-xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800'
</script>

<main class={mainClass}>
	<div class={mainDivClass}>
		<a href={site.href} class={siteLinkClass}>
			<img src={site.img} class={siteImgClass} alt={site.imgAlt} />
			<span>{site.name}</span>
		</a>
		<div class={cardDivClass}>
			<slot />
		</div>
	</div>
</main>
