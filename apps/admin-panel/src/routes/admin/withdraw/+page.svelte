<script lang="ts">
	import { goto } from '$app/navigation'
	import { defaultCurrencyFormatter } from '$lib/formatter/currency.formatter'
	import { defaultDateTimeFormatter } from '$lib/formatter/date-time.formatter'
	import {
		Badge,
		Breadcrumb,
		BreadcrumbItem,
		Button,
		Heading,
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
		CalendarMonthSolid,
		CheckSolid,
		CloseSolid,
		ExclamationCircleOutline
	} from 'flowbite-svelte-icons'
	import type { ActionData, PageServerData } from './$types'

	export let form: ActionData
	export let data: PageServerData

	let actionModal = false
	let actionWithdrawId: string
	let actionCtx: 'confirm' | 'reject' | 'cancel'
	let actionMsg: string

	const previous = () => {
		if (data.page > 0) {
			goto(`?status=${data.status}&page=${--data.page}`)
		}
	}
	const next = () => {
		if (data.withdraws.length >= 20) {
			goto(`?status=${data.status}&page=${++data.page}`)
		}
	}
</script>

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
<div class="p-4">
	<Breadcrumb aria-label="breadcrumb" navClass="mb-5">
		<BreadcrumbItem home>
			<svelte:fragment slot="icon">
				<CalendarMonthSolid class="me-2 h-4 w-4" />
			</svelte:fragment>
			Event
		</BreadcrumbItem>
	</Breadcrumb>
	<Heading tag="h2" class="mb-3">Withdraw requests</Heading>
	<div class="mb-3 flex items-center gap-2 text-orange-400 dark:text-orange-300">
		<ExclamationCircleOutline class="inline" />
		<div>
			<span> The amount has been deducted by admin fee. </span>
			<br />
			<span>Admin fee: <strong>{defaultCurrencyFormatter.format(data.adminFee)}</strong></span>
		</div>
	</div>
	<div class="flex gap-2">
		<P>Filter:</P>
		<Badge href="/admin/withdraw" rounded border color="purple" large>
			{#if !data.status}
				<CheckSolid class="me-1.5 h-2.5 w-2.5" />
			{/if}
			ALL
		</Badge>
		<Badge href="/admin/withdraw?status=PENDING" rounded border color="yellow" large>
			{#if data.status === 'PENDING'}
				<CheckSolid class="me-1.5 h-2.5 w-2.5" />
			{/if}
			PENDING
		</Badge>
		<Badge href="/admin/withdraw?status=COMPLETED" rounded border color="green" large>
			{#if data.status === 'COMPLETED'}
				<CheckSolid class="me-1.5 h-2.5 w-2.5" />
			{/if}
			COMPLETED
		</Badge>
		<Badge href="/admin/withdraw?status=REJECTED" rounded border color="red" large>
			{#if data.status === 'REJECTED'}
				<CheckSolid class="me-1.5 h-2.5 w-2.5" />
			{/if}
			REJECTED
		</Badge>
	</div>
</div>

<Table striped divClass="-z-10">
	<TableHead>
		<TableHeadCell>Date Submitted</TableHeadCell>
		<TableHeadCell>Applicant</TableHeadCell>
		<TableHeadCell>Status</TableHeadCell>
		<TableHeadCell>Payment Method</TableHeadCell>
		<TableHeadCell>Amount</TableHeadCell>
		<TableHeadCell>Details</TableHeadCell>
		<TableHeadCell>Action</TableHeadCell>
	</TableHead>
	<TableBody>
		{#if data.withdraws.length}
			{#each data.withdraws as withdraw}
				<TableBodyRow>
					<TableBodyCell>{defaultDateTimeFormatter.format(withdraw.createdAt)}</TableBodyCell>
					<TableBodyCell>
						<strong>{withdraw.user.fullname}</strong><br />{withdraw.user.email}
					</TableBodyCell>
					<TableBodyCell>
						{#if withdraw.status === 'COMPLETED'}
							<Badge rounded border color="green">{withdraw.status}</Badge>
						{:else if withdraw.status === 'PENDING'}
							<Badge rounded border color="yellow">{withdraw.status}</Badge>
						{:else}
							<Badge rounded border color="red">{withdraw.status}</Badge>
						{/if}
					</TableBodyCell>
					<TableBodyCell>{withdraw.method}</TableBodyCell>
					<TableBodyCell>{defaultCurrencyFormatter.format(withdraw.amount)}</TableBodyCell>
					<TableBodyCell>{withdraw.details}</TableBodyCell>
					<TableBodyCell>
						{#if withdraw.status === 'PENDING'}
							<div class="flex items-center gap-2">
								<Button
									on:click={() => {
										actionModal = true
										actionCtx = 'confirm'
										actionWithdrawId = withdraw.id
										actionMsg = 'Confirmation of withdrawal settlement?'
									}}
									pill
									size="sm"
									color="green">Confirm</Button
								>
								<Button
									on:click={() => {
										actionModal = true
										actionCtx = 'reject'
										actionWithdrawId = withdraw.id
										actionMsg =
											'The withdrawal will be declined and the balance will be returned to the user.'
									}}
									pill
									size="sm"
									color="red"
									outline>Reject</Button
								>
							</div>
						{:else}
							<Button
								on:click={() => {
									actionModal = true
									actionCtx = 'cancel'
									actionWithdrawId = withdraw.id
									actionMsg = 'Cancel withdrawal confirmation/rejection.'
								}}
								pill
								size="sm"
								color="yellow"
								outline
							>
								Undo
							</Button>
						{/if}
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
{#if data.page > 0 || data.withdraws.length}
	<div class="m-4">
		<Pagination large on:previous={previous} on:next={next} />
	</div>
{/if}

<Modal title="Confirmation" bind:open={actionModal} outsideclose>
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">{actionMsg}</p>
	<svelte:fragment slot="footer">
		<form action="?/{actionCtx}" method="post">
			<input type="hidden" name="id" value={actionWithdrawId} />
			<Button type="submit">Confirm</Button>
		</form>
		<Button on:click={() => (actionModal = false)} color="alternative">Cancel</Button>
	</svelte:fragment>
</Modal>