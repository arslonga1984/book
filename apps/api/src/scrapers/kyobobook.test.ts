import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scrapeKyobobook } from './kyobobook.js'

const YES24_HTML = `
<html>
<body>
  <li data-goods-no="12345678">
    <span class="ico rank">1</span>
    <a class="gd_name">첫 번째 베스트셀러</a>
    <img class="lazy" data-original="//image.yes24.com/cover1.jpg" />
    <span class="info_auth"><a>김작가</a></span>
    <span class="info_pub"><a>출판사A</a></span>
    <span class="info_price"><span class="txt_num"><em>15,000</em></span></span>
  </li>
  <li data-goods-no="87654321">
    <span class="ico rank">2</span>
    <a class="gd_name">두 번째 베스트셀러</a>
    <img class="lazy" data-original="//image.yes24.com/cover2.jpg" />
    <div class="info_row">저 이작가 | 출판사B</div>
  </li>
</body>
</html>
`

const YES24_FALLBACK_HTML = `
<html>
<body>
  <div class="itemUnit">
    <a href="/Product/Goods/11111111"><span class="gd_name">폴백 도서</span></a>
    <img src="https://image.yes24.com/fallback.jpg" />
  </div>
</body>
</html>
`

describe('Kyobobook (YES24) scraper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('should scrape YES24 bestsellers', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(YES24_HTML, { status: 200 })
    )

    const result = await scrapeKyobobook()

    expect(result.success).toBe(true)
    expect(result.countryCode).toBe('KR')
    expect(result.books).toHaveLength(2)
    expect(result.books[0]).toEqual(
      expect.objectContaining({
        rank: 1,
        title: '첫 번째 베스트셀러',
        author: '김작가',
        currency: 'KRW',
        isbn: '12345678',
        detailUrl: 'https://www.yes24.com/Product/Goods/12345678',
      })
    )
  })

  it('should fix protocol-relative image URLs', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(YES24_HTML, { status: 200 })
    )

    const result = await scrapeKyobobook()

    expect(result.books[0]?.coverImageUrl).toBe(
      'https://image.yes24.com/cover1.jpg'
    )
  })

  it('should use fallback selectors when primary fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(YES24_FALLBACK_HTML, { status: 200 })
    )

    const result = await scrapeKyobobook()

    expect(result.success).toBe(true)
    expect(result.books).toHaveLength(1)
    expect(result.books[0]).toEqual(
      expect.objectContaining({
        title: '폴백 도서',
        isbn: '11111111',
        rank: 1,
      })
    )
  })

  it('should report failure when no books found', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('<html><body></body></html>', { status: 200 })
    )

    const result = await scrapeKyobobook()

    expect(result.success).toBe(false)
    expect(result.books).toHaveLength(0)
    expect(result.error).toBe('No books found')
  })

  it('should handle HTTP errors', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('Not Found', { status: 404, statusText: 'Not Found' })
    )

    const result = await scrapeKyobobook()

    expect(result.success).toBe(false)
    expect(result.error).toContain('404')
  })

  it('should handle network errors', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(
      new Error('ECONNREFUSED')
    )

    const result = await scrapeKyobobook()

    expect(result.success).toBe(false)
    expect(result.error).toBe('ECONNREFUSED')
  })
})
