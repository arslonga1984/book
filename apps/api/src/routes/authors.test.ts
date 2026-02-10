import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from '../test/helpers.js'
import { authorsRoutes } from './authors.js'
import { prisma } from '../db/prisma.js'

const mockPrisma = vi.mocked(prisma)

const mockAuthor = {
  id: 1,
  name: 'Author Name',
  nameOriginal: 'Original Name',
  bio: 'Default bio',
  bioKo: '한국어 소개',
  bioEn: 'English bio',
  bioZh: null,
  bioJa: null,
  imageUrl: 'https://example.com/author.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
  books: [
    {
      id: 1,
      countryId: 1,
      title: 'Book 1',
      titleKo: '책 1',
      titleEn: 'Book 1 EN',
      titleZh: null,
      titleJa: null,
      coverImageUrl: 'https://example.com/cover1.jpg',
      country: { code: 'KR' },
      rankings: [{ rank: 2, rankingDate: new Date() }],
    },
  ],
}

describe('Authors routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/v1/authors/:id', () => {
    it('should return author with books', async () => {
      mockPrisma.author.findUnique.mockResolvedValue(mockAuthor as any)

      const app = await buildApp(authorsRoutes, '/api/v1/authors')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/authors/1',
      })

      const body = response.json()
      expect(response.statusCode).toBe(200)
      expect(body.success).toBe(true)
      expect(body.data.name).toBe('Author Name')
      expect(body.data.books).toHaveLength(1)
      expect(body.data.books[0].rank).toBe(2)
    })

    it('should localize author bio', async () => {
      mockPrisma.author.findUnique.mockResolvedValue(mockAuthor as any)

      const app = await buildApp(authorsRoutes, '/api/v1/authors')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/authors/1?lang=ko',
      })

      const body = response.json()
      expect(body.data.bio).toBe('한국어 소개')
    })

    it('should fall back to default bio when translation missing', async () => {
      mockPrisma.author.findUnique.mockResolvedValue(mockAuthor as any)

      const app = await buildApp(authorsRoutes, '/api/v1/authors')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/authors/1?lang=zh',
      })

      const body = response.json()
      expect(body.data.bio).toBe('Default bio')
    })

    it('should localize book titles', async () => {
      mockPrisma.author.findUnique.mockResolvedValue(mockAuthor as any)

      const app = await buildApp(authorsRoutes, '/api/v1/authors')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/authors/1?lang=en',
      })

      const body = response.json()
      expect(body.data.books[0].title).toBe('Book 1 EN')
    })

    it('should return 404 for non-existent author', async () => {
      mockPrisma.author.findUnique.mockResolvedValue(null)

      const app = await buildApp(authorsRoutes, '/api/v1/authors')
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/authors/9999',
      })

      const body = response.json()
      expect(response.statusCode).toBe(404)
      expect(body.success).toBe(false)
      expect(body.error.code).toBe('NOT_FOUND')
    })
  })
})
