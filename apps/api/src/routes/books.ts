import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import type { CountryCode, LanguageCode } from '@book-ranking/shared'

const querySchema = z.object({
  country: z.enum(['KR', 'JP', 'CN', 'US', 'UK']).optional(),
  lang: z.enum(['ko', 'en', 'zh', 'ja']).default('ko'),
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).default(1),
})

const idParamSchema = z.object({
  id: z.coerce.number().positive(),
})

export const booksRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/books
  app.get('/', async (request, _reply) => {
    const query = querySchema.parse(request.query)
    const skip = (query.page - 1) * query.limit

    const where = query.country
      ? { country: { code: query.country } }
      : undefined

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          country: true,
          rankings: {
            orderBy: { rankingDate: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.book.count({ where }),
    ])

    const formattedBooks = books.map((book) => ({
      id: book.id,
      countryCode: book.country.code as CountryCode,
      isbn: book.isbn,
      title: getLocalizedField(book, 'title', query.lang),
      author: book.authorName,
      publisher: book.publisher,
      price: book.price,
      currency: book.currency,
      coverImageUrl: book.coverImageUrl,
      detailUrl: book.detailUrl,
      rank: book.rankings[0]?.rank ?? null,
      updatedAt: book.updatedAt,
    }))

    return {
      success: true,
      data: formattedBooks,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        hasMore: skip + books.length < total,
      },
    }
  })

  // GET /api/v1/books/:id
  app.get('/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params)
    const { lang } = querySchema.pick({ lang: true }).parse(request.query)

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        country: true,
        author: true,
        rankings: {
          orderBy: { rankingDate: 'desc' },
          take: 10,
        },
      },
    })

    if (!book) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Book not found' },
      })
    }

    return {
      success: true,
      data: {
        id: book.id,
        countryCode: book.country.code as CountryCode,
        isbn: book.isbn,
        title: getLocalizedField(book, 'title', lang),
        titleOriginal: book.title,
        author: book.authorName,
        publisher: book.publisher,
        price: book.price,
        currency: book.currency,
        coverImageUrl: book.coverImageUrl,
        detailUrl: book.detailUrl,
        description: getLocalizedField(book, 'description', lang),
        category: book.category,
        rankHistory: book.rankings.map((r) => ({
          rank: r.rank,
          date: r.rankingDate,
        })),
        authorInfo: book.author
          ? {
              id: book.author.id,
              name: book.author.name,
              bio: getLocalizedField(book.author, 'bio', lang),
              imageUrl: book.author.imageUrl,
            }
          : null,
        purchaseLinks: [
          {
            storeName: book.country.bookstoreName,
            storeUrl: book.detailUrl,
            price: book.price,
            currency: book.currency,
          },
        ],
        updatedAt: book.updatedAt,
      },
    }
  })
}

function getLocalizedField(
  obj: Record<string, unknown>,
  field: string,
  lang: LanguageCode
): string | null {
  const langFieldMap: Record<LanguageCode, string> = {
    ko: `${field}Ko`,
    en: `${field}En`,
    zh: `${field}Zh`,
    ja: `${field}Ja`,
  }

  const localizedField = langFieldMap[lang]
  const localizedValue = obj[localizedField] as string | null | undefined

  if (localizedValue) {
    return localizedValue
  }

  // Fallback to original field
  return (obj[field] as string) ?? null
}
