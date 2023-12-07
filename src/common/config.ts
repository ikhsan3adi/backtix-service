export const config = {
  security: {
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    refreshTokenKey: process.env.REFRESH_TOKEN_KEY,
    accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRATION,
    refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRATION,
    refreshTokenTTL: Number(process.env.REFRESH_TOKEN_TTL),
    bcryptSaltOrRound: 10,
  },
}
