import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load = (async ({ cookies }) => {
	cookies.delete('accessToken', { path: '/', httpOnly: true, sameSite: 'strict' })
	cookies.delete('refreshToken', { path: '/', httpOnly: true, sameSite: 'strict' })

	redirect(303, '/')
}) satisfies PageServerLoad
