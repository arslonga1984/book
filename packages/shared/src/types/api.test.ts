import { describe, it, expect } from 'vitest'
import type {
  ApiResponse,
  ApiError,
  ApiMeta,
  GetBooksParams,
  GetRankingsParams,
  GetBookByIdParams,
  TranslateParams,
} from './api'

describe('API types', () => {
  it('ApiResponse should support generic data type', () => {
    const response: ApiResponse<string[]> = {
      success: true,
      data: ['book1', 'book2'],
    }
    expect(response.success).toBe(true)
    expect(response.data).toHaveLength(2)
  })

  it('ApiResponse should support error state', () => {
    const response: ApiResponse<never> = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
    }
    expect(response.success).toBe(false)
    expect(response.error?.code).toBe('NOT_FOUND')
  })

  it('ApiMeta should support pagination', () => {
    const meta: ApiMeta = {
      total: 100,
      page: 2,
      limit: 20,
      hasMore: true,
    }
    expect(meta.total).toBe(100)
    expect(meta.hasMore).toBe(true)
  })

  it('GetBooksParams should have optional fields', () => {
    const params: GetBooksParams = {}
    expect(params.country).toBeUndefined()
    expect(params.lang).toBeUndefined()

    const paramsWithCountry: GetBooksParams = {
      country: 'KR',
      lang: 'ko',
      limit: 10,
      page: 1,
    }
    expect(paramsWithCountry.country).toBe('KR')
  })

  it('GetRankingsParams should require country', () => {
    const params: GetRankingsParams = {
      country: 'US',
    }
    expect(params.country).toBe('US')
    expect(params.date).toBeUndefined()
  })

  it('GetBookByIdParams should require id', () => {
    const params: GetBookByIdParams = {
      id: 42,
      lang: 'en',
    }
    expect(params.id).toBe(42)
  })

  it('TranslateParams should have from and to languages', () => {
    const params: TranslateParams = {
      text: 'Hello',
      from: 'en',
      to: 'ko',
    }
    expect(params.from).toBe('en')
    expect(params.to).toBe('ko')
  })
})
