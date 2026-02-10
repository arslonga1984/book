import { prisma } from '../db/prisma.js'
import { scrapeKyobobook } from './kyobobook.js'
import { scrapeAmazon } from './amazon.js'
import { scrapeDangdang } from './dangdang.js'
import type { CountryCode } from '@book-ranking/shared'

export interface ScrapedBook {
  rank: number
  title: string
  author: string
  publisher?: string
  price?: string
  currency?: string
  coverImageUrl?: string
  detailUrl: string
  isbn?: string
  description?: string
  category?: string
}

export interface ScraperResult {
  success: boolean
  countryCode: CountryCode
  books: ScrapedBook[]
  error?: string
}

type ScraperFunction = () => Promise<ScraperResult>

const scrapers: Record<CountryCode, ScraperFunction> = {
  KR: scrapeKyobobook,
  JP: () => scrapeAmazon('JP'),
  CN: scrapeDangdang,
  US: () => scrapeAmazon('US'),
  UK: () => scrapeAmazon('UK'),
}

export async function runAllScrapers(): Promise<void> {
  const countryCodes: CountryCode[] = ['KR', 'JP', 'CN', 'US', 'UK']
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const countryCode of countryCodes) {
    const startTime = Date.now()
    let status = 'success'
    let booksCount = 0
    let errorMessage: string | undefined

    try {
      console.log(`Scraping ${countryCode}...`)
      const result = await scrapers[countryCode]()

      if (!result.success) {
        status = 'failed'
        errorMessage = result.error
        continue
      }

      // Get country
      const country = await prisma.country.findUnique({
        where: { code: countryCode },
      })

      if (!country) {
        throw new Error(`Country not found: ${countryCode}`)
      }

      // Save books and rankings
      for (const scrapedBook of result.books) {
        // Upsert book
        const book = await prisma.book.upsert({
          where: {
            countryId_isbn: {
              countryId: country.id,
              isbn: scrapedBook.isbn || `no-isbn-${scrapedBook.title.slice(0, 50)}`,
            },
          },
          update: {
            title: scrapedBook.title,
            authorName: scrapedBook.author,
            publisher: scrapedBook.publisher,
            price: scrapedBook.price,
            currency: scrapedBook.currency,
            coverImageUrl: scrapedBook.coverImageUrl,
            detailUrl: scrapedBook.detailUrl,
            description: scrapedBook.description,
            category: scrapedBook.category,
          },
          create: {
            countryId: country.id,
            isbn: scrapedBook.isbn || `no-isbn-${scrapedBook.title.slice(0, 50)}`,
            title: scrapedBook.title,
            authorName: scrapedBook.author,
            publisher: scrapedBook.publisher,
            price: scrapedBook.price,
            currency: scrapedBook.currency,
            coverImageUrl: scrapedBook.coverImageUrl,
            detailUrl: scrapedBook.detailUrl,
            description: scrapedBook.description,
            category: scrapedBook.category,
          },
        })

        // Upsert ranking
        await prisma.ranking.upsert({
          where: {
            bookId_countryId_rankingDate: {
              bookId: book.id,
              countryId: country.id,
              rankingDate: today,
            },
          },
          update: {
            rank: scrapedBook.rank,
          },
          create: {
            bookId: book.id,
            countryId: country.id,
            rank: scrapedBook.rank,
            rankingDate: today,
          },
        })

        booksCount++
      }

      console.log(`${countryCode}: Saved ${booksCount} books`)
    } catch (error) {
      status = 'failed'
      errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`${countryCode} scrape failed:`, error)
    } finally {
      // Log scrape result
      await prisma.scrapeLog.create({
        data: {
          countryCode,
          status,
          booksCount,
          errorMessage,
          duration: Date.now() - startTime,
        },
      })
    }

    // Rate limiting between countries
    await delay(3000)
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
