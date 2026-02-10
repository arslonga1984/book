import { create } from 'zustand'
import type { BookWithRank, BookDetail, CountryCode, LanguageCode } from '@book-ranking/shared'
import { api } from '../services/api'

interface BookState {
  rankings: Partial<Record<CountryCode, BookWithRank[]>>
  isLoading: boolean
  error: string | null
  fetchRankings: (countryCode: CountryCode) => Promise<void>
  fetchBookDetail: (bookId: number, lang: LanguageCode) => Promise<BookDetail | null>
}

export const useBookStore = create<BookState>((set, get) => ({
  rankings: {},
  isLoading: false,
  error: null,

  fetchRankings: async (countryCode: CountryCode) => {
    set({ isLoading: true, error: null })

    try {
      const response = await api.getRankings(countryCode)

      if (response.success && response.data) {
        set((state) => ({
          rankings: {
            ...state.rankings,
            [countryCode]: response.data.books,
          },
          isLoading: false,
        }))
      } else {
        set({ error: response.error?.message || 'Failed to fetch rankings', isLoading: false })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      })
    }
  },

  fetchBookDetail: async (bookId: number, lang: LanguageCode) => {
    try {
      const response = await api.getBook(bookId, lang)

      if (response.success && response.data) {
        return response.data as BookDetail
      }

      return null
    } catch {
      return null
    }
  },
}))
