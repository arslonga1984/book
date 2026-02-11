import * as cheerio from 'cheerio'
import type { ScraperResult, ScrapedBook } from './index.js'
import { config } from '../config.js'
import { sanitizeDescription } from './utils.js'

// YES24 베스트셀러 (교보문고 API가 보호되어 YES24로 대체)
const YES24_BESTSELLER_URL = 'https://www.yes24.com/Product/Category/BestSeller'

async function fetchYes24Description(detailUrl: string): Promise<string | undefined> {
  try {
    const res = await fetch(detailUrl, {
      headers: {
        'User-Agent': config.scrape.userAgent,
        Accept: 'text/html',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    })
    if (!res.ok) return undefined
    const html = await res.text()
    const $ = cheerio.load(html)

    // YES24 상세페이지 책 소개 영역
    const desc =
      $('.infoWrap_txt, .txtContentText, #infoset_introduce .infoWrap_txt, #infoset_introduce, .infoWrap_txt .txtContentText, .Ere_prod_mconts_LS .infoWrap_txt')
        .first()
        .html()?.trim() ||
      $('meta[property="og:description"]').attr('content')?.trim() ||
      $('meta[name="description"]').attr('content')?.trim()

    return sanitizeDescription(desc)
  } catch {
    return undefined
  }
}

export async function scrapeKyobobook(): Promise<ScraperResult> {
  try {
    const response = await fetch(YES24_BESTSELLER_URL, {
      headers: {
        'User-Agent': config.scrape.userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const books: ScrapedBook[] = []

    // YES24 베스트셀러 파싱
    $('li[data-goods-no]').each((index, element) => {
      if (index >= 20) return false

      const $el = $(element)
      const goodsNo = $el.attr('data-goods-no')

      if (!goodsNo) return

      // 순위
      const rankText = $el.find('.ico.rank').text().trim()
      const rank = parseInt(rankText, 10) || index + 1

      // 제목
      const titleLink = $el.find('a.gd_name')
      const title = titleLink.text().trim()

      // 이미지
      const imgEl = $el.find('img.lazy')
      const coverImageUrl = imgEl.attr('data-original') || imgEl.attr('src') || ''

      // 저자 - info_auth 클래스에서 찾기
      const authorEl = $el.find('.info_auth a, .info_pubGrp .info_auth')
      let author = authorEl.first().text().trim()

      // 저자가 없으면 info_row에서 찾기
      if (!author) {
        const infoText = $el.find('.info_row').text()
        const authorMatch = infoText.match(/저[^\|]+/)
        author = authorMatch ? authorMatch[0].replace('저', '').trim() : 'Unknown'
      }

      // 출판사
      const publisherEl = $el.find('.info_pub a')
      const publisher = publisherEl.text().trim() || undefined

      // 가격
      const priceEl = $el.find('.info_price .txt_num em, .yes_m')
      const priceText = priceEl.first().text().trim().replace(/[^\d]/g, '')

      // 상세 URL
      const detailUrl = `https://www.yes24.com/Product/Goods/${goodsNo}`

      if (title) {
        books.push({
          rank,
          title,
          author: author || 'Unknown',
          publisher,
          price: priceText || undefined,
          currency: 'KRW',
          coverImageUrl: coverImageUrl.startsWith('//')
            ? `https:${coverImageUrl}`
            : coverImageUrl,
          detailUrl,
          isbn: goodsNo,
        })
      }
    })

    // 만약 li[data-goods-no]로 못 찾았으면 다른 셀렉터 시도
    if (books.length === 0) {
      $('.itemUnit, .goods_item').each((index, element) => {
        if (index >= 20) return false

        const $el = $(element)
        const linkEl = $el.find('a[href*="/Product/Goods/"]').first()
        const href = linkEl.attr('href') || ''
        const goodsNoMatch = href.match(/\/Goods\/(\d+)/)
        const goodsNo = goodsNoMatch ? goodsNoMatch[1] : null

        const title =
          $el.find('.gd_name').text().trim() ||
          $el.find('.goods_name').text().trim() ||
          linkEl.text().trim()

        const imgEl = $el.find('img')
        const coverImageUrl = imgEl.attr('data-original') || imgEl.attr('src') || ''

        if (title && goodsNo) {
          books.push({
            rank: index + 1,
            title,
            author: 'Unknown',
            price: undefined,
            currency: 'KRW',
            coverImageUrl,
            detailUrl: `https://www.yes24.com/Product/Goods/${goodsNo}`,
            isbn: goodsNo,
          })
        }
      })
    }

    // Fetch descriptions from detail pages (parallel, max 5 concurrent)
    const BATCH_SIZE = 5
    for (let i = 0; i < books.length; i += BATCH_SIZE) {
      const batch = books.slice(i, i + BATCH_SIZE)
      const descriptions = await Promise.all(
        batch.map((book) => fetchYes24Description(book.detailUrl))
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

    console.log(`KR (YES24): Found ${books.length} books`)

    return {
      success: books.length > 0,
      countryCode: 'KR',
      books,
      error: books.length === 0 ? 'No books found' : undefined,
    }
  } catch (error) {
    console.error('KR scrape error:', error)
    return {
      success: false,
      countryCode: 'KR',
      books: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
