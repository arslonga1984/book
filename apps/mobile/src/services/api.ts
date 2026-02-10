import type {
  ApiResponse,
  CountryCode,
  LanguageCode,
  RankingList,
  Book,
  BookDetail,
} from '@book-ranking/shared'

const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/v1'
  : 'https://api.book-ranking.app/api/v1'

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
      },
    }
  }
}

export const api = {
  getRankings: (
    countryCode: CountryCode,
    lang: LanguageCode = 'ko'
  ): Promise<ApiResponse<RankingList>> => {
    return fetchApi(`/rankings?country=${countryCode}&lang=${lang}`)
  },

  getBooks: (
    countryCode?: CountryCode,
    lang: LanguageCode = 'ko',
    limit = 20,
    page = 1
  ): Promise<ApiResponse<Book[]>> => {
    const params = new URLSearchParams({
      lang,
      limit: String(limit),
      page: String(page),
    })
    if (countryCode) params.set('country', countryCode)

    return fetchApi(`/books?${params}`)
  },

  getBook: (
    id: number,
    lang: LanguageCode = 'ko'
  ): Promise<ApiResponse<BookDetail>> => {
    return fetchApi(`/books/${id}?lang=${lang}`)
  },

  getAuthor: (id: number, lang: LanguageCode = 'ko') => {
    return fetchApi(`/authors/${id}?lang=${lang}`)
  },
}
