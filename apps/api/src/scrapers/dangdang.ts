import * as cheerio from 'cheerio'
import type { ScraperResult, ScrapedBook } from './index.js'
import { config } from '../config.js'
import { sanitizeDescription } from './utils.js'

const DANGDANG_BESTSELLER_URL = 'http://bang.dangdang.com/books/bestsellers/01.00.00.00.00.00-24hours-0-0-1-1'

async function fetchDangdangDescription(detailUrl: string): Promise<string | undefined> {
  try {
    if (!detailUrl) return undefined
    const url = detailUrl.startsWith('//') ? `https:${detailUrl}` : detailUrl
    const res = await fetch(url, {
      headers: {
        'User-Agent': config.scrape.userAgent,
        Accept: 'text/html',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
    })
    if (!res.ok) return undefined
    const buffer = await res.arrayBuffer()
    const html = new TextDecoder('gbk').decode(buffer)
    const $ = cheerio.load(html)

    const desc =
      $('.descrip, #content .descrip, .msg_desc, .product_info .descrip, #detail_describe')
        .first()
        .html()?.trim() ||
      $('meta[name="description"]').attr('content')?.trim()

    return sanitizeDescription(desc)
  } catch {
    return undefined
  }
}

export async function scrapeDangdang(): Promise<ScraperResult> {
  try {
    const response = await fetch(DANGDANG_BESTSELLER_URL, {
      headers: {
        'User-Agent': config.scrape.userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    const html = new TextDecoder('gbk').decode(buffer)
    const $ = cheerio.load(html)
    const books: ScrapedBook[] = []

    // 当当网 베스트셀러 파싱 (실제 구조에 맞게 수정 필요)
    $('.bang_list li, .list_box li').each((index, element) => {
      if (index >= 20) return false

      const $el = $(element)

      const title = $el.find('.name a, .title a').text().trim()
      const author = $el.find('.publisher_info a, .author a').first().text().trim()
      const publisher = $el.find('.publisher_info a, .press a').last().text().trim()
      const priceText = $el.find('.price .price_n, .price_m').text().trim()
      const coverImageUrl = $el.find('img').attr('src') || ''
      const detailUrl = $el.find('.name a, .title a').attr('href') || ''

      if (title) {
        books.push({
          rank: index + 1,
          title,
          author: author || 'Unknown',
          publisher: publisher || undefined,
          price: priceText.replace(/[^\d.]/g, '') || undefined,
          currency: 'CNY',
          coverImageUrl: coverImageUrl.startsWith('//')
            ? `https:${coverImageUrl}`
            : coverImageUrl,
          detailUrl,
        })
      }
    })

    // Fetch descriptions from detail pages (parallel, max 5 concurrent)
    const BATCH_SIZE = 5
    for (let i = 0; i < books.length; i += BATCH_SIZE) {
      const batch = books.slice(i, i + BATCH_SIZE)
      const descriptions = await Promise.all(
        batch.map((book) => fetchDangdangDescription(book.detailUrl))
      )
      descriptions.forEach((desc, idx) => {
        if (desc) {
          books[i + idx] = { ...books[i + idx], description: desc } as ScrapedBook
        }
      })
      if (i + BATCH_SIZE < books.length) {
        await new Promise((r) => setTimeout(r, 1000))
      }
    }

    return {
      success: true,
      countryCode: 'CN',
      books,
    }
  } catch (error) {
    return {
      success: false,
      countryCode: 'CN',
      books: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
