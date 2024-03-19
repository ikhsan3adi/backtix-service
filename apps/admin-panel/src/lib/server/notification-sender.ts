import type { $Enums } from '@prisma/client'
import { defaultCurrencyFormatter } from '../formatter/currency.formatter'

export async function sendWithdrawRequestNotification(params: {
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
