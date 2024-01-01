import { config } from '$lib/config'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad, RequestEvent } from './$types'

export const load = (async () => {
	return {}
}) satisfies PageServerLoad

export const actions: Actions = {
	default: async (event: RequestEvent) => {
		const data = await event.request.formData()
		const email = data.get('email') as string

		if (!email || email.length < 5) {
			return fail(400, { message: 'Invalid email' })
		}

		// validate email & sending otp
		try {
			const response = await event.fetch(`${config.server.baseUrl}api/auth/admin/login`, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					'user-agent': 'Admin-Panel'
				},
				body: JSON.stringify({ email })
			})
			const json = await response.json()
			console.log(json)

			if (response.status > 299) return fail(json.statusCode, { message: json.message })
		} catch (e) {
			console.error(e)
			return fail(500, { message: 'Error' })
		}

		redirect(303, `/auth/email/otp?email=${email}`)
	}
}
