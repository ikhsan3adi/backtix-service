<script lang="ts">
	import { A, Alert, Button, Input, Label } from 'flowbite-svelte'
	import { ArrowLeftSolid } from 'flowbite-svelte-icons'
	import type { ActionData, PageData } from './$types'

	export let data: PageData

	export let form: ActionData

	let title = 'Email confirmation'

	const loginLink = '/auth/login'
	const resendLink = '/auth/email/?' // TODO
</script>

<!-- Card -->
<h1 class="text-2xl font-bold text-gray-900 dark:text-white">
	{title}
</h1>
<span class="text-sm">OTP has been sent to {data.email}</span>
<form class="mt-8 space-y-6" method="post">
	{#if form?.message}
		<Alert color="red">{form?.message}</Alert>
	{/if}
	<div>
		<Label for="otp" class="mb-2">Enter your 6-digit otp code</Label>
		<Input type="text" name="otp" id="otp" placeholder="123456" required />
	</div>
	<div class="flex justify-between">
		<div class="flex gap-4">
			<Button href={loginLink} color="alternative" pill>
				<div class="mr-2"><ArrowLeftSolid size="xs" /></div>
				Back
			</Button>
			<Button type="submit" color="primary" pill>Confirm</Button>
		</div>
		<A href={resendLink}>Resend OTP</A>
	</div>
</form>
