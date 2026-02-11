import * as cheerio from 'cheerio'
import type { ScraperResult, ScrapedBook } from './index.js'
import { config } from '../config.js'
import { sanitizeDescription } from './utils.js'

async function fetchAmazonDescription(
  detailUrl: string,
  userAgent: string
): Promise<string | undefined> {
  try {
    const res = await fetch(detailUrl, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    if (!res.ok) return undefined
    const html = await res.text()
    const $ = cheerio.load(html)

    const desc =
      $('#bookDescription_feature_div .a-expander-content span')
        .first()
        .html()?.trim() ||
      $('#bookDescription_feature_div noscript')
        .first()
        .html()?.trim() ||
      $('#bookDescription_feature_div')
        .first()
        .html()?.trim() ||
      $('#productDescription')
        .first()
        .html()?.trim() ||
      $('.book-description')
        .first()
        .html()?.trim() ||
      $('meta[name="description"]').attr('content')?.trim()

    return sanitizeDescription(desc)
  } catch {
    return undefined
  }
}

const AMAZON_URLS: Record<'JP' | 'US' | 'UK', { base: string; bestseller: string; currency: string }> = {
  JP: {
    base: 'https://www.amazon.co.jp',
    bestseller: 'https://www.amazon.co.jp/gp/bestsellers/books',
    currency: 'JPY',
  },
  US: {
    base: 'https://www.amazon.com',
    bestseller: 'https://www.amazon.com/gp/bestsellers/books',
    currency: 'USD',
  },
  UK: {
    base: 'https://www.amazon.co.uk',
    bestseller: 'https://www.amazon.co.uk/gp/bestsellers/books',
    currency: 'GBP',
  },
}

export async function scrapeAmazon(
  countryCode: 'JP' | 'US' | 'UK'
): Promise<ScraperResult> {
  const amazonConfig = AMAZON_URLS[countryCode]

  try {
    const response = await fetch(amazonConfig.bestseller, {
      headers: {
        'User-Agent': config.scrape.userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const books: ScrapedBook[] = []

    // Amazon 베스트셀러 파싱 (실제 구조에 맞게 수정 필요)
    $('[data-asin]:not([data-asin=""])').each((index, element) => {
      if (index >= 20) return false

      const $el = $(element)
      const asin = $el.attr('data-asin')

      const title =
        $el.find('.p13n-sc-truncated, ._cDEzb_p13n-sc-css-line-clamp-1_1Fn1y').text().trim() ||
        $el.find('span.a-size-base-plus').text().trim()

      const author = $el.find('.a-row.a-size-small .a-link-child').text().trim()

      const priceWhole = $el.find('.a-price-whole').first().text().trim()
      const priceFraction = $el.find('.a-price-fraction').first().text().trim()
      const price = priceWhole ? `${priceWhole}${priceFraction}` : undefined

      const coverImageUrl = $el.find('img').attr('src') || ''

      if (title && asin) {
        books.push({
          rank: index + 1,
          title,
          author: author || 'Unknown',
          price,
          currency: amazonConfig.currency,
          coverImageUrl,
          detailUrl: `${amazonConfig.base}/dp/${asin}`,
          isbn: asin, // ASIN as identifier
        })
      }
    })

    // Fetch descriptions from detail pages (parallel, max 5 concurrent)
    const BATCH_SIZE = 5
    for (let i = 0; i < books.length; i += BATCH_SIZE) {
      const batch = books.slice(i, i + BATCH_SIZE)
      const descriptions = await Promise.all(
        batch.map((book) => fetchAmazonDescription(book.detailUrl, config.scrape.userAgent))
      )
      descriptions.forEach((desc, idx) => {
        if (desc) {
          books[i + idx] = { ...books[i + idx], description: desc } as ScrapedBook
        }
      })
      if (i + BATCH_SIZE < books.length) {
        await new Promise((r) => setTimeout(r, 1500))
      }
    }

    return {
      success: true,
      countryCode,
      books,
    }
  } catch (error) {
    return {
      success: false,
      countryCode,
      books: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
