<script lang="ts">
	import {
		Breadcrumb,
		BreadcrumbItem,
		Button,
		ButtonGroup,
		Heading,
		Input,
		InputAddon,
		Label,
		Toast
	} from 'flowbite-svelte'
	import { CheckSolid, CloseSolid, GearSolid } from 'flowbite-svelte-icons'
	import type { ActionData, PageData } from './$types'

	export let data: PageData
	export let form: ActionData

	const myUser = data.myUser

	let a = []
</script>

<div class="fixed bottom-0 right-0 z-10 w-screen">
	{#if form?.success}
		<Toast color="green" position="bottom-right">
			<CheckSolid slot="icon" class="h-5 w-5" />
			{form?.message}
		</Toast>
	{:else if form && !form?.success}
		<Toast color="red" position="bottom-right">
			<CloseSolid slot="icon" class="h-5 w-5" />
			{form?.message}
		</Toast>
	{/if}
</div>

<div class="p-4">
	<Breadcrumb aria-label="breadcrumb" navClass="mb-5">
		<BreadcrumbItem home>
			<svelte:fragment slot="icon">
				<GearSolid class="me-2 h-4 w-4" />
			</svelte:fragment>
			Settings
		</BreadcrumbItem>
	</Breadcrumb>
	<Heading tag="h2" class="mb-3">Settings</Heading>
</div>

<form action="?/updateFee" method="post" class="m-4">
	<Heading tag="h3" id="withdrawalFee" class="mb-3">Withdrawal Fee</Heading>
	<div class="mb-4 grid gap-4 sm:grid-cols-2">
		<div>
			<Label for="fee" class="mb-2">Update withdrawal fee</Label>
			<ButtonGroup class="w-full">
				<InputAddon>{data.currencyPrefix}</InputAddon>
				<Input
					type="number"
					id="fee"
					name="fee"
					placeholder="2500"
					value={data.withdrawFee?.amount}
					required
				/>
			</ButtonGroup>
		</div>
	</div>
	<Button type="submit">Update</Button>
</form>

<div class="my-8"><hr /></div>

<form class="m-4" method="post" action="?/updateMyProfile">
	<Heading tag="h3" id="updateMyProfile" class="mb-3">Update My Profile</Heading>
	<div class="mb-4 grid gap-4 sm:grid-cols-2">
		<div>
			<Label for="fullname" class="mb-2">Full name</Label>
			<Input
				type="text"
				id="fullname"
				name="fullname"
				placeholder="John"
				value={form?.fullname ?? myUser.fullname}
				required
			/>
		</div>
		<div>
			<div class="mb-4">
				<Label for="email" class="mb-2">Email address</Label>
				<Input
					type="email"
					id="email"
					name="email"
					placeholder="john.doe@company.com"
					value={form?.email ?? myUser.email}
					required
				/>
			</div>
		</div>
		<div>
			<div class="mb-4">
				<Label for="username" class="mb-2">Username</Label>
				<ButtonGroup class="w-full">
					<InputAddon>@</InputAddon>
					<Input
						type="text"
						id="username"
						name="username"
						placeholder="johndoe123"
						value={form?.username ?? myUser.username}
						required
					/>
				</ButtonGroup>
			</div>
		</div>
		<div>
			<div class="mb-4">
				<Label for="location" class="mb-2">Location</Label>
				<Input
					type="text"
					id="location"
					name="location"
					placeholder="Bandung"
					value={form?.location ?? myUser.location}
					required
				/>
			</div>
		</div>
		<div>
			<div class="mb-4">
				<Label for="password" class="mb-2">New Password</Label>
				<Input type="password" id="password" name="password" />
			</div>
		</div>
		<div>
			<div class="mb-4">
				<Label for="confirm_password" class="mb-2">Confirm password</Label>
				<Input type="password" id="confirm_password" name="confirm_password" />
			</div>
		</div>
	</div>

	<Button type="submit">Submit</Button>
</form>
