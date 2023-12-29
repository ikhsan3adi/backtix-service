<script lang="ts">
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { dateTimeFormatterWithoutSeconds } from '$lib/formatter/date-time.formatter'
	import type { UserEntity } from '$lib/server/entities/users/user.entity'
	import {
		A,
		Avatar,
		Badge,
		Breadcrumb,
		BreadcrumbItem,
		Button,
		Checkbox,
		Heading,
		Input,
		Label,
		Modal,
		P,
		Pagination,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Toast
	} from 'flowbite-svelte'
	import {
		CheckSolid,
		CloseSolid,
		ExclamationCircleOutline,
		PlusSolid,
		UserSolid
	} from 'flowbite-svelte-icons'
	import type { ActionData, PageData } from './$types'

	export let form: ActionData
	export let data: PageData

	let actionModal = false
	let actionUserId: string
	let actionCtx: 'delete' | 'restore' | 'deletePermanent'
	let actionMsg: string

	let formModal = false
	let formUser: UserEntity
	let group: string[] = []
	let a = []

	$: activated = a.length ? true : false

	const previous = () => {
		if (data.page > 0) {
			goto(`?status=${data.status}&deleted=${data.deleted}&page=${--data.page}`)
		}
	}
	const next = () => {
		if (data.users.length >= 20) {
			goto(`?status=${data.status}&deleted=${data.deleted}&page=${++data.page}`)
		}
	}
</script>

<div class="fixed bottom-0 right-0 w-screen">
	{#if form?.success || $page.url.searchParams.get('success')}
		<Toast color="green" position="bottom-right">
			<CheckSolid slot="icon" class="h-5 w-5" />
			{form?.message ?? $page.url.searchParams.get('message')}
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
				<UserSolid class="me-2 h-4 w-4" />
			</svelte:fragment>
			User
		</BreadcrumbItem>
	</Breadcrumb>
	<div class="items-center justify-between lg:flex">
		<div class="mb-3 lg:mb-0">
			<Heading tag="h2" class="mb-3">User management</Heading>
			<div class="flex gap-2">
				<P>Filter:</P>

				<Badge
					href="/admin/user?group=SUPERADMIN&deleted=false"
					rounded
					border
					color="purple"
					large
				>
					{#if data.group === 'SUPERADMIN'}
						<CheckSolid class="me-1.5 h-2.5 w-2.5" />
					{/if}
					SUPERADMIN
				</Badge>
				<Badge href="/admin/user?group=ADMIN&deleted=false" rounded border color="green" large>
					{#if data.group === 'ADMIN'}
						<CheckSolid class="me-1.5 h-2.5 w-2.5" />
					{/if}
					ADMIN
				</Badge>
				<Badge href="/admin/user?group=USER&deleted=false" rounded border color="blue" large>
					{#if data.group === 'USER'}
						<CheckSolid class="me-1.5 h-2.5 w-2.5" />
					{/if}
					USER
				</Badge>
				<Badge href="/admin/user?deleted=true" rounded border color="red" large>
					{#if data.deleted === 'true'}
						<CheckSolid class="me-1.5 h-2.5 w-2.5" />
					{/if}
					DELETED
				</Badge>
				<Badge href="/admin/user" rounded border color="purple" large>
					{#if !data.group && !data.deleted}
						<CheckSolid class="me-1.5 h-2.5 w-2.5" />
					{/if}
					ALL
				</Badge>
			</div>
		</div>
		<Button href="/admin/user/new" pill color="blue">
			<PlusSolid class="me-2 h-3.5 w-3.5" />
			Add user/admin
		</Button>
	</div>
</div>

<Table striped divClass="-z-10">
	<TableHead>
		<TableHeadCell padding="px-4"></TableHeadCell>
		<TableHeadCell padding="px-2">Username</TableHeadCell>
		<TableHeadCell>Fullname</TableHeadCell>
		<TableHeadCell>Email</TableHeadCell>
		<TableHeadCell padding="px-0">Activated?</TableHeadCell>
		<TableHeadCell>Groups</TableHeadCell>
		<TableHeadCell>Location</TableHeadCell>
		<TableHeadCell>Date Created</TableHeadCell>
		<TableHeadCell>Action</TableHeadCell>
	</TableHead>
	<TableBody>
		{#if data.users.length}
			{#each data.users as user}
				<TableBodyRow>
					<TableBodyCell tdClass="px-4">
						<Avatar size="sm" alt={user.username} src={user.image} />
					</TableBodyCell>
					<TableBodyCell tdClass="px-2">{user.username}</TableBodyCell>
					<TableBodyCell>{user.fullname}</TableBodyCell>
					<TableBodyCell
						><A href="mailto:{user.email}" aClass="underline" color="blue">{user.email}</A
						></TableBodyCell
					>
					<TableBodyCell tdClass="px-0">{user.activated ? 'Yes' : 'No'}</TableBodyCell>
					<TableBodyCell>
						<div class="flex flex-col gap-1">
							{#each user.groups as group}
								<Badge rounded border color="primary">{group}</Badge>
							{/each}
						</div>
					</TableBodyCell>
					<TableBodyCell>
						{#if user.location}
							<A
								href={`https://www.google.com/maps/search/?api=1&query=${user.latitude},${user.longitude}`}
								aClass="underline"
								color="blue"
							>
								{user.location}
							</A>
						{:else}
							{'unset'}
						{/if}
					</TableBodyCell>
					<TableBodyCell>{dateTimeFormatterWithoutSeconds.format(user.createdAt)}</TableBodyCell>
					<TableBodyCell>
						<div class="flex gap-2">
							{#if user.username !== 'superadmin' && user.deletedAt === null}
								<Button
									on:click={() => {
										formModal = true
										formUser = user
										group = []
										a = []
									}}
									pill
									size="sm"
									color="blue">Edit</Button
								>
								<Button
									on:click={() => {
										actionModal = true
										actionCtx = 'delete'
										actionUserId = user.id
										actionMsg = 'Are you sure?'
									}}
									pill
									size="sm"
									color="red"
									outline>Delete</Button
								>
							{/if}
							{#if user.deletedAt !== null}
								<Button
									on:click={() => {
										actionModal = true
										actionCtx = 'restore'
										actionUserId = user.id
										actionMsg = 'Are you sure?'
									}}
									pill
									size="sm"
									color="blue">Restore</Button
								>
								<!-- <Button
									on:click={() => {
										actionModal = true
										actionCtx = 'deletePermanent'
										actionUserId = user.id
										actionMsg = 'Are you sure?'
									}}
									pill
									size="sm"
									color="red">Delete permanently</Button
								> -->
							{/if}
						</div>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		{:else}
			<TableBodyRow>
				<td colspan="7">
					<div class="flex h-64">
						<span class="m-auto text-center text-xl font-bold">Not found</span>
					</div>
				</td>
			</TableBodyRow>
		{/if}
	</TableBody>
</Table>
{#if data.page > 0 || data.users.length}
	<div class="m-4">
		<Pagination large on:previous={previous} on:next={next} />
	</div>
{/if}

<Modal title="Confirmation" size="xs" bind:open={actionModal} outsideclose>
	<div class="text-center">
		<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">{actionMsg}</h3>
		<div class="flex justify-center gap-2">
			<form action="?/{actionCtx}" method="post" class="inline">
				<input type="hidden" name="id" value={actionUserId} />
				<Button type="submit" color="red">Confirm</Button>
			</form>
			<Button on:click={() => (actionModal = false)} color="alternative">Cancel</Button>
		</div>
	</div>
</Modal>

<Modal bind:open={formModal} size="xs" autoclose={false} class="w-full">
	<form class="flex flex-col space-y-6" action="?/edit" method="post">
		<h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Edit user detail</h3>
		<input type="hidden" name="id" value={formUser.id} />
		<Label class="space-y-2">
			<span>Username</span>
			<Input type="text" name="username" placeholder="name123" value={formUser.username} required />
		</Label>
		<Label class="space-y-2">
			<span>Email</span>
			<Input
				type="email"
				name="email"
				placeholder="name@company.com"
				value={formUser.email}
				required
			/>
		</Label>
		<Label class="space-y-2">
			<span>Full name</span>
			<Input
				type="text"
				name="fullname"
				placeholder="John Doe"
				value={formUser.fullname}
				required
			/>
		</Label>
		<Label class="space-y-2">
			<span>Location</span>
			<Input type="text" name="location" placeholder="Bandung" value={formUser.location} />
		</Label>
		<Label class="space-y-2">
			<span>Groups</span>
			<div class="flex items-start gap-4">
				<Checkbox bind:group checked={formUser.groups.includes('USER')} value={'USER'}>
					USER
				</Checkbox>
				<Checkbox bind:group checked={formUser.groups.includes('ADMIN')} value={'ADMIN'}>
					ADMIN
				</Checkbox>
				<Checkbox
					bind:group
					checked={formUser.groups.includes('SUPERADMIN')}
					color="red"
					value={'SUPERADMIN'}
				>
					SUPERADMIN
				</Checkbox>
				<input type="hidden" name="group" value={group} />
			</div>
		</Label>
		<div class="flex items-start">
			<Checkbox checked={formUser.activated} bind:group={a} value={'true'}>Activated</Checkbox>
			<input type="hidden" name="activated" value={activated} />
		</div>
		<Button type="submit" class="w-full">Submit</Button>
	</form>
</Modal>
