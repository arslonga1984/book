import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../db/prisma.js'
import { runAllScrapers } from '../scrapers/index.js'

let scraping = false

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => {
    let dbStatus = 'ok'

    try {
      await prisma.$queryRaw`SELECT 1`
    } catch {
      dbStatus = 'error'
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
      },
    }
  })

  app.post('/scrape', async (_request, reply) => {
    if (scraping) {
      return reply.status(409).send({ success: false, error: 'Scraping already in progress' })
    }
    scraping = true
    runAllScrapers()
      .then(() => { scraping = false })
      .catch(() => { scraping = false })
    return { success: true, message: 'Scraping started' }
  })
}
