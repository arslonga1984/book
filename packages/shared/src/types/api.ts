import type { LanguageCode, CountryCode } from './country'

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ApiMeta
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface ApiMeta {
  total?: number
  page?: number
  limit?: number
  hasMore?: boolean
}

// API Request params
export interface GetBooksParams {
  country?: CountryCode
  lang?: LanguageCode
  limit?: number
  page?: number
}

export interface GetBookByIdParams {
  id: number
  lang?: LanguageCode
}

export interface GetRankingsParams {
  country: CountryCode
  date?: string // YYYY-MM-DD
  lang?: LanguageCode
}

export interface TranslateParams {
  text: string
  from: LanguageCode
  to: LanguageCode
}
