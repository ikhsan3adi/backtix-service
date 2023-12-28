import { config } from '$lib/config'
import type { $Enums } from '@prisma/client'
import { fail } from '@sveltejs/kit'
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

	return { withdraws, status, page, adminFee: config.payment.withdrawalFees }
}) satisfies PageServerLoad

export const actions: Actions = {
	confirm: async ({ request }) => {
		try {
			const { id } = Object.fromEntries(await request.formData()) as {
				id: string
			}

			await prisma.withdrawRequest.update({
				where: { id },
				data: { status: 'COMPLETED' }
			})

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

			await prisma.$transaction(async (tx) => {
				const { userId, from, amount } = await tx.withdrawRequest.update({
					where: { id },
					data: { status: 'REJECTED' }
				})

				await tx.userBalance.update({
					where: { userId },
					data:
						from === 'BALANCE'
							? { balance: { increment: amount + config.payment.withdrawalFees } }
							: { revenue: { increment: amount + config.payment.withdrawalFees } }
				})
			})

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

			await prisma.$transaction(async (tx) => {
				const { status } = await tx.withdrawRequest.findUniqueOrThrow({
					where: { id },
					select: { status: true }
				})
				const { userId, from, amount } = await tx.withdrawRequest.update({
					where: { id },
					data: { status: 'PENDING' }
				})

				if (status === 'REJECTED') {
					const { balance, revenue } = await tx.userBalance.findUniqueOrThrow({
						where: { userId },
						select: { balance: true, revenue: true }
					})
					const totalAmount = amount + config.payment.withdrawalFees
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
			})

			return { success: true, message: 'Successfully undo withdrawal status' }
		} catch (e) {
			console.error(e)

			return fail(500, { success: false, message: 'Unknown error' })
		}
	}
}
