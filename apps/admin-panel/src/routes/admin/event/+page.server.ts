import type { $Enums } from '@prisma/client'
import type { PageServerLoad } from './$types'

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
		take: perPage
	})

	return { events, status, deleted, page }
}) satisfies PageServerLoad
