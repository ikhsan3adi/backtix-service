import { config } from '@backtix-service/config'
import { createClient } from 'redis'

export const redisClient = createClient({
	socket: {
		host: config.redis.host,
		port: config.redis.port
	}
})

redisClient.on('error', function (err) {
	return new Response(JSON.stringify({ err }))
})

await redisClient.connect()
