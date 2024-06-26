<script lang="ts">
	import { goto } from '$app/navigation'
	import { dateTimeFormatterWithoutSeconds } from '$lib/formatter/date-time.formatter'
	import {
		A,
		Badge,
		Breadcrumb,
		BreadcrumbItem,
		Button,
		Checkbox,
		Heading,
		Modal,
		P,
		Pagination,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte'
	import { CalendarMonthSolid, CheckSolid, ExclamationCircleOutline } from 'flowbite-svelte-icons'
	import type { PageServerData } from './$types'

	export let data: PageServerData

	const previous = () => {
		if (data.page > 0) {
			goto(`?status=${data.status}&deleted=${data.deleted}&page=${--data.page}`)
		}
	}
	const next = () => {
		if (data.events.length >= 20) {
			goto(`?status=${data.status}&deleted=${data.deleted}&page=${++data.page}`)
		}
	}

	let selected = []
	let selectAll = []

	$: canUpdateMany = selected.length > 0
	$: selectedAll = selectAll.length === 1

	let previousSelectedAll = false

	$: if (!previousSelectedAll && selectedAll) {
		selected = data.events.map((e) => e.id)
		previousSelectedAll = true
	} else if (previousSelectedAll && !selectedAll) {
		selected = []
		previousSelectedAll = false
	}

	let actionModal = false
	let actionCtx: 'approve' | 'reject'
</script>

<div class="p-4">
	<Breadcrumb aria-label="breadcrumb" navClass="mb-5">
		<BreadcrumbItem home>
			<svelte:fragment slot="icon">
				<CalendarMonthSolid class="me-2 h-4 w-4" />
			</svelte:fragment>
			Event
		</BreadcrumbItem>
	</Breadcrumb>

	<div class="max-w-screen-xl items-center justify-between lg:flex">
		<div class="mb-3 lg:mb-0">
			<Heading tag="h2" class="mb-3">Event management</Heading>
			<div class="flex gap-2">
				<P>Filter:</P>
				<Badge href="/admin/event" rounded border color="purple" large>
					{#if !data.status && !data.deleted}
						<CheckSolid class="me-1.5 h-2.5 w-2.5" />
					{/if}
					ALL
				</Badge>
				<Badge href="/admin/event?status=DRAFT&deleted=false" rounded border color="yellow" large>
					{#if data.status === 'DRAFT'}
						<CheckSolid class="me-1.5 h-2.5 w-2.5" />
					{/if}
					DRAFT
				</Badge>
				<Badge
					href="/admin/event?status=PUBLISHED&deleted=false"
					rounded
					border
					color="green"
					large
				>
					{#if data.status === 'PUBLISHED'}
						<CheckSolid class="me-1.5 h-2.5 w-2.5" />
					{/if}
					PUBLISHED
				</Badge>
				<Badge
					href="/admin/event?status=CANCELLED&deleted=false"
					rounded
					border
					color="primary"
					large
				>
					{#if data.status === 'CANCELLED'}
						<CheckSolid class="me-1.5 h-2.5 w-2.5" />
					{/if}
					CANCELLED
				</Badge>
				<Badge href="/admin/event?status=REJECTED&deleted=false" rounded border color="red" large>
					{#if data.status === 'REJECTED'}
						<CheckSolid class="me-1.5 h-2.5 w-2.5" />
					{/if}
					REJECTED
				</Badge>
				<Badge href="/admin/event?deleted=true" rounded border color="dark" large>
					{#if data.deleted === 'true'}
						<CheckSolid class="me-1.5 h-2.5 w-2.5" />
					{/if}
					DELETED
				</Badge>
			</div>
		</div>
		<div class="mr-2 flex gap-2">
			<Button
				on:click={() => {
					actionModal = true
					actionCtx = 'approve'
				}}
				pill
				color={canUpdateMany ? 'green' : 'alternative'}
				disabled={!canUpdateMany || data.status === 'PUBLISHED'}
			>
				Approve
			</Button>
			<Button
				on:click={() => {
					actionModal = true
					actionCtx = 'reject'
				}}
				pill
				color={canUpdateMany ? 'red' : 'alternative'}
				outline={canUpdateMany}
				disabled={!canUpdateMany || data.status === 'REJECTED'}
			>
				Reject
			</Button>
		</div>
	</div>

	<Modal title="Confirmation" size="xs" bind:open={actionModal} outsideclose>
		<div class="text-center">
			<ExclamationCircleOutline class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200" />
			<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure?</h3>
			<div class="flex justify-center gap-2">
				<form action="?/{actionCtx}" method="post" class="inline">
					<input type="hidden" name="selectedIds" value={selected} />
					<Button type="submit" color="red">Confirm</Button>
				</form>
				<Button on:click={() => (actionModal = false)} color="alternative">Cancel</Button>
			</div>
		</div>
	</Modal>
</div>

<Table striped>
	<TableHead>
		<TableHeadCell padding="pr-2 pl-4">
			<Checkbox bind:group={selectAll}></Checkbox>
		</TableHeadCell>
		<TableHeadCell padding="pl-0">Event Name</TableHeadCell>
		<TableHeadCell padding="px-2">Location</TableHeadCell>
		<TableHeadCell>Owner</TableHeadCell>
		<TableHeadCell>Event Date</TableHeadCell>
		<TableHeadCell>Date Created</TableHeadCell>
		<TableHeadCell>Status</TableHeadCell>
		<TableHeadCell>Action</TableHeadCell>
	</TableHead>
	<TableBody>
		{#if data.events.length}
			{#each data.events as event}
				<TableBodyRow>
					<TableBodyCell tdClass="pr-2 pl-4">
						<Checkbox value={event.id} bind:group={selected}></Checkbox>
					</TableBodyCell>
					<TableBodyCell tdClass="pl-0">{event.name}</TableBodyCell>
					<TableBodyCell tdClass="px-2 max-w-64">
						{#if event.location}
							<A
								href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
								aClass="underline line-clamp-3"
								color="blue"
							>
								{event.location}
							</A>
						{:else}
							{'unset'}
						{/if}
					</TableBodyCell>
					<TableBodyCell>
						<strong>{event.user.username}</strong><br />{event.user.email}
					</TableBodyCell>
					<TableBodyCell>
						{dateTimeFormatterWithoutSeconds.format(event.date)} -
						{dateTimeFormatterWithoutSeconds.format(event.endDate ?? event.date)}
					</TableBodyCell>
					<TableBodyCell>
						{dateTimeFormatterWithoutSeconds.format(event.createdAt)}
					</TableBodyCell>
					<TableBodyCell>
						{#if event.status === 'PUBLISHED'}
							<Badge rounded border color="green">{event.status}</Badge>
						{:else if event.status === 'DRAFT'}
							<Badge rounded border color="yellow">{event.status}</Badge>
						{:else if event.status === 'REJECTED'}
							<Badge rounded border color="red">{event.status}</Badge>
						{:else if event.deletedAt}
							<Badge rounded border color="primary">DELETED</Badge>
						{:else}
							<Badge rounded border color="none">{event.status}</Badge>
						{/if}
					</TableBodyCell>
					<TableBodyCell>
						<Button href="/admin/event/{event.id}" pill size="sm">Detail</Button>
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
{#if data.page > 0 || data.events.length}
	<div class="m-4">
		<Pagination large on:previous={previous} on:next={next} />
	</div>
{/if}
