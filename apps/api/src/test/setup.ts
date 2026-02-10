import { vi } from 'vitest'

// Mock Prisma client for all tests
vi.mock('../db/prisma.js', () => ({
  prisma: {
    country: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    book: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      upsert: vi.fn(),
    },
    ranking: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
    },
    author: {
      findUnique: vi.fn(),
    },
    scrapeLog: {
      create: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}))

// Mock config
vi.mock('../config.js', () => ({
  config: {
    port: 3000,
    host: '0.0.0.0',
    nodeEnv: 'test',
    databaseUrl: '',
    redisUrl: 'redis://localhost:6379',
    scrape: {
      intervalMinutes: 5,
      userAgent: 'TestBot/1.0',
    },
  },
}))
