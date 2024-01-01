<script lang="ts">
	import { page } from '$app/stores'
	import { defaultCurrencyFormatter } from '$lib/formatter/currency.formatter'
	import { dateTimeFormatterWithoutSeconds } from '$lib/formatter/date-time.formatter'
	import type { ApexOptions } from 'apexcharts'
	import {
		Button,
		Card,
		Chart,
		Dropdown,
		DropdownItem,
		Heading,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte'
	import { ChevronDownSolid, ChevronRightSolid } from 'flowbite-svelte-icons'
	import type { PageData } from './$types'

	export let data: PageData

	const isNominal = $page.url.searchParams.get('chartData') === 'value'

	const sum = (p: number, c: number) => p + c

	const profit = defaultCurrencyFormatter.format(
		data.successfulWithdraw.map((e) => e.fee).reduce(sum)
	)

	const totalWithdrawn = defaultCurrencyFormatter.format(
		data.successfulWithdraw.map((e) => e.amount).reduce(sum)
	)

	const totalPurchasesOccured = defaultCurrencyFormatter.format(
		data.purchases.map((e) => e.price).reduce(sum)
	)

	const totalPurchasesRefunded = defaultCurrencyFormatter.format(
		data.refundedPurchases.map((e) => e.price).reduce(sum)
	)

	let chartOptions: ApexOptions = {
		chart: {
			height: '335px',
			width: '100%',
			type: 'line',
			fontFamily: 'Inter, sans-serif',
			dropShadow: {
				enabled: false
			},
			toolbar: {
				show: true
			}
		},
		tooltip: {
			enabled: true,
			x: {
				show: true
			}
		},
		dataLabels: {
			enabled: true
		},
		stroke: {
			width: 4,
			curve: 'monotoneCubic'
		},
		grid: {
			show: true,
			strokeDashArray: 4,
			padding: {
				left: 2,
				right: 2,
				top: -26
			}
		},
		series: [
			{
				name: 'Purchases',
				data: data.chartData.map((e) => e.purchases),
				color: '#3CBA5D'
			},
			{
				name: 'Withdraw requests',
				data: data.chartData.map((e) => e.withdraws),
				color: '#4A90E0'
			}
		].concat(
			isNominal
				? {
						name: 'Profit',
						data: data.chartData.map((e) => e.profits),
						color: '#BD4AE0'
					}
				: []
		),
		legend: {
			show: true
		},
		xaxis: {
			categories: data.chartData.map((e) => e.date),
			labels: {
				show: true,
				style: {
					fontFamily: 'Inter, sans-serif',
					cssClass: 'text-xs font-normal fill-gray-500 dark:fill-gray-400'
				}
			},
			axisBorder: {
				show: true
			},
			axisTicks: {
				show: true
			}
		},
		yaxis: {
			show: true
		}
	}

	const selectedDateRange = $page.url.searchParams.get('chartRange') ?? '7'
	const selecteDataType = $page.url.searchParams.get('chartData') ?? 'count'

	const dateRanges = {
		7: 'Last week',
		30: 'Last 30 days'
	}

	const dataType = {
		count: 'Count',
		value: 'Nominal'
	}
</script>

<div class="px-4 pt-6">
	<div class="grid grid-cols-1 gap-4 2xl:grid-cols-3">
		<div class="w-full 2xl:col-span-2">
			<Card size="xl">
				<div class="mb-5 flex justify-between">
					<div class="flex gap-8">
						<div>
							<Heading tag="h6" color="text-gray-500 dark:text-gray-400" customSize="font-normal">
								Purchases
							</Heading>
							<p class="text-2xl font-bold leading-none text-gray-900 dark:text-white">
								{isNominal
									? defaultCurrencyFormatter.format(
											data.chartData.map((e) => e.purchases).reduce(sum)
										)
									: data.chartData.map((e) => e.purchases).reduce(sum)}
							</p>
						</div>
						<div>
							<Heading tag="h6" color="text-gray-500 dark:text-gray-400" customSize="font-normal">
								Withdraw requests
							</Heading>
							<p class="text-2xl font-bold leading-none text-gray-900 dark:text-white">
								{isNominal
									? defaultCurrencyFormatter.format(
											data.chartData.map((e) => e.withdraws).reduce(sum)
										)
									: data.chartData.map((e) => e.withdraws).reduce(sum)}
							</p>
						</div>
						{#if isNominal}
							<div>
								<Heading tag="h6" color="text-gray-500 dark:text-gray-400" customSize="font-normal">
									Profit
								</Heading>
								<p class="text-2xl font-bold leading-none text-gray-900 dark:text-white">
									{defaultCurrencyFormatter.format(
										data.chartData.map((e) => e.profits).reduce(sum)
									)}
								</p>
							</div>
						{/if}
					</div>
					<div class="flex gap-2">
						<div>
							<Button color="light" class="px-3 py-2">
								{dataType[selecteDataType]}
								<ChevronDownSolid class="ms-1.5 h-2.5 w-2.5" />
							</Button>
							<Dropdown class="w-40">
								{#each Object.keys(dataType) as prop}
									<DropdownItem
										href="?chartData={prop}&chartRange={selectedDateRange}"
										active={$page.url.searchParams.get('chartData') === prop}
										data-sveltekit-reload
									>
										{dataType[prop]}
									</DropdownItem>
								{/each}
							</Dropdown>
						</div>
						<div>
							<Button color="light" class="px-3 py-2">
								{dateRanges[selectedDateRange]}
								<ChevronDownSolid class="ms-1.5 h-2.5 w-2.5" />
							</Button>
							<Dropdown class="w-40">
								{#each Object.keys(dateRanges) as prop}
									<DropdownItem
										href="?chartData={selecteDataType}&chartRange={prop}"
										active={$page.url.searchParams.get('chartRange') === prop}
										data-sveltekit-reload
									>
										{dateRanges[prop]}
									</DropdownItem>
								{/each}
							</Dropdown>
						</div>
					</div>
				</div>
				<Chart options={chartOptions} />
			</Card>
		</div>
		<div class="flex w-full flex-col gap-4">
			<Card size="xl">
				<div class="flex justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
					<dl>
						<dt class="pb-1 text-base font-normal text-gray-500 dark:text-gray-400">Profit</dt>
						<dd class="text-3xl font-bold leading-none text-green-500 dark:text-green-400">
							{profit}
						</dd>
					</dl>
					<div>
						<span
							class="inline-flex items-center rounded-md bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300"
						>
							Withdraw fee: {defaultCurrencyFormatter.format(data.withdrawFee.amount)}
						</span>
					</div>
				</div>

				<div class="grid grid-cols-2 py-3">
					<dl>
						<dt class="pb-1 text-base font-normal text-gray-500 dark:text-gray-400">
							Withdraw requests
						</dt>
						<dd class="text-primary-900 text-xl font-bold leading-none dark:text-white">
							{data.successfulWithdraw.length}
						</dd>
					</dl>
					<dl>
						<dt class="pb-1 text-base font-normal text-gray-500 dark:text-gray-400">
							Total withdrawn
						</dt>
						<dd class="text-xl font-bold leading-none text-green-500 dark:text-green-400">
							{totalWithdrawn}
						</dd>
					</dl>
				</div>
			</Card>
			<div class="grid grid-cols-2 gap-4 2xl:grid-cols-1">
				<Card horizontal>
					<div class="w-full">
						<h3 class="text-base font-normal text-gray-500 dark:text-gray-400">
							Total purchases occured: {`${data.purchasesCount ?? 0}`}
						</h3>
						<span
							class="text-2xl font-bold leading-none text-yellow-500 sm:text-3xl dark:text-yellow-400"
						>
							{totalPurchasesOccured}
						</span>
						<p class="flex items-center text-base font-normal text-gray-500 dark:text-gray-400">
							Success purchases
						</p>
					</div>
				</Card>
				<Card horizontal>
					<div class="w-full">
						<h3 class="text-base font-normal text-gray-500 dark:text-gray-400">
							Total purchase refunded: {`${data.refundedPurchasesCount ?? 0}`}
						</h3>
						<span
							class="text-2xl font-bold leading-none text-red-500 sm:text-3xl dark:text-red-400"
						>
							{totalPurchasesRefunded}
						</span>
					</div>
				</Card>
			</div>
		</div>
	</div>
	<div class="mt-4 grid w-full grid-cols-2 gap-4 xl:grid-cols-4">
		<Card horizontal>
			<div class="w-full">
				<h3 class="text-base font-normal text-gray-500 dark:text-gray-400">Event published</h3>
				<span class="text-2xl font-bold leading-none text-gray-900 sm:text-3xl dark:text-white">
					{data.eventsCount}
				</span>
				<p class="flex items-center text-base font-normal text-gray-500 dark:text-gray-400">
					Published
				</p>
			</div>
		</Card>
		<Card horizontal>
			<div class="w-full">
				<h3 class="text-base font-normal text-gray-500 dark:text-gray-400">Event draft</h3>
				<span class="text-2xl font-bold leading-none text-gray-900 sm:text-3xl dark:text-white">
					{data.draftEventsCount}
				</span>
				<p class="flex items-center text-base font-normal text-gray-500 dark:text-gray-400">
					Needs approval
				</p>
			</div>
		</Card>
		<Card horizontal>
			<div class="w-full">
				<h3 class="text-base font-normal text-gray-500 dark:text-gray-400">Rejected event</h3>
				<span class="text-2xl font-bold leading-none text-red-500 sm:text-3xl dark:text-red-400">
					{data.rejectedEventsCount}
				</span>
			</div>
		</Card>
		<Card horizontal>
			<div class="w-full">
				<h3 class="text-base font-normal text-gray-500 dark:text-gray-400">Activated user count</h3>
				<span class="text-2xl font-bold leading-none text-gray-900 sm:text-3xl dark:text-white">
					{data.userCount}
				</span>
			</div>
		</Card>
	</div>
	<div class="mt-4 w-full">
		<Card size="xl">
			<!-- Card header -->
			<div class="items-center justify-between lg:flex">
				<div class="mb-4 lg:mb-0">
					<Heading tag="h3" class="mb-2">Latest Event Created</Heading>
					<span class="text-base font-normal text-gray-500 dark:text-gray-400">
						This is a list of latest event
					</span>
				</div>
			</div>
			<!-- Table -->
			<div class="mt-6 flex flex-col">
				<div class="overflow-x-auto rounded-lg">
					<div class="inline-block min-w-full align-middle">
						<div class="overflow-hidden shadow sm:rounded-lg">
							<Table striped>
								<TableHead>
									<TableHeadCell>Event Name</TableHeadCell>
									<TableHeadCell>Location</TableHeadCell>
									<TableHeadCell>Owner</TableHeadCell>
									<TableHeadCell>Event Date</TableHeadCell>
									<TableHeadCell padding="px-0">Tickets sold</TableHeadCell>
									<TableHeadCell padding="px-1">Revenue</TableHeadCell>
									<TableHeadCell padding="px-0"></TableHeadCell>
								</TableHead>
								<TableBody>
									{#if data.recentEvents.length}
										{#each data.recentEvents as event}
											<TableBodyRow>
												<TableBodyCell>{event.name}</TableBodyCell>
												<TableBodyCell>{event.location}</TableBodyCell>
												<TableBodyCell>
													<strong>{event.user.username}</strong><br />{event.user.email}
												</TableBodyCell>
												<TableBodyCell>
													{dateTimeFormatterWithoutSeconds.format(new Date(event.date))} -
													{dateTimeFormatterWithoutSeconds.format(
														event.endDate ? new Date(new Date()) : new Date(event.date)
													)}
												</TableBodyCell>
												<TableBodyCell tdClass="px-0">
													{event.tickets.map((e) => e._count.purchases).reduce((p, c) => p + c)}
												</TableBodyCell>
												<TableBodyCell tdClass="px-1">
													{defaultCurrencyFormatter.format(
														event.tickets
															.map((e) => {
																return e.purchases.map((e) => e.price).reduce((p, c) => p + c, 0)
															})
															.reduce((p, c) => p + c)
													)}
												</TableBodyCell>
												<TableBodyCell tdClass="px-1">
													<Button href="/admin/event/{event.id}" pill size="sm">Detail</Button>
												</TableBodyCell>
											</TableBodyRow>
										{/each}
									{:else}
										<TableBodyRow>
											<td colspan="7">
												<div class="flex h-64">
													<span class="m-auto text-center text-xl font-bold">Not available</span>
												</div>
											</td>
										</TableBodyRow>
									{/if}
								</TableBody>
							</Table>
						</div>
					</div>
				</div>
			</div>
			<!-- Card Footer -->
			<div class="flex items-center justify-end pt-3 sm:pt-6">
				<div class="flex-shrink-0">
					<a
						href="/admin/event?status=PUBLISHED"
						class="text-primary-700 dark:text-primary-500 inline-flex items-center rounded-lg p-2 text-xs font-medium uppercase hover:bg-gray-100 sm:text-sm dark:hover:bg-gray-700"
					>
						Events
						<ChevronRightSolid class="ms-1.5 h-2.5 w-2.5" />
					</a>
				</div>
			</div>
		</Card>
	</div>
</div>
