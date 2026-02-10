import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scrapeAmazon } from './amazon.js'

const AMAZON_US_HTML = `
<html>
<body>
  <div data-asin="B001234567">
    <span class="a-size-base-plus">The Great Novel</span>
    <div class="a-row a-size-small"><a class="a-link-child">John Smith</a></div>
    <span class="a-price-whole">14.</span>
    <span class="a-price-fraction">99</span>
    <img src="https://images.amazon.com/cover1.jpg" />
  </div>
  <div data-asin="B009876543">
    <span class="a-size-base-plus">Science Today</span>
    <div class="a-row a-size-small"><a class="a-link-child">Jane Doe</a></div>
    <span class="a-price-whole">24.</span>
    <span class="a-price-fraction">99</span>
    <img src="https://images.amazon.com/cover2.jpg" />
  </div>
  <div data-asin="">
    <span>Empty ASIN should be skipped</span>
  </div>
</body>
</html>
`

const AMAZON_JP_HTML = `
<html>
<body>
  <div data-asin="4123456789">
    <span class="p13n-sc-truncated">日本語の本</span>
    <div class="a-row a-size-small"><a class="a-link-child">田中太郎</a></div>
    <span class="a-price-whole">1,</span>
    <span class="a-price-fraction">500</span>
    <img src="https://images-jp.amazon.com/cover.jpg" />
  </div>
</body>
</html>
`

describe('Amazon scraper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('should scrape US Amazon bestsellers', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(AMAZON_US_HTML, { status: 200 })
    )

    const result = await scrapeAmazon('US')

    expect(result.success).toBe(true)
    expect(result.countryCode).toBe('US')
    expect(result.books).toHaveLength(2)
    expect(result.books[0]).toEqual(
      expect.objectContaining({
        rank: 1,
        title: 'The Great Novel',
        author: 'John Smith',
        price: '14.99',
        currency: 'USD',
        isbn: 'B001234567',
        detailUrl: 'https://www.amazon.com/dp/B001234567',
      })
    )
    expect(result.books[1]).toEqual(
      expect.objectContaining({
        rank: 2,
        title: 'Science Today',
        author: 'Jane Doe',
      })
    )
  })

  it('should scrape JP Amazon with correct currency', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(AMAZON_JP_HTML, { status: 200 })
    )

    const result = await scrapeAmazon('JP')

    expect(result.success).toBe(true)
    expect(result.countryCode).toBe('JP')
    expect(result.books[0]).toEqual(
      expect.objectContaining({
        currency: 'JPY',
        detailUrl: expect.stringContaining('amazon.co.jp'),
      })
    )
  })

  it('should scrape UK Amazon with correct base URL', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(AMAZON_US_HTML, { status: 200 })
    )

    const result = await scrapeAmazon('UK')

    expect(result.success).toBe(true)
    expect(result.countryCode).toBe('UK')
    expect(result.books[0]?.currency).toBe('GBP')
    expect(result.books[0]?.detailUrl).toContain('amazon.co.uk')
  })

  it('should skip elements with empty data-asin', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(AMAZON_US_HTML, { status: 200 })
    )

    const result = await scrapeAmazon('US')
    expect(result.books.every((b) => b.isbn !== '')).toBe(true)
  })

  it('should handle HTTP errors gracefully', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('Forbidden', { status: 403, statusText: 'Forbidden' })
    )

    const result = await scrapeAmazon('US')

    expect(result.success).toBe(false)
    expect(result.books).toHaveLength(0)
    expect(result.error).toContain('403')
  })

  it('should handle network errors gracefully', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network timeout'))

    const result = await scrapeAmazon('US')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Network timeout')
  })

  it('should handle empty HTML response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('<html><body></body></html>', { status: 200 })
    )

    const result = await scrapeAmazon('US')

    expect(result.success).toBe(true)
    expect(result.books).toHaveLength(0)
  })

  it('should default author to Unknown when missing', async () => {
    const htmlNoAuthor = `
    <html><body>
      <div data-asin="B00TEST">
        <span class="a-size-base-plus">No Author Book</span>
        <img src="https://example.com/cover.jpg" />
      </div>
    </body></html>`

    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(htmlNoAuthor, { status: 200 })
    )

    const result = await scrapeAmazon('US')
    expect(result.books[0]?.author).toBe('Unknown')
  })
})
