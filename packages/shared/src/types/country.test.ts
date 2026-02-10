import { describe, it, expect } from 'vitest'
import { COUNTRIES } from './country'
import type { CountryCode, LanguageCode, Country } from './country'

describe('COUNTRIES constant', () => {
  const countryCodes: CountryCode[] = ['KR', 'JP', 'CN', 'US', 'UK']
  const languageCodes: LanguageCode[] = ['ko', 'en', 'zh', 'ja']

  it('should contain all 5 countries', () => {
    expect(Object.keys(COUNTRIES)).toHaveLength(5)
    for (const code of countryCodes) {
      expect(COUNTRIES[code]).toBeDefined()
    }
  })

  it('should have unique ids for each country', () => {
    const ids = Object.values(COUNTRIES).map((c) => c.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(5)
  })

  it('should have matching code field for each key', () => {
    for (const code of countryCodes) {
      expect(COUNTRIES[code].code).toBe(code)
    }
  })

  it('should have names in all 4 languages for each country', () => {
    for (const code of countryCodes) {
      const country = COUNTRIES[code]
      for (const lang of languageCodes) {
        expect(country.names[lang]).toBeTruthy()
        expect(typeof country.names[lang]).toBe('string')
      }
    }
  })

  it('should have bookstore info for each country', () => {
    for (const code of countryCodes) {
      const country = COUNTRIES[code]
      expect(country.bookstore.name).toBeTruthy()
      expect(country.bookstore.url).toMatch(/^https?:\/\//)
    }
  })

  it('should have a flag emoji for each country', () => {
    for (const code of countryCodes) {
      expect(COUNTRIES[code].flag).toBeTruthy()
    }
  })

  describe('specific country data', () => {
    it('KR should use YES24', () => {
      expect(COUNTRIES.KR.bookstore.name).toBe('YES24')
      expect(COUNTRIES.KR.names.ko).toBe('한국')
    })

    it('JP should use Amazon Japan', () => {
      expect(COUNTRIES.JP.bookstore.name).toBe('Amazon Japan')
      expect(COUNTRIES.JP.bookstore.url).toContain('amazon.co.jp')
    })

    it('CN should use Dangdang', () => {
      expect(COUNTRIES.CN.bookstore.name).toBe('当当网')
    })

    it('US should use Amazon US', () => {
      expect(COUNTRIES.US.bookstore.name).toBe('Amazon US')
      expect(COUNTRIES.US.bookstore.url).toContain('amazon.com')
    })

    it('UK should use Amazon UK', () => {
      expect(COUNTRIES.UK.bookstore.name).toBe('Amazon UK')
      expect(COUNTRIES.UK.bookstore.url).toContain('amazon.co.uk')
    })
  })
})

describe('type safety', () => {
  it('CountryCode should only accept valid codes', () => {
    const validCodes: CountryCode[] = ['KR', 'JP', 'CN', 'US', 'UK']
    expect(validCodes).toHaveLength(5)
  })

  it('LanguageCode should only accept valid codes', () => {
    const validLangs: LanguageCode[] = ['ko', 'en', 'zh', 'ja']
    expect(validLangs).toHaveLength(4)
  })

  it('Country interface should be structurally correct', () => {
    const country: Country = {
      id: 99,
      code: 'KR',
      names: { ko: 'test', en: 'test', zh: 'test', ja: 'test' },
      bookstore: { name: 'Test', url: 'https://test.com' },
      flag: 'X',
    }
    expect(country.id).toBe(99)
    expect(country.code).toBe('KR')
  })
})
