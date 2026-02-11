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

const REQUEST_TIMEOUT_MS = 8_000
const MAX_RETRIES = 1

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  retries = MAX_RETRIES
): Promise<ApiResponse<T>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: data?.error?.code ?? `HTTP_${response.status}`,
          message: data?.error?.message ?? `Request failed (${response.status})`,
          details: { status: response.status },
        },
      }
    }

    return data
  } catch (error) {
    if (retries > 0) {
      return fetchApi(endpoint, options, retries - 1)
    }

    return {
      success: false,
      error: {
        code: error instanceof Error && error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
        message:
          error instanceof Error && error.name === 'AbortError'
            ? 'Request timed out. Please try again.'
            : error instanceof Error
              ? error.message
              : 'Network error',
      },
    }
  } finally {
    clearTimeout(timeout)
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
    page = 1,
    sort: 'updatedAt' | 'rank' = 'updatedAt'
  ): Promise<ApiResponse<Book[]>> => {
    const params = new URLSearchParams({
      lang,
      limit: String(limit),
      page: String(page),
      sort,
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
