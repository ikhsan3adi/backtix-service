import type { $Enums } from '@prisma/client'
import { fail } from '@sveltejs/kit'
import { defaultCurrencyFormatter } from '../../../lib/formatter/currency.formatter'
import type { Actions, PageServerLoad } from './$types'

const perPage = 20

export const load = (async ({ url }) => {
	const status = url.searchParams.get('status') as $Enums.WithdrawRequestStatus
	const page = Number(url.searchParams.get('page'))

	const withdraws = await prisma.withdrawRequest.findMany({
		where: { status: status ?? undefined },
		include: { user: true },
		skip: page * perPage,
		take: perPage
	})

	const withdrawalFee = (await prisma.withdrawFee.findFirst({ where: { id: 0 } })).amount ?? 0

	return { withdraws, status, page, withdrawalFee }
}) satisfies PageServerLoad

export const actions: Actions = {
	confirm: async ({ request }) => {
		try {
			const { id } = Object.fromEntries(await request.formData()) as {
				id: string
			}

			const withdrawRequest = await prisma.withdrawRequest.update({
				where: { id },
				data: { status: 'COMPLETED' }
			})

			await sendNotification(withdrawRequest)

			return { success: true, message: 'Successful confirmation' }
		} catch (e) {
			console.error(e)

			return fail(500, { success: false, message: 'Unknown error' })
		}
	},
	reject: async ({ request }) => {
		try {
			const { id } = Object.fromEntries(await request.formData()) as {
				id: string
			}

			const withdrawRequest = await prisma.$transaction(async (tx) => {
				const [{ amount: withdrawalFee }, wd] = await Promise.all([
					tx.withdrawFee.findFirst({ where: { id: 0 } }),
					tx.withdrawRequest.update({
						where: { id },
						data: { status: 'REJECTED' }
					})
				])

				await tx.userBalance.update({
					where: { userId: wd.userId },
					data:
						wd.from === 'BALANCE'
							? { balance: { increment: wd.amount + withdrawalFee } }
							: { revenue: { increment: wd.amount + withdrawalFee } }
				})

				return wd
			})

			await sendNotification(withdrawRequest)

			return { success: true, message: 'Successfully resisted withdrawal' }
		} catch (e) {
			console.error(e)

			return fail(500, { success: false, message: 'Unknown error' })
		}
	},
	cancel: async ({ request }) => {
		try {
			const { id } = Object.fromEntries(await request.formData()) as {
				id: string
			}

			const withdrawRequest = await prisma.$transaction(async (tx) => {
				const withdrawalFee = (await prisma.withdrawFee.findFirst({ where: { id: 0 } })).amount ?? 0

				const { status } = await tx.withdrawRequest.findUniqueOrThrow({
					where: { id },
					select: { status: true }
				})
				const wd = await tx.withdrawRequest.update({
					where: { id },
					data: { status: 'PENDING' }
				})
				const { userId, from, amount } = wd
				if (status === 'REJECTED') {
					const { balance, revenue } = await tx.userBalance.findUniqueOrThrow({
						where: { userId },
						select: { balance: true, revenue: true }
					})
					const totalAmount = amount + withdrawalFee
					if (from === 'BALANCE') {
						await tx.userBalance.update({
							where: { userId },
							data: { balance: totalAmount <= balance ? { decrement: totalAmount } : { set: 0 } }
						})
					} else {
						await tx.userBalance.update({
							where: { userId },
							data: { revenue: totalAmount <= revenue ? { decrement: totalAmount } : { set: 0 } }
						})
					}
				}

				return wd
			})

			await sendNotification(withdrawRequest)

			return { success: true, message: 'Successfully undo withdrawal status' }
		} catch (e) {
			console.error(e)

			return fail(500, { success: false, message: 'Unknown error' })
		}
	}
}

async function sendNotification(params: {
	userId: string
	amount: number
	id: string
	from: string
	method: string
	status: string
}) {
	const { userId, amount, id, method, from, status } = params

	return await prisma.notification.create({
		data: {
			userId,
			message: `Withdraw: ${method} ${defaultCurrencyFormatter.format(
				amount
			)} from ${from}. Status: ${status}`,
			type: 'WITHDRAW_STATUS',
			entityType: 'WITHDRAW_REQUEST',
			entityId: id,
			reads: { create: { userId } }
		}
	})
}
