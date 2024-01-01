<script lang="ts">
	import {
		Alert,
		Breadcrumb,
		BreadcrumbItem,
		Button,
		ButtonGroup,
		Checkbox,
		Heading,
		Input,
		InputAddon,
		Label,
		P,
		Toggle
	} from 'flowbite-svelte'
	import { UserSolid } from 'flowbite-svelte-icons'
	import type { ActionData, PageServerLoad } from './$types'

	export let data: PageServerLoad
	export let form: ActionData

	let group = []
	let a = []
	$: activate = a.length ? true : false
</script>

<div class="p-4">
	<Breadcrumb aria-label="breadcrumb" navClass="mb-5">
		<BreadcrumbItem href="/admin/user" home>
			<svelte:fragment slot="icon">
				<UserSolid class="me-2 h-4 w-4" />
			</svelte:fragment>
			User
		</BreadcrumbItem>
		<BreadcrumbItem>Add new user</BreadcrumbItem>
	</Breadcrumb>
	<Heading tag="h2" class="mb-3">Add New User</Heading>
</div>

{#if form?.message}
	<Alert color={form?.success ? 'green' : 'red'} class="mx-4 mb-2">{form?.message}</Alert>
{/if}

<form class="m-4" method="post">
	<div class="mb-4 grid gap-4 sm:grid-cols-2">
		<div>
			<Label for="fullname" class="mb-2">Full name</Label>
			<Input
				type="text"
				id="fullname"
				name="fullname"
				placeholder="John"
				value={form?.fullname}
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
					value={form?.email}
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
						value={form?.username}
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
					value={form?.location}
					required
				/>
			</div>
		</div>
		<div>
			<div class="mb-4">
				<Label for="password" class="mb-2">Password</Label>
				<Input type="password" id="password" name="password" placeholder="•••••••••" required />
			</div>
		</div>
		<div>
			<div class="mb-4">
				<Label for="confirm_password" class="mb-2">Confirm password</Label>
				<Input
					type="password"
					id="confirm_password"
					name="confirm_password"
					placeholder="•••••••••"
					required
				/>
			</div>
		</div>
	</div>
	<div class="mb-4">
		<Label class="mb-4">Assign groups</Label>
		{#if data.my?.groups.includes('SUPERADMIN')}
			<div class="flex gap-4">
				<Checkbox class="mb-4 space-x-1 rtl:space-x-reverse" value={'ADMIN'} bind:group>
					ADMIN
				</Checkbox>
				<Checkbox
					class="mb-4 space-x-1 rtl:space-x-reverse"
					color="red"
					value={'SUPERADMIN'}
					bind:group
				>
					SUPERADMIN
				</Checkbox>
				<Checkbox class="mb-4 space-x-1 rtl:space-x-reverse" value={'USER'} bind:group>
					USER
				</Checkbox>
				<input type="hidden" name="group" value={group} />
			</div>
		{:else}
			<div class="flex justify-between gap-4">
				<Checkbox
					class="mb-4 space-x-1 rtl:space-x-reverse"
					value={'USER'}
					disabled
					checked
					bind:group
				>
					USER
				</Checkbox>
				<P size="sm">
					*Only superadmin can assign <code>admin</code> & <code>superadmin</code> group
				</P>
				<input type="hidden" name="group" value={group} />
			</div>
		{/if}
	</div>

	<Toggle class="mb-6 mr-3 rtl:space-x-reverse" bind:group={a}>ACTIVATE</Toggle>
	<input type="hidden" name="activate" value={activate} />
	<Button type="submit">Submit</Button>
</form>
