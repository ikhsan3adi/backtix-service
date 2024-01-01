<script lang="ts">
	import { page } from '$app/stores'
</script>

<div class="flex h-96 items-center justify-center">
	<h1 class="text-5xl text-gray-500 dark:text-gray-400">{$page.status}: {$page.error?.message}</h1>
</div>
