import type { CountryCode } from './country'

export interface TranslatedText {
  ko?: string
  en?: string
  zh?: string
  ja?: string
}

export type TranslationStatus = 'ready' | 'partial' | 'source'

export interface Book {
  id: number
  countryCode: CountryCode
  isbn?: string
  title: string
  titleTranslated?: TranslatedText
  author: string
  authorTranslated?: TranslatedText
  publisher?: string
  price?: string
  currency?: string
  coverImageUrl?: string
  detailUrl: string
  description?: string
  descriptionTranslated?: TranslatedText
  category?: string
  translationStatus?: TranslationStatus
  createdAt: Date
  updatedAt: Date
}

export interface BookWithRank extends Book {
  rank: number
  rankChange?: number // 순위 변동 (+면 상승, -면 하락, 0이면 유지)
  isNew?: boolean // 신규 진입
}

export interface BookDetail extends Book {
  authorInfo?: Author
  purchaseLinks: PurchaseLink[]
  rankHistory?: { rank: number; date: string }[]
}

export interface Author {
  id: number
  name: string
  nameOriginal?: string
  bio?: string
  bioTranslated?: TranslatedText
  imageUrl?: string
  books?: Book[]
}

export interface PurchaseLink {
  storeName: string
  storeUrl: string
  price?: string
  currency?: string
  inStock?: boolean
}
