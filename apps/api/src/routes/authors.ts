import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import type { LanguageCode } from '@book-ranking/shared'

const idParamSchema = z.object({
  id: z.coerce.number().positive(),
})

const querySchema = z.object({
  lang: z.enum(['ko', 'en', 'zh', 'ja']).default('ko'),
})

export const authorsRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/authors/:id
  app.get('/:id', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params)
    const { lang } = querySchema.parse(request.query)

    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        books: {
          include: {
            country: true,
            rankings: {
              orderBy: { rankingDate: 'desc' },
              take: 1,
            },
          },
          take: 20,
        },
      },
    })

    if (!author) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Author not found' },
      })
    }

    return {
      success: true,
      data: {
        id: author.id,
        name: author.name,
        nameOriginal: author.nameOriginal,
        bio: getLocalizedBio(author, lang),
        imageUrl: author.imageUrl,
        books: author.books.map((book) => ({
          id: book.id,
          title: getLocalizedTitle(book, lang),
          countryCode: book.country.code,
          coverImageUrl: book.coverImageUrl,
          rank: book.rankings[0]?.rank ?? null,
        })),
      },
    }
  })
}

function getLocalizedBio(
  author: { bio?: string | null; bioKo?: string | null; bioEn?: string | null; bioZh?: string | null; bioJa?: string | null },
  lang: LanguageCode
): string | null {
  const langMap: Record<LanguageCode, string | null | undefined> = {
    ko: author.bioKo,
    en: author.bioEn,
    zh: author.bioZh,
    ja: author.bioJa,
  }

  return langMap[lang] ?? author.bio ?? null
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
