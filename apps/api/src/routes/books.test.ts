import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from '../test/helpers.js'
import { booksRoutes } from './books.js'
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

const mockBook = {
  id: 1,
  countryId: 1,
  authorId: null,
  isbn: '12345',
  title: 'Test Book',
  titleKo: '테스트 책',
  titleEn: 'Test Book EN',
  titleZh: null,
  titleJa: null,
  authorName: 'Author A',
  publisher: 'Publisher X',
  price: '15000',
  currency: 'KRW',
  coverImageUrl: 'https://example.com/cover.jpg',
  detailUrl: 'https://yes24.com/book/1',
  description: 'A great book',
  descriptionKo: '좋은 책',
  descriptionEn: 'A great book in English',
  descriptionZh: null,
  descriptionJa: null,
  category: 'Fiction',
  createdAt: new Date(),
  updatedAt: new Date(),
  country: mockCountry,
  rankings: [{ rank: 3, rankingDate: new Date() }],
  author: null,
}

describe('Books routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearAllCache()
  })

  describe('GET /api/v1/books', () => {
    it('should return paginated book list', async () => {
      mockPrisma.book.findMany.mockResolvedValue([mockBook])
      mockPrisma.book.count.mockResolvedValue(1)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/books',
      })

      const body = response.json()
      expect(response.statusCode).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(1)
      expect(body.data[0].title).toBe('테스트 책')
      expect(body.meta.total).toBe(1)
    })

    it('should respect language parameter', async () => {
      mockPrisma.book.findMany.mockResolvedValue([mockBook])
      mockPrisma.book.count.mockResolvedValue(1)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/books?lang=en',
      })

      const body = response.json()
      expect(body.data[0].title).toBe('Test Book EN')
      expect(body.data[0].translationStatus).toBe('ready')
    })

    it('should fall back to original title when translation missing', async () => {
      mockPrisma.book.findMany.mockResolvedValue([mockBook])
      mockPrisma.book.count.mockResolvedValue(1)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/books?lang=zh',
      })

      const body = response.json()
      expect(body.data[0].title).toBe('Test Book')
      expect(body.data[0].translationStatus).toBe('source')
    })

    it('should filter by country', async () => {
      mockPrisma.book.findMany.mockResolvedValue([mockBook])
      mockPrisma.book.count.mockResolvedValue(1)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      await app.inject({
        method: 'GET',
        url: '/api/v1/books?country=KR',
      })

      expect(mockPrisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { country: { code: 'KR' } },
        })
      )
    })

    it('should support pagination', async () => {
      mockPrisma.book.findMany.mockResolvedValue([])
      mockPrisma.book.count.mockResolvedValue(50)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/books?page=3&limit=10',
      })

      const body = response.json()
      expect(body.meta.page).toBe(3)
      expect(body.meta.limit).toBe(10)
      expect(body.meta.hasMore).toBe(true)

      expect(mockPrisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      )
    })


    it('should support rank sort mode', async () => {
      const rankedBook = {
        ...mockBook,
        id: 2,
        updatedAt: new Date('2024-01-01'),
        rankings: [{ rank: 1, rankingDate: new Date() }],
      }
      const lowBook = {
        ...mockBook,
        id: 1,
        updatedAt: new Date('2024-01-02'),
        rankings: [{ rank: 3, rankingDate: new Date() }],
      }

      mockPrisma.book.findMany.mockResolvedValue([lowBook, rankedBook] as any)
      mockPrisma.book.count.mockResolvedValue(2)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/books?sort=rank',
      })

      const body = response.json()
      expect(body.data[0].id).toBe(2)
      expect(body.data[1].id).toBe(1)
    })

    it('should use cached list results for identical queries', async () => {
      mockPrisma.book.findMany.mockResolvedValue([mockBook])
      mockPrisma.book.count.mockResolvedValue(1)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      await app.inject({ method: 'GET', url: '/api/v1/books?country=KR' })
      await app.inject({ method: 'GET', url: '/api/v1/books?country=KR' })

      expect(mockPrisma.book.findMany).toHaveBeenCalledTimes(1)
      expect(mockPrisma.book.count).toHaveBeenCalledTimes(1)
    })

    it('should reject invalid country code', async () => {
      const app = await buildApp(booksRoutes, '/api/v1/books')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/books?country=XX',
      })

      expect(response.statusCode).toBe(500)
    })
  })

  describe('GET /api/v1/books/:id', () => {
    it('should return book detail', async () => {
      mockPrisma.book.findUnique.mockResolvedValue(mockBook)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/books/1',
      })

      const body = response.json()
      expect(response.statusCode).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.id).toBe(1)
      expect(body.data.title).toBe('테스트 책')
      expect(body.data.purchaseLinks).toHaveLength(1)
    })

    it('should return 404 for non-existent book', async () => {
      mockPrisma.book.findUnique.mockResolvedValue(null)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/books/9999',
      })

      const body = response.json()
      expect(response.statusCode).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('NOT_FOUND')
    })

    it('should localize book detail to requested language', async () => {
      mockPrisma.book.findUnique.mockResolvedValue(mockBook)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/books/1?lang=en',
      })

      const body = response.json()
      expect(body.data.title).toBe('Test Book EN')
      expect(body.data.description).toBe('A great book in English')
      expect(body.data.translationStatus).toBe('ready')
    })


    it('should sanitize HTML tags in description fields', async () => {
      const bookWithHtmlDesc = {
        ...mockBook,
        description: '<b>어느 공적인 인간의 초상</b> &nbsp; 이해찬 회고록',
        descriptionKo: '<b>어느 공적인 인간의 초상</b> &nbsp; 이해찬 회고록',
      }
      mockPrisma.book.findUnique.mockResolvedValue(bookWithHtmlDesc as any)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/books/1?lang=ko',
      })

      const body = response.json()
      expect(body.data.description).toBe("어느 공적인 인간의 초상 이해찬 회고록")
    })


    it('should return partial translation status when some localized fields are missing', async () => {
      const partiallyLocalizedBook = {
        ...mockBook,
        titleEn: 'Translated title',
        descriptionEn: null,
      }
      mockPrisma.book.findUnique.mockResolvedValue(partiallyLocalizedBook as any)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/books/1?lang=en',
      })

      const body = response.json()
      expect(body.data.translationStatus).toBe('partial')
      expect(body.data.title).toBe('Translated title')
      expect(body.data.description).toBe('A great book')
    })


    it('should localize author names in detail when author profile exists', async () => {
      const bookWithAuthorProfile = {
        ...mockBook,
        author: {
          id: 10,
          name: 'Na Tae-joo',
          nameOriginal: '나태주',
          bio: null,
          bioKo: null,
          bioEn: null,
          bioZh: null,
          bioJa: null,
          imageUrl: null,
        },
      }
      mockPrisma.book.findUnique.mockResolvedValue(bookWithAuthorProfile as any)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/books/1?lang=en',
      })

      const body = response.json()
      expect(body.data.author).toBe('Na Tae-joo')
      expect(body.data.authorOriginal).toBe('나태주')
    })

    it('should include rank history', async () => {
      const bookWithHistory = {
        ...mockBook,
        rankings: [
          { rank: 1, rankingDate: new Date('2024-02-01') },
          { rank: 3, rankingDate: new Date('2024-01-25') },
        ],
      }
      mockPrisma.book.findUnique.mockResolvedValue(bookWithHistory)

      const app = await buildApp(booksRoutes, '/api/v1/books')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/books/1',
      })

      const body = response.json()
      expect(body.data.rankHistory).toHaveLength(2)
      expect(body.data.rankHistory[0].rank).toBe(1)
    })
  })
})
