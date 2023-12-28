import { config } from '$lib/config'
import { redisClient } from '$lib/server/database/redis'
import { Group } from '$lib/server/entities/users/group.enum'
import { fail, redirect } from '@sveltejs/kit'
import { compare } from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { Actions, PageServerLoad, RequestEvent } from './$types'

export const load = (async () => {
	return {}
}) satisfies PageServerLoad

export const actions: Actions = {
	default: async (event: RequestEvent) => {
		const { username, password } = Object.fromEntries(await event.request.formData()) as {
			username: string
			password: string
		}

		const user = await prisma.user.findUnique({
			where: {
				username,
				groups: { hasSome: [Group.ADMIN, Group.SUPERADMIN] }
			}
		})

		if (!user) return fail(404, { message: 'User not found', username })

		const passwordValid = await validatePassword(password, user.password)

		if (!passwordValid) return fail(401, { message: 'Wrong password', username })

		const refreshToken = jwt.sign(
			{ sub: user.id, username: user.username, email: user.email },
			config.security.refreshTokenKey!,
			{ expiresIn: config.security.refreshTokenExpiration }
		)
		const accessToken = jwt.sign(
			{ sub: user.id, username: user.username, email: user.email },
			config.security.accessTokenKey!,
			{ expiresIn: config.security.accessTokenExpiration }
		)
		event.cookies.set('refreshToken', refreshToken, {
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 30,
			sameSite: 'strict',
			path: '/'
		})
		event.cookies.set('accessToken', accessToken, {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
			sameSite: 'strict',
			path: '/'
		})
		// Save refresh token to cache
		await redisClient.set(refreshToken, JSON.stringify({ id: user.id }), {
			EX: config.security.refreshTokenTTL
		})

		return redirect(303, '/admin')
	}
}

function validatePassword(password: string, hashedPassword: string): Promise<boolean> {
	return compare(password, hashedPassword)
}
