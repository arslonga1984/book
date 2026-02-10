import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import type { CountryCode, LanguageCode } from '@book-ranking/shared'

const querySchema = z.object({
  country: z.enum(['KR', 'JP', 'CN', 'US', 'UK']),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  lang: z.enum(['ko', 'en', 'zh', 'ja']).default('ko'),
})

export const rankingsRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/rankings
  app.get('/', async (request, reply) => {
    const query = querySchema.parse(request.query)

    const country = await prisma.country.findUnique({
      where: { code: query.country },
    })

    if (!country) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Country not found' },
      })
    }

    // Get the latest ranking date if not specified
    const targetDate = query.date
      ? new Date(query.date)
      : await getLatestRankingDate(country.id)

    if (!targetDate) {
      return {
        success: true,
        data: {
          countryCode: query.country as CountryCode,
          date: null,
          books: [],
          updatedAt: null,
        },
      }
    }

    const rankings = await prisma.ranking.findMany({
      where: {
        countryId: country.id,
        rankingDate: targetDate,
      },
      include: {
        book: true,
      },
      orderBy: { rank: 'asc' },
      take: 20,
    })

    // Get previous rankings to calculate rank changes
    const previousDate = new Date(targetDate)
    previousDate.setDate(previousDate.getDate() - 7)

    const previousRankings = await prisma.ranking.findMany({
      where: {
        countryId: country.id,
        rankingDate: previousDate,
        bookId: { in: rankings.map((r) => r.bookId) },
      },
    })

    const prevRankMap = new Map(
      previousRankings.map((r) => [r.bookId, r.rank])
    )

    const books = rankings.map((r) => {
      const prevRank = prevRankMap.get(r.bookId)
      const rankChange = prevRank ? prevRank - r.rank : null
      const isNew = prevRank === undefined

      return {
        id: r.book.id,
        rank: r.rank,
        rankChange,
        isNew,
        title: getLocalizedTitle(r.book, query.lang),
        author: r.book.authorName,
        coverImageUrl: r.book.coverImageUrl,
        price: r.book.price,
        currency: r.book.currency,
      }
    })

    return {
      success: true,
      data: {
        countryCode: query.country as CountryCode,
        date: targetDate.toISOString().split('T')[0],
        books,
        updatedAt: rankings[0]?.createdAt ?? null,
      },
    }
  })

  // GET /api/v1/rankings/history/:bookId
  app.get('/history/:bookId', async (request) => {
    const { bookId } = z
      .object({ bookId: z.coerce.number().positive() })
      .parse(request.params)

    const rankings = await prisma.ranking.findMany({
      where: { bookId },
      orderBy: { rankingDate: 'desc' },
      take: 52, // 1 year of weekly data
    })

    return {
      success: true,
      data: {
        bookId,
        history: rankings.map((r) => ({
          date: r.rankingDate.toISOString().split('T')[0],
          rank: r.rank,
        })),
      },
    }
  })
}

async function getLatestRankingDate(countryId: number): Promise<Date | null> {
  const latest = await prisma.ranking.findFirst({
    where: { countryId },
    orderBy: { rankingDate: 'desc' },
    select: { rankingDate: true },
  })

  return latest?.rankingDate ?? null
}

function getLocalizedTitle(
  book: { title: string; titleKo?: string | null; titleEn?: string | null; titleZh?: string | null; titleJa?: string | null },
  lang: LanguageCode
): string {
  const langMap: Record<LanguageCode, string | null | undefined> = {
    ko: book.titleKo,
    en: book.titleEn,
    zh: book.titleZh,
    ja: book.titleJa,
  }

  return langMap[lang] ?? book.title
}
