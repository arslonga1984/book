import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from '../test/helpers.js'
import { healthRoutes } from './health.js'
import { prisma } from '../db/prisma.js'

const mockPrisma = vi.mocked(prisma)

describe('GET /api/v1/health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return ok when database is healthy', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ 1: 1 }])

    const app = await buildApp(healthRoutes, '/api/v1')
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    })

    const body = response.json()
    expect(response.statusCode).toBe(200)
    expect(body.status).toBe('ok')
    expect(body.services.database).toBe('ok')
    expect(body.timestamp).toBeDefined()
  })

  it('should return error when database is down', async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error('Connection failed'))

    const app = await buildApp(healthRoutes, '/api/v1')
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    })

    const body = response.json()
    expect(response.statusCode).toBe(200)
    expect(body.status).toBe('ok')
    expect(body.services.database).toBe('error')
  })
})
