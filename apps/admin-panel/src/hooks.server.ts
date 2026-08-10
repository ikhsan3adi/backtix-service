import { config } from '$lib/config'
import { prisma } from '$lib/server/database/prisma'
import { redisClient, ensureRedisConnected } from '$lib/server/database/redis'
import { Group } from '$lib/server/entities/users/group.enum'
import { redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import jwt from 'jsonwebtoken'

async function checkAccessToken({ event, resolve }: Parameters<Handle>[0]) {
	await ensureRedisConnected()
	try {
		const accessToken = event.cookies.get('accessToken')

		const claims = accessToken
			? jwt.verify(accessToken!, config.security.accessTokenKey!, { ignoreExpiration: false })
			: undefined

		if (accessToken && claims) {
			const cachedUser = await redisClient.get(claims['sub'] as string)

			const user = cachedUser
				? JSON.parse(cachedUser as string)
				: await prisma.user.findUnique({
						where: {
							id: claims['sub'] as string,
							groups: { hasSome: [Group.ADMIN, Group.SUPERADMIN] }
						}
					})

			if (!cachedUser) await redisClient.set(user.id, JSON.stringify(user), { EX: 60 })

			if (!user || !(user.groups as string[]).some((v) => v.includes(Group.ADMIN))) {
				return await resolve(event)
			}
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { password, ...userWithoutPassword } = user
			event.locals.user = userWithoutPassword
		} else {
			event.locals.user = undefined
		}
		return await resolve(event)
	} catch {
		return await resolve(event)
	}
}

async function checkRefreshToken({ event, resolve }: Parameters<Handle>[0]) {
	try {
		if (!event.locals.user) {
			const refreshToken = event.cookies.get('refreshToken')

			const claims = refreshToken
				? jwt.verify(refreshToken!, config.security.refreshTokenKey!)
				: undefined

			const savedAuth = await redisClient.get(refreshToken ?? '')

			if (refreshToken && claims && savedAuth) {
				const { id } = JSON.parse(savedAuth as string) as { id: string }

				const user = await prisma.user.findUnique({
					where: { id }
				})

				if (!user) return await resolve(event)
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { password, ...userWithoutPassword } = user
				event.locals.user = userWithoutPassword

				const accessToken = jwt.sign(
					{ sub: user.id, username: user.username, email: user.email },
					config.security.accessTokenKey!,
					{ expiresIn: config.security.accessTokenExpiration ?? '15m' }
				)
				event.cookies.set('accessToken', accessToken, {
					httpOnly: true,
					maxAge: 60 * 60 * 24,
					sameSite: 'strict',
					path: '/'
				})
			}
		}
		return await resolve(event)
	} catch (e) {
		console.error(e)

		return await resolve(event)
	}
}

async function protectRoutes({ event, resolve }: Parameters<Handle>[0]) {
	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user) {
			return redirect(303, '/auth')
		}
	}

	return await resolve(event)
}

export const handle = sequence(checkAccessToken, checkRefreshToken, protectRoutes)
