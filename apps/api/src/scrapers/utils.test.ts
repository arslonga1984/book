import { describe, it, expect } from 'vitest'
import { sanitizeDescription } from './utils.js'

describe('sanitizeDescription', () => {
  it('removes html tags and decodes entities', () => {
    const raw = '<b>어느 공적(公的)인 인간의 초상</b> 이해찬은&nbsp;예나 지금이나 공적(公的, public)인 사람이다.'
    expect(sanitizeDescription(raw)).toBe(
      '어느 공적(公的)인 인간의 초상 이해찬은 예나 지금이나 공적(公的, public)인 사람이다.'
    )
  })

  it('preserves meaningful line breaks', () => {
    const raw = '<div>첫 문장<br>둘째 문장</div><p>셋째 문장</p>'
    expect(sanitizeDescription(raw)).toBe('첫 문장\n둘째 문장\n셋째 문장')
  })

  it('handles escaped html tags from meta descriptions', () => {
    const raw = '&lt;b&gt;삶의 고비마다 힘이 되어준 말&lt;br/&gt;좋아하는 일을 하고&lt;/b&gt;&lt;br/&gt;다음 문장'
    expect(sanitizeDescription(raw)).toBe(
      '삶의 고비마다 힘이 되어준 말\n좋아하는 일을 하고\n다음 문장'
    )
  })

  it('handles uppercase escaped HTML entities', () => {
    const raw = '&LT;b&GT;강조 텍스트&LT;/b&GT;&LT;BR/&GT;다음 문장'
    expect(sanitizeDescription(raw)).toBe('강조 텍스트\n다음 문장')
  })

})
