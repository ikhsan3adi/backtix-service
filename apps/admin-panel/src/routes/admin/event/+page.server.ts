import type { $Enums } from '@prisma/client'
import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

const perPage = 20

export const load = (async ({ url }) => {
	const status = url.searchParams.get('status')
	const deleted = url.searchParams.get('deleted')
	const page = Number(url.searchParams.get('page'))

	const events = await prisma.event.findMany({
		where: {
			status: status ? (status as $Enums.EventStatus) : undefined,
			deletedAt: deleted === 'true' ? { not: null } : null
		},
		include: { user: true },
		skip: page * perPage,
		take: perPage,
		orderBy: { updatedAt: 'desc' }
	})

	return { events, status, deleted, page }
}) satisfies PageServerLoad

export const actions: Actions = {
	approve: async ({ request }) => {
		const { selectedIds } = Object.fromEntries(await request.formData()) as {
			selectedIds: string
		}

		const eventIds = selectedIds ? selectedIds.split(',') : []

		await prisma.event.updateMany({
			where: { id: { in: eventIds } },
			data: { status: 'PUBLISHED' }
		})

		redirect(303, '/admin/event?status=PUBLISHED')
	},

	reject: async ({ request }) => {
		const { selectedIds } = Object.fromEntries(await request.formData()) as {
			selectedIds: string
		}

		const eventIds = selectedIds ? selectedIds.split(',') : []

		await prisma.event.updateMany({
			where: { id: { in: eventIds } },
			data: { status: 'REJECTED' }
		})

		redirect(303, '/admin/event?status=REJECTED')
	}
}
