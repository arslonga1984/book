import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { config } from './config.js'
import { booksRoutes } from './routes/books.js'
import { rankingsRoutes } from './routes/rankings.js'
import { authorsRoutes } from './routes/authors.js'
import { healthRoutes } from './routes/health.js'
import { startCronJobs } from './jobs/scheduler.js'

const app = Fastify({
  logger: {
    level: config.nodeEnv === 'development' ? 'debug' : 'info',
  },
})

async function bootstrap() {
  // Plugins
  await app.register(cors, {
    origin: true,
  })

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  // Routes
  await app.register(healthRoutes, { prefix: '/api/v1' })
  await app.register(booksRoutes, { prefix: '/api/v1/books' })
  await app.register(rankingsRoutes, { prefix: '/api/v1/rankings' })
  await app.register(authorsRoutes, { prefix: '/api/v1/authors' })

  // Start cron jobs
  if (config.nodeEnv === 'production') {
    startCronJobs()
  }

  // Start server
  try {
    await app.listen({ port: config.port, host: config.host })
    console.log(`Server running at http://${config.host}:${config.port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

bootstrap()
