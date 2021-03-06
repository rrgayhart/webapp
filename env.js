module.exports = {
  APP_DEBUG: (process.env.APP_DEBUG === 'true'),
  AUTH_CLIENT_ID: process.env.AUTH_CLIENT_ID,
  AUTH_DOMAIN: process.env.AUTH_DOMAIN,
  LOGO_MARK: process.env.LOGO_MARK,
  PROMO_HOST: process.env.PROMO_HOST,
  PORT: (process.env.PORT || '6660'),
  SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY,
  USE_LOCAL_EMOJI: (process.env.USE_LOCAL_EMOJI === 'true'),
  ENABLE_REFRESH_ON_FOCUS: (process.env.ENABLE_REFRESH_ON_FOCUS === 'true'),
}

