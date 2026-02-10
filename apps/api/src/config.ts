import 'dotenv/config'

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  googleTranslateApiKey: process.env.GOOGLE_TRANSLATE_API_KEY,
  deeplApiKey: process.env.DEEPL_API_KEY,
  scrape: {
    intervalMinutes: parseInt(process.env.SCRAPE_INTERVAL_MINUTES || '5', 10),
    userAgent:
      process.env.SCRAPE_USER_AGENT ||
      'BookRankingBot/1.0 (+https://book-ranking.app/bot)',
  },
} as const
