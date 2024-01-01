<script lang="ts">
	import { Alert, Button, Input, Label } from 'flowbite-svelte'
	import { ArrowLeftSolid } from 'flowbite-svelte-icons'
	import type { ActionData } from './$types'

	export let form: ActionData

	let title = 'Sign in using email'

	const loginLink = '/auth/login'
</script>

<!-- Card -->
<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
	{title}
</h1>
<form class="mt-8 space-y-6" method="post">
	{#if form?.message}
		<Alert color="red">{form?.message}</Alert>
	{/if}
	<div>
		<Label for="email" class="mb-2">Your email</Label>
		<Input type="email" name="email" id="email" placeholder="name@company.com" required />
	</div>
	<div class="flex gap-4">
		<Button href={loginLink} color="alternative" pill>
			<div class="mr-2"><ArrowLeftSolid size="xs" /></div>
			Back
		</Button>
		<Button type="submit" color="primary" pill>Submit</Button>
	</div>
</form>
