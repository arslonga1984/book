export type CountryCode = 'KR' | 'JP' | 'CN' | 'US' | 'UK'

export type LanguageCode = 'ko' | 'en' | 'zh' | 'ja'

export interface Country {
  id: number
  code: CountryCode
  names: {
    ko: string
    en: string
    zh: string
    ja: string
  }
  bookstore: {
    name: string
    url: string
  }
  flag: string
}

export const COUNTRIES: Record<CountryCode, Country> = {
  KR: {
    id: 1,
    code: 'KR',
    names: {
      ko: '한국',
      en: 'South Korea',
      zh: '韩国',
      ja: '韓国',
    },
    bookstore: {
      name: 'YES24',
      url: 'https://www.yes24.com',
    },
    flag: '🇰🇷',
  },
  JP: {
    id: 2,
    code: 'JP',
    names: {
      ko: '일본',
      en: 'Japan',
      zh: '日本',
      ja: '日本',
    },
    bookstore: {
      name: 'Amazon Japan',
      url: 'https://www.amazon.co.jp',
    },
    flag: '🇯🇵',
  },
  CN: {
    id: 3,
    code: 'CN',
    names: {
      ko: '중국',
      en: 'China',
      zh: '中国',
      ja: '中国',
    },
    bookstore: {
      name: '当当网',
      url: 'https://www.dangdang.com',
    },
    flag: '🇨🇳',
  },
  US: {
    id: 4,
    code: 'US',
    names: {
      ko: '미국',
      en: 'United States',
      zh: '美国',
      ja: 'アメリカ',
    },
    bookstore: {
      name: 'Amazon US',
      url: 'https://www.amazon.com',
    },
    flag: '🇺🇸',
  },
  UK: {
    id: 5,
    code: 'UK',
    names: {
      ko: '영국',
      en: 'United Kingdom',
      zh: '英国',
      ja: 'イギリス',
    },
    bookstore: {
      name: 'Amazon UK',
      url: 'https://www.amazon.co.uk',
    },
    flag: '🇬🇧',
  },
}
