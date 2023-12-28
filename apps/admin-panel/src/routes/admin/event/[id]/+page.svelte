<script lang="ts">
	import { defaultCurrencyFormatter } from '$lib/formatter/currency.formatter'
	import {
		dateTimeFormatterWithoutSeconds,
		defaultDateTimeFormatter
	} from '$lib/formatter/date-time.formatter'
	import {
		Avatar,
		Badge,
		Breadcrumb,
		BreadcrumbItem,
		Button,
		Card,
		Carousel,
		Heading,
		Modal,
		P,
		Thumbnails
	} from 'flowbite-svelte'
	import { CalendarMonthSolid } from 'flowbite-svelte-icons'
	import type { PageServerData } from './$types'

	export let data: PageServerData

	const { event, images, tickets, userImage } = data

	let index = 0
	let forward = true
	let selectedImage: any

	let actionModal = false
	let actionCtx: 'approve' | 'reject'
</script>

<div class="p-4">
	<Breadcrumb aria-label="breadcrumb" navClass="mb-5">
		<BreadcrumbItem href="/admin/event?status={event.status}" home>
			<svelte:fragment slot="icon">
				<CalendarMonthSolid class="me-2 h-4 w-4" />
			</svelte:fragment>
			Event
		</BreadcrumbItem>
		<BreadcrumbItem>Event Detail</BreadcrumbItem>
	</Breadcrumb>

	<div class="flex items-center justify-between">
		<div>
			<Heading tag="h2" class="mb-3">{event?.name}</Heading>
		</div>
		{#if event.status === 'DRAFT'}
			<div class="flex gap-4">
				<Button
					on:click={() => {
						actionModal = true
						actionCtx = 'approve'
					}}
					pill
					color="green"
					href=""
				>
					<span class="mx-4">Approve</span>
				</Button>
				<Button
					on:click={() => {
						actionModal = true
						actionCtx = 'reject'
					}}
					pill
					outline
					color="red"
					href=""
				>
					<span class="mx-4">Reject</span>
				</Button>
			</div>
		{:else if event.status === 'PUBLISHED'}
			<Badge rounded border color="green" large class="mr-4">{event.status}</Badge>
		{:else if event.status === 'REJECTED'}
			<Badge rounded border color="red" large class="mr-4">{event.status}</Badge>
		{:else}
			<Badge rounded border color="primary" large class="mr-4">{event.status}</Badge>
		{/if}
	</div>

	<Modal title="Confirmation" bind:open={actionModal} outsideclose>
		<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">Are you sure?</p>
		<svelte:fragment slot="footer">
			<form action="?/{actionCtx}" method="post">
				<input type="hidden" name="id" value={event.id} />
				<Button type="submit">Confirm</Button>
			</form>
			<Button on:click={() => (actionModal = false)} color="alternative">Cancel</Button>
		</svelte:fragment>
	</Modal>
</div>

<div class="mb-3 flex w-full flex-col gap-4 px-4 pb-4 md:flex-row">
	<div class="w-full md:w-2/3">
		<Carousel
			{images}
			{forward}
			let:Indicators
			transition={null}
			let:Controls
			bind:index
			on:change={({ detail }) => (selectedImage = detail)}
		>
			<Controls />
			<Indicators />
		</Carousel>
		<div class="my-2 h-10 rounded bg-gray-300 p-2 dark:bg-gray-700 dark:text-white">
			{selectedImage?.alt}
		</div>
		<Thumbnails {images} {forward} bind:index imgClass="h-16" />
	</div>
	<div class="w-full md:w-1/3">
		<div class="mb-4 flex items-center gap-4">
			{#if userImage}
				<Avatar src={userImage} alt={event.user.username} />
			{:else}
				<Avatar>{event?.user.fullname[0]}</Avatar>
			{/if}
			<div class="flex flex-col">
				<Heading tag="h6">{event.user.fullname}</Heading>
				<span class="text-gray-700 dark:text-gray-400">{event.user.username}</span>
			</div>
		</div>
		<ul class="text-gray-700 dark:text-gray-400">
			<li>Created at: {dateTimeFormatterWithoutSeconds.format(event.createdAt)}</li>
			<li>Date start: {dateTimeFormatterWithoutSeconds.format(event.date)}</li>
			<li>
				Date end: {dateTimeFormatterWithoutSeconds.format(event.endDate ?? event.date)}
			</li>
		</ul>

		<Heading tag="h4" class="my-2">Categories</Heading>
		<div class="mb-4 mt-2 flex gap-2">
			{#if event.categories.length}
				{#each event.categories as c}
					<Badge border rounded color="primary">{c}</Badge>
				{/each}
			{:else}
				<Badge border rounded color="primary">No categories</Badge>
			{/if}
		</div>

		<Heading tag="h4" class="my-2">Description</Heading>
		<P>{event.description}</P>
	</div>
</div>

<Heading tag="h3" class="mb-4 px-4">Tickets</Heading>
<div class="flex flex-wrap gap-4 px-4">
	{#each tickets as ticket}
		<Card horizontal class="mb-4" padding="none">
			<div>
				{#if ticket.image}
					<img
						class="h-full w-full rounded-lg object-cover md:min-w-44 md:max-w-48"
						src={ticket.src}
						alt={ticket.name}
					/>
				{:else}
					<div class="bg-primary-400 flex h-full w-full items-center rounded-lg md:w-48">
						<span class="text-primary-800 m-auto">No image</span>
					</div>
				{/if}
			</div>
			<div class="min-w-72 p-4">
				<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
					{ticket.name}
				</h5>
				<p class="text-primary-700 dark:text-primary-100 mb-3 text-xl font-bold leading-tight">
					{defaultCurrencyFormatter.format(ticket.price)}
				</p>
				<ul class="text-sm text-gray-700 dark:text-gray-400">
					<li>Sales open date: {defaultDateTimeFormatter.format(ticket.salesOpenDate)}</li>
					<li>
						Purchase deadline: {defaultDateTimeFormatter.format(ticket.purchaseDeadline)}
					</li>
				</ul>
			</div>
		</Card>
	{/each}
</div>
