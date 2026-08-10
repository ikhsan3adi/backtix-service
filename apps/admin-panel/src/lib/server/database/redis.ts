import { config } from '$lib/config'
import { createClient } from 'redis'
import type { RedisClientType } from 'redis'

let connected = false

export const redisClient: RedisClientType = createClient({
	socket: {
		host: config.redis.host,
		port: config.redis.port,
		connectTimeout: 3000
	}
})

redisClient.on('error', function () {})

export async function ensureRedisConnected() {
	if (!connected && !redisClient.isOpen) {
		try {
			await redisClient.connect()
			connected = true
		} catch {
			// Redis unavailable (build time / no server)
		}
	}
}
