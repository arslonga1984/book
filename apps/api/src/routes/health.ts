import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../db/prisma.js'

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
}
