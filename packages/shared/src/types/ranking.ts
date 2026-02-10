import type { CountryCode } from './country'
import type { BookWithRank } from './book'

export interface Ranking {
  id: number
  bookId: number
  countryCode: CountryCode
  rank: number
  rankingDate: Date
  createdAt: Date
}

export interface RankingList {
  countryCode: CountryCode
  date: Date
  books: BookWithRank[]
  updatedAt: Date
}

export interface RankingHistory {
  bookId: number
  history: {
    date: Date
    rank: number
  }[]
}
