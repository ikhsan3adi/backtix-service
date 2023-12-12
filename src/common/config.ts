import * as dotenv from 'dotenv'

dotenv.config()

export const config = {
  server: {
    host: process.env.HOST,
    port: Number(process.env.PORT),
  },
  security: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION,
    refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION,
    refreshTokenTTL: Number(process.env.REFRESH_TOKEN_TTL) ?? 60 * 60 * 24 * 30,
    bcryptSaltOrRound: 10,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    ttl: Number(process.env.REDIS_TTL) ?? 60 * 60 * 24 * 7,
  },
  storage: {
    uploadsPath: 'uploads',
  },
}
