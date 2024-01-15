import type { $Enums } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { fail } from '@sveltejs/kit'
import { userImageUrl } from '../../../lib/config'
import type { Actions, PageServerLoad } from './$types'

const perPage = 20

export const load = (async ({ url, locals }) => {
	const group = url.searchParams.get('group') as $Enums.UserGroup
	const deleted = url.searchParams.get('deleted')
	const page = Number(url.searchParams.get('page'))

	const users = (
		await prisma.user.findMany({
			where: {
				groups: group ? { has: group } : undefined,
				deletedAt: deleted ? (deleted === 'true' ? { not: null } : null) : undefined
			},
			skip: page * perPage,
			take: perPage
		})
	).map((e) => ({ ...e, image: e.image ? userImageUrl(e.image) : undefined }))

	return { users, group, deleted, page, my: locals.user }
}) satisfies PageServerLoad

export const actions: Actions = {
	edit: async ({ request }) => {
		try {
			const { id, group, activated, ...data } = Object.fromEntries(await request.formData()) as {
				id: string
				username: string
				email: string
				fullname: string
				location: string
				activated: string
				group: string
			}

			const groups = group.split(',') as $Enums.UserGroup[]

			await prisma.user.update({
				where: { id },
				data: { ...data, groups, activated: activated === 'true' }
			})

			return { success: true, message: 'User edit success.' }
		} catch (e) {
			if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
				return fail(409, { success: false, message: 'Username/Email has been registered' })
			}

			console.error(e)

			return fail(500, { success: false, message: 'Unknown error' })
		}
	},
	delete: async ({ request }) => {
		try {
			const { id } = Object.fromEntries(await request.formData()) as {
				id: string
			}

			await prisma.user.update({
				where: { id },
				data: {
					id: `${id}_|_DELETED`,
					deletedAt: { set: new Date().toISOString() }
				}
			})

			return { success: true, message: 'User delete success.' }
		} catch (e) {
			console.error(e)

			return fail(500, { success: false, message: 'Unknown error' })
		}
	},
	restore: async ({ request }) => {
		try {
			const { id } = Object.fromEntries(await request.formData()) as {
				id: string
			}

			await prisma.user.update({
				where: { id },
				data: {
					id: id.split('_|_')[0],
					deletedAt: null
				}
			})

			return { success: true, message: 'User restore success.' }
		} catch (e) {
			console.error(e)

			return fail(500, { success: false, message: 'Unknown error' })
		}
	}
	// deletePermanent: async ({ request }) => {
	// 	try {
	// 		const { id } = Object.fromEntries(await request.formData()) as {
	// 			id: string
	// 		}

	// 		await prisma.$transaction([
	// 			prisma.userBalance.delete({ where: { userId: id } }),
	// 			prisma.user.delete({ where: { id } })
	// 		])

	// 		return { success: true, message: 'Successfully delete user permanently.' }
	// 	} catch (e) {
	// 		console.error(e)

	// 		return fail(500, { success: false, message: 'Unknown error' })
	// 	}
	// }
}
