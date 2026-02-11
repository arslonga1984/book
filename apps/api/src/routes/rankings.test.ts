import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from '../test/helpers.js'
import { rankingsRoutes } from './rankings.js'
import { prisma } from '../db/prisma.js'
import { clearAllCache } from '../utils/cache.js'

const mockPrisma = vi.mocked(prisma)

const mockCountry = {
  id: 1,
  code: 'KR',
  nameKo: '한국',
  nameEn: 'South Korea',
  nameZh: '韩国',
  nameJa: '韓国',
  bookstoreName: 'YES24',
  bookstoreUrl: 'https://www.yes24.com',
  flag: 'X',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const today = new Date()
today.setHours(0, 0, 0, 0)

const prevWeek = new Date(today)
prevWeek.setDate(prevWeek.getDate() - 7)

function makeRanking(bookId: number, rank: number) {
  return {
    id: bookId,
    bookId,
    countryId: 1,
    rank,
    rankingDate: today,
    createdAt: new Date(),
    book: {
      id: bookId,
      countryId: 1,
      title: `Book ${bookId}`,
      titleKo: `책 ${bookId}`,
      titleEn: `Book ${bookId} EN`,
      titleZh: null,
      titleJa: null,
      authorName: `Author ${bookId}`,
      coverImageUrl: `https://example.com/cover${bookId}.jpg`,
      price: '15000',
      currency: 'KRW',
      author: null,
    },
  }
}

describe('Rankings routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAllCache()
  })

  describe('GET /api/v1/rankings', () => {
    it('should return top 20 rankings for a country', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountry)
      mockPrisma.ranking.findFirst.mockResolvedValue({
        rankingDate: today,
      } as any)
      mockPrisma.ranking.findMany
        .mockResolvedValueOnce([makeRanking(1, 1), makeRanking(2, 2)])
        .mockResolvedValueOnce([])

      const app = await buildApp(rankingsRoutes, '/api/v1/rankings')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/rankings?country=KR',
      })

      const body = response.json()
      expect(response.statusCode).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.countryCode).toBe('KR')
      expect(body.data.books).toHaveLength(2)
      expect(body.data.books[0].rank).toBe(1)
      expect(body.data.books[0].translationStatus).toBe('ready')
    })


    it('should mark ranking title translation as source when localized title is missing', async () => {
      const ranking = makeRanking(1, 1)
      ranking.book.titleEn = null

      mockPrisma.country.findUnique.mockResolvedValue(mockCountry)
      mockPrisma.ranking.findFirst.mockResolvedValue({
        rankingDate: today,
      } as any)
      mockPrisma.ranking.findMany
        .mockResolvedValueOnce([ranking as any])
        .mockResolvedValueOnce([])

      const app = await buildApp(rankingsRoutes, '/api/v1/rankings')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/rankings?country=KR&lang=en',
      })

      const body = response.json()
      expect(body.data.books[0].translationStatus).toBe('source')
      expect(body.data.books[0].title).toBe('Book 1')
    })


    it('should localize author names for english when author profile exists', async () => {
      const ranking = makeRanking(1, 1)
      ranking.book.author = {
        id: 11,
        name: 'Han Kang',
        nameOriginal: '한강',
      }

      mockPrisma.country.findUnique.mockResolvedValue(mockCountry)
      mockPrisma.ranking.findFirst.mockResolvedValue({
        rankingDate: today,
      } as any)
      mockPrisma.ranking.findMany
        .mockResolvedValueOnce([ranking as any])
        .mockResolvedValueOnce([])

      const app = await buildApp(rankingsRoutes, '/api/v1/rankings')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/rankings?country=KR&lang=en',
      })

      const body = response.json()
      expect(body.data.books[0].author).toBe('Han Kang')
      expect(body.data.books[0].authorOriginal).toBe('한강')
    })

    it('should calculate rank changes from previous week', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountry)
      mockPrisma.ranking.findFirst.mockResolvedValue({
        rankingDate: today,
      } as any)

      // Current rankings
      mockPrisma.ranking.findMany
        .mockResolvedValueOnce([makeRanking(1, 1), makeRanking(2, 2)])
        // Previous rankings: book 1 was at rank 3, book 2 was at rank 1
        .mockResolvedValueOnce([
          { bookId: 1, rank: 3 },
          { bookId: 2, rank: 1 },
        ] as any)

      const app = await buildApp(rankingsRoutes, '/api/v1/rankings')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/rankings?country=KR',
      })

      const body = response.json()
      // Book 1: was 3, now 1 -> change = 3 - 1 = +2
      expect(body.data.books[0].rankChange).toBe(2)
      // Book 2: was 1, now 2 -> change = 1 - 2 = -1
      expect(body.data.books[1].rankChange).toBe(-1)
    })

    it('should mark new entries', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountry)
      mockPrisma.ranking.findFirst.mockResolvedValue({
        rankingDate: today,
      } as any)

      mockPrisma.ranking.findMany
        .mockResolvedValueOnce([makeRanking(1, 1)])
        .mockResolvedValueOnce([]) // No previous ranking

      const app = await buildApp(rankingsRoutes, '/api/v1/rankings')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/rankings?country=KR',
      })

      const body = response.json()
      expect(body.data.books[0].isNew).toBe(true)
      expect(body.data.books[0].rankChange).toBeNull()
    })


    it('should use cached ranking results for identical queries', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountry)
      mockPrisma.ranking.findFirst.mockResolvedValue({
        rankingDate: today,
      } as any)
      mockPrisma.ranking.findMany
        .mockResolvedValueOnce([makeRanking(1, 1)])
        .mockResolvedValueOnce([])

      const app = await buildApp(rankingsRoutes, '/api/v1/rankings')
      await app.inject({
        method: 'GET',
        url: '/api/v1/rankings?country=KR',
      })
      await app.inject({
        method: 'GET',
        url: '/api/v1/rankings?country=KR',
      })

      expect(mockPrisma.country.findUnique).toHaveBeenCalledTimes(1)
      expect(mockPrisma.ranking.findMany).toHaveBeenCalledTimes(2)
    })

    it('should return 404 for invalid country', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(null)

      const app = await buildApp(rankingsRoutes, '/api/v1/rankings')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/rankings?country=KR',
      })

      const body = response.json()
      expect(response.statusCode).toBe(404)
      expect(body.success).toBe(false)
    })

    it('should return empty when no rankings exist', async () => {
      mockPrisma.country.findUnique.mockResolvedValue(mockCountry)
      mockPrisma.ranking.findFirst.mockResolvedValue(null)

      const app = await buildApp(rankingsRoutes, '/api/v1/rankings')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/rankings?country=KR',
      })

      const body = response.json()
      expect(body.success).toBe(true)
      expect(body.data.books).toHaveLength(0)
      expect(body.data.date).toBeNull()
    })

    it('should require country parameter', async () => {
      const app = await buildApp(rankingsRoutes, '/api/v1/rankings')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/rankings',
      })

      expect(response.statusCode).toBe(500)
    })
  })

  describe('GET /api/v1/rankings/history/:bookId', () => {
    it('should return ranking history for a book', async () => {
      const historyData = [
        { rankingDate: new Date('2024-02-01'), rank: 1 },
        { rankingDate: new Date('2024-01-25'), rank: 3 },
        { rankingDate: new Date('2024-01-18'), rank: 5 },
      ]
      mockPrisma.ranking.findMany.mockResolvedValue(historyData as any)

      const app = await buildApp(rankingsRoutes, '/api/v1/rankings')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/rankings/history/1',
      })

      const body = response.json()
      expect(response.statusCode).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.bookId).toBe(1)
      expect(body.data.history).toHaveLength(3)
      expect(body.data.history[0].rank).toBe(1)
    })

    it('should return empty history for book with no rankings', async () => {
      mockPrisma.ranking.findMany.mockResolvedValue([])

      const app = await buildApp(rankingsRoutes, '/api/v1/rankings')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/rankings/history/999',
      })

      const body = response.json()
      expect(body.data.history).toHaveLength(0)
    })
  })
})
