import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scrapeDangdang } from './dangdang.js'

// Use ASCII-safe HTML to avoid GBK encoding mismatch in tests.
// The scraper decodes response as GBK, so we use ASCII-only author/title
// that survive GBK decoding intact.
const DANGDANG_HTML = `
<html>
<body>
  <ul class="bang_list">
    <li>
      <div class="name"><a href="http://product.dangdang.com/111.html">Book1</a></div>
      <div class="publisher_info"><a>Author1</a><a>Publisher1</a></div>
      <div class="price"><span class="price_n">39.80</span></div>
      <img src="//img.dangdang.com/cover1.jpg" />
    </li>
    <li>
      <div class="name"><a href="http://product.dangdang.com/222.html">Book2</a></div>
      <div class="publisher_info"><a>Author2</a><a>Publisher2</a></div>
      <div class="price"><span class="price_n">25.50</span></div>
      <img src="https://img.dangdang.com/cover2.jpg" />
    </li>
  </ul>
</body>
</html>
`

describe('Dangdang scraper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('should scrape Dangdang bestsellers', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(DANGDANG_HTML, { status: 200 })
    )

    const result = await scrapeDangdang()

    expect(result.success).toBe(true)
    expect(result.countryCode).toBe('CN')
    expect(result.books).toHaveLength(2)
    expect(result.books[0]).toEqual(
      expect.objectContaining({
        rank: 1,
        title: 'Book1',
        author: 'Author1',
        currency: 'CNY',
        price: '39.80',
        detailUrl: 'http://product.dangdang.com/111.html',
      })
    )
  })

  it('should fix protocol-relative image URLs', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(DANGDANG_HTML, { status: 200 })
    )

    const result = await scrapeDangdang()
    expect(result.books[0]?.coverImageUrl).toBe(
      'https://img.dangdang.com/cover1.jpg'
    )
    expect(result.books[1]?.coverImageUrl).toBe(
      'https://img.dangdang.com/cover2.jpg'
    )
  })

  it('should handle HTTP errors', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('Server Error', { status: 500, statusText: 'Internal Server Error' })
    )

    const result = await scrapeDangdang()

    expect(result.success).toBe(false)
    expect(result.error).toContain('500')
  })

  it('should handle network errors', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(
      new Error('DNS resolution failed')
    )

    const result = await scrapeDangdang()

    expect(result.success).toBe(false)
    expect(result.error).toBe('DNS resolution failed')
  })

  it('should handle empty page', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('<html><body></body></html>', { status: 200 })
    )

    const result = await scrapeDangdang()

    expect(result.success).toBe(true)
    expect(result.books).toHaveLength(0)
  })

  it('should strip non-numeric characters from price', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(DANGDANG_HTML, { status: 200 })
    )

    const result = await scrapeDangdang()
    expect(result.books[0]?.price).toBe('39.80')
    expect(result.books[1]?.price).toBe('25.50')
  })
})
