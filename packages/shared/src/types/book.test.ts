import { describe, it, expect } from 'vitest'
import type {
  Book,
  BookWithRank,
  BookDetail,
  Author,
  PurchaseLink,
  TranslatedText,
} from './book'

describe('Book types', () => {
  const now = new Date()

  const baseBook: Book = {
    id: 1,
    countryCode: 'KR',
    title: 'Test Book',
    author: 'Test Author',
    detailUrl: 'https://example.com/book/1',
    createdAt: now,
    updatedAt: now,
  }

  it('Book should support required fields', () => {
    expect(baseBook.id).toBe(1)
    expect(baseBook.countryCode).toBe('KR')
    expect(baseBook.title).toBe('Test Book')
    expect(baseBook.detailUrl).toContain('https://')
  })

  it('Book should support optional fields', () => {
    const bookWithOptionals: Book = {
      ...baseBook,
      isbn: '978-1234567890',
      publisher: 'Test Publisher',
      price: '15000',
      currency: 'KRW',
      coverImageUrl: 'https://example.com/cover.jpg',
      description: 'A test book description',
      category: 'Fiction',
    }
    expect(bookWithOptionals.isbn).toBe('978-1234567890')
    expect(bookWithOptionals.currency).toBe('KRW')
  })

  it('BookWithRank should extend Book with rank info', () => {
    const rankedBook: BookWithRank = {
      ...baseBook,
      rank: 3,
      rankChange: 2,
      isNew: false,
    }
    expect(rankedBook.rank).toBe(3)
    expect(rankedBook.rankChange).toBe(2)
    expect(rankedBook.isNew).toBe(false)
  })

  it('BookWithRank should support new entry', () => {
    const newBook: BookWithRank = {
      ...baseBook,
      rank: 1,
      isNew: true,
    }
    expect(newBook.isNew).toBe(true)
    expect(newBook.rankChange).toBeUndefined()
  })

  it('BookDetail should include purchase links and rank history', () => {
    const detail: BookDetail = {
      ...baseBook,
      purchaseLinks: [
        {
          storeName: 'YES24',
          storeUrl: 'https://yes24.com/book/1',
          price: '15000',
          currency: 'KRW',
          inStock: true,
        },
      ],
      rankHistory: [
        { rank: 1, date: '2024-01-01' },
        { rank: 3, date: '2024-01-08' },
      ],
    }
    expect(detail.purchaseLinks).toHaveLength(1)
    expect(detail.rankHistory).toHaveLength(2)
  })

  it('Author should support multilingual bio', () => {
    const author: Author = {
      id: 1,
      name: 'Author Name',
      nameOriginal: 'Original Name',
      bio: 'Default bio',
      bioTranslated: {
        ko: '한국어 소개',
        en: 'English bio',
      },
      imageUrl: 'https://example.com/author.jpg',
    }
    expect(author.bioTranslated?.ko).toBe('한국어 소개')
    expect(author.nameOriginal).toBe('Original Name')
  })

  it('TranslatedText should support partial translations', () => {
    const text: TranslatedText = {
      ko: '한국어',
      en: 'English',
    }
    expect(text.ko).toBe('한국어')
    expect(text.zh).toBeUndefined()
  })

  it('PurchaseLink should support all fields', () => {
    const link: PurchaseLink = {
      storeName: 'Amazon',
      storeUrl: 'https://amazon.com/dp/123',
      price: '19.99',
      currency: 'USD',
      inStock: true,
    }
    expect(link.storeName).toBe('Amazon')
    expect(link.inStock).toBe(true)
  })
})
