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
    refreshTokenTTL: Number(
      process.env.REFRESH_TOKEN_TTL ?? 60 * 60 * 24 * 30 * 1000,
    ),
    bcryptSaltOrRound: 10,
    otpTTL: Number(process.env.OTP_TTL ?? 300 * 1000),
    otpPrefix: 'otp-',
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}auth/google/callback`,
    },
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
  smtp: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    address: process.env.MAIL_ADDRESS,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM,
  },
  storage: {
    uploadsPath: 'uploads',
    eventImagePath: 'uploads/events',
    ticketImagePath: 'uploads/tickets',
  },
  fileStream: {
    baseUrl: process.env.STORAGE_BASE_URL ?? `${process.env.BASE_URL}file/`,
    eventImageUrlPath: 'events',
    ticketImageUrlPath: 'tickets',
  },
  payment: {
    url: process.env.MIDTRANS_URL,
    authString: process.env.MIDTRANS_SERVER_KEY,
  },
}
