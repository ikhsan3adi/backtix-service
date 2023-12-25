import { redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const prerender = true

export const load = (async () => {
	throw redirect(303, '/auth/login')
}) satisfies PageLoad
