import { config } from '$lib/config'
import { redisClient } from '$lib/server/database/redis'
import { fail, redirect } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'
import type { Actions, PageServerLoad, RequestEvent } from './$types'

export const load = (async () => {
	return {}
}) satisfies PageServerLoad

export const actions: Actions = {
	default: async (event: RequestEvent) => {
		const data = await event.request.formData()
		const otp = data.get('otp') as string

		if (!otp || otp.length < 6) {
			return fail(400, { message: 'OTP length must be 6 character' })
		}

		// verify otp
		try {
			const response = await event.fetch(`${config.server.baseUrl}api/auth/admin/login`, {
				method: 'PATCH',
				headers: {
					'content-type': 'application/json',
					'user-agent': 'Admin-Panel'
				},
				body: JSON.stringify({ otp })
			})

			const json = (await response.json()) as {
				accessToken: string
				refreshToken: string
				statusCode?: number
				message?: string
			}

			if (response.status > 299) return fail(json.statusCode, { message: json.message })

			const { sub } = jwt.verify(json.refreshToken, config.security.refreshTokenKey!)

			// Save refresh token to cache
			await redisClient.set(json.refreshToken, JSON.stringify({ id: sub }), {
				EX: config.security.refreshTokenTTL
			})
			event.cookies.set('refreshToken', json.refreshToken, {
				httpOnly: true,
				maxAge: 60 * 60 * 24 * 30,
				sameSite: 'strict',
				path: '/'
			})
			event.cookies.set('accessToken', json.accessToken, {
				httpOnly: true,
				maxAge: 60 * 60 * 24,
				sameSite: 'strict',
				path: '/'
			})
		} catch (e) {
			console.error(e)
			return fail(500, { message: 'Unknown Error' })
		}
		return redirect(303, '/admin')
	}
}
