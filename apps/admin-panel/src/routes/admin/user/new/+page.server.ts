import { config } from '$lib/config'
import type { $Enums } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { error, fail, redirect } from '@sveltejs/kit'
import { hash } from 'bcrypt'
import type { Actions, PageServerLoad } from './$types'

export const load = (async ({ locals }) => {
	if (!locals.user.groups.includes('SUPERADMIN')) {
		throw error(403, 'Forbidden')
	}
	return {}
}) satisfies PageServerLoad

export const actions: Actions = {
	default: async ({ request }) => {
		const { password, confirm_password, ...form } = Object.fromEntries(
			await request.formData()
		) as {
			username: string
			email: string
			fullname: string
			location: string
			activate: string
			group: string
			password: string
			confirm_password: string
		}

		const { group, activate, ...data } = form

		try {
			if (confirm_password !== password) {
				return fail(400, {
					success: false,
					message: "Password confirmation doesn't match",
					...form
				})
			}

			const groups = group ? (group.split(',') as $Enums.UserGroup[]) : undefined

			await prisma.user.create({
				data: {
					...data,
					groups,
					activated: activate === 'true',
					password: await hash(password, config.security.bcryptSaltOrRound)
				}
			})
		} catch (e) {
			if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
				return fail(409, { success: false, message: 'Username/Email has been registered', ...form })
			}

			console.error(e)

			return fail(500, { success: false, message: 'Unknown error', ...form })
		}
		return redirect(303, encodeURI('/admin/user?success=true&message=New User Added Succesfully'))
	}
}
