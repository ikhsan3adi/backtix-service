import { shortDateTimeFormatter } from '$lib/formatter/date-time.formatter'
import { redisClient } from '$lib/server/database/redis'
import type { PageServerLoad } from './$types'

export const load = (async ({ url }) => {
	const chartDateRange = Number(url.searchParams.get('chartRange') ?? 7)
	const chartDataType = url.searchParams.get('chartData') ?? 'count'

	const [
		chartData,
		successfulWithdraw,
		eventsCount,
		draftEventsCount,
		rejectedEventsCount,
		purchases,
		refundedPurchases,
		purchasesCount,
		refundedPurchasesCount,
		recentEvents,
		userCount,
		withdrawFee
	] = await Promise.all([
		getChartData(chartDateRange, chartDataType as 'count' | 'value'),
		getSuccessfulWithdraw(),
		getEventsCount(),
		getDraftEventsCount(),
		getRejectedEventsCount(),
		getPurchases(),
		getRefundedPurchases(),
		getPurchasesCount(),
		getRefundedPurchasesCount(),
		getRecentEvents(),
		getUsersCount(),
		prisma.withdrawFee.findFirst({ where: { id: 0 } })
	])

	return {
		chartData,
		successfulWithdraw,
		eventsCount,
		draftEventsCount,
		rejectedEventsCount,
		purchasesCount,
		purchases,
		refundedPurchases,
		refundedPurchasesCount,
		recentEvents,
		userCount,
		withdrawFee
	}
}) satisfies PageServerLoad

const keys = {
	chartDataCount: (dateRange: number) => `ChartDataCount-${dateRange}`,
	chartData: (dateRange: number) => `ChartData-${dateRange}`,
	successfulWithdraw: 'SuccessfulWithdraw',
	eventsCount: 'EventsCount',
	draftEventsCount: 'DraftEventsCount',
	rejectedEventsCount: 'RejectedEventsCount',
	purchasesCount: 'PurchasesCount',
	purchases: 'Purchases',
	refundedPurchasesCount: 'RefundedPurchasesCount',
	refundedPurchases: 'RefundedPurchases',
	recentEvents: 'RecentEvents',
	usersCount: 'UsersCount'
}

async function getChartData(dateRange = 7, type: 'count' | 'value') {
	const cached = await redisClient.get(
		type === 'count' ? keys.chartDataCount(dateRange) : keys.chartData(dateRange)
	)

	if (!cached) {
		const data = await Promise.all(
			[...Array(dateRange)]
				.map((_, i) => {
					const date = new Date()

					const current = new Date(date.setDate(date.getDate() - i))
					current.setHours(0)

					const next = new Date(current)
					next.setHours(24)

					return { current, next }
				})
				.map(async ({ current, next }) => {
					if (type === 'count') {
						const [purchases, withdraws] = await Promise.all([
							prisma.purchase.count({
								where: {
									updatedAt: { gte: current, lt: next },
									status: 'COMPLETED'
								}
							}),
							prisma.withdrawRequest.count({
								where: {
									updatedAt: { gte: current, lt: next },
									status: 'COMPLETED'
								}
							})
						])

						return { date: shortDateTimeFormatter.format(current), purchases, withdraws }
					} else {
						const [purchases, withdraws] = await Promise.all([
							prisma.purchase.aggregate({
								where: {
									updatedAt: { gte: current, lt: next },
									status: 'COMPLETED'
								},
								_sum: { price: true }
							}),
							prisma.withdrawRequest.aggregate({
								where: {
									updatedAt: { gte: current, lt: next },
									status: 'COMPLETED'
								},
								_sum: { amount: true, fee: true }
							})
						])

						return {
							date: shortDateTimeFormatter.format(current),
							purchases: purchases._sum.price,
							withdraws: withdraws._sum.amount,
							profits: withdraws._sum.fee
						}
					}
				})
		)

		await redisClient.set(
			type === 'count' ? keys.chartDataCount(dateRange) : keys.chartData(dateRange),
			JSON.stringify(data),
			{ EX: 900 }
		)

		return data
	}

	return JSON.parse(cached) as {
		date: string
		purchases: number
		withdraws: number
		profits?: number
	}[]
}

async function getSuccessfulWithdraw() {
	const cached = await redisClient.get(keys.successfulWithdraw)

	if (!cached) {
		const successfulWithdraw = await prisma.withdrawRequest.findMany({
			where: { status: 'COMPLETED' }
		})

		await redisClient.set(keys.successfulWithdraw, JSON.stringify(successfulWithdraw), { EX: 500 })

		return successfulWithdraw
	}

	return JSON.parse(cached) as Record<string, never>[]
}

async function getEventsCount() {
	const cached = await redisClient.get(keys.eventsCount)

	if (!cached) {
		const events = await prisma.event.count({
			where: {
				status: 'PUBLISHED'
			}
		})

		await redisClient.set(keys.eventsCount, JSON.stringify(events), { EX: 300 })

		return events
	}

	return JSON.parse(cached) as number
}

async function getDraftEventsCount() {
	const cached = await redisClient.get(keys.draftEventsCount)

	if (!cached) {
		const events = await prisma.event.count({
			where: { status: 'DRAFT' }
		})

		await redisClient.set(keys.draftEventsCount, JSON.stringify(events), { EX: 300 })

		return events
	}

	return JSON.parse(cached) as number
}

async function getRejectedEventsCount() {
	const cached = await redisClient.get(keys.draftEventsCount)

	if (!cached) {
		const events = await prisma.event.count({
			where: { status: 'REJECTED' }
		})

		await redisClient.set(keys.draftEventsCount, JSON.stringify(events), { EX: 300 })

		return events
	}

	return JSON.parse(cached) as number
}

async function getPurchasesCount() {
	const cached = await redisClient.get(keys.purchasesCount)

	if (!cached) {
		const purchases = await prisma.purchase.count({
			where: { status: 'COMPLETED' }
		})

		await redisClient.set(keys.purchasesCount, JSON.stringify(purchases), { EX: 300 })

		return purchases
	}

	return JSON.parse(cached) as number
}

async function getRefundedPurchasesCount() {
	const cached = await redisClient.get(keys.refundedPurchasesCount)

	if (!cached) {
		const purchases = await prisma.purchase.count({
			where: { refundStatus: 'REFUNDED' }
		})

		await redisClient.set(keys.refundedPurchasesCount, JSON.stringify(purchases), { EX: 300 })

		return purchases
	}

	return JSON.parse(cached) as number
}

async function getPurchases() {
	const cached = await redisClient.get(keys.purchases)

	if (!cached) {
		const purchases = await prisma.purchase.findMany({
			where: { status: 'COMPLETED' },
			select: { price: true }
		})

		await redisClient.set(keys.purchases, JSON.stringify(purchases), { EX: 500 })

		return purchases
	}

	return JSON.parse(cached) as Record<string, never>[]
}

async function getRefundedPurchases() {
	const cached = await redisClient.get(keys.refundedPurchases)

	if (!cached) {
		const purchases = await prisma.purchase.findMany({
			where: { refundStatus: 'REFUNDED' },
			select: { price: true }
		})

		await redisClient.set(keys.refundedPurchases, JSON.stringify(purchases), { EX: 500 })

		return purchases
	}

	return JSON.parse(cached) as Record<string, never>[]
}

async function getRecentEvents() {
	const cached = await redisClient.get(keys.recentEvents)

	if (!cached) {
		const recentEvents = await prisma.event.findMany({
			where: {
				status: 'PUBLISHED'
			},
			include: {
				user: true,
				tickets: {
					include: {
						purchases: {
							where: { status: 'COMPLETED' },
							select: { price: true }
						},
						_count: {
							select: {
								purchases: {
									where: { AND: { status: 'COMPLETED' } }
								}
							}
						}
					}
				}
			},
			orderBy: { createdAt: 'desc' },
			take: 10
		})

		await redisClient.set(keys.recentEvents, JSON.stringify(recentEvents), { EX: 500 })

		return recentEvents
	}

	return JSON.parse(cached) as Record<string, never>[]
}

async function getUsersCount() {
	const cached = await redisClient.get(keys.usersCount)

	if (!cached) {
		const users = await prisma.user.count({
			where: { activated: true, deletedAt: null, groups: { has: 'USER' } }
		})

		await redisClient.set(keys.usersCount, JSON.stringify(users), { EX: 300 })

		return users
	}

	return JSON.parse(cached) as number
}
