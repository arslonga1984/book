const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
}

function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_match, entity) => {
    if (entity[0] === '#') {
      const isHex = entity[1]?.toLowerCase() === 'x'
      const value = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10)

      if (!Number.isFinite(value)) {
        return ' '
      }

      return String.fromCodePoint(value)
    }

    return NAMED_ENTITIES[entity.toLowerCase()] ?? ' '
  })
}

export function sanitizeDescription(raw: string | null | undefined): string | undefined {
  if (!raw) {
    return undefined
  }

  // Decode first to handle escaped markup from meta fields (e.g. &lt;br/&gt;)
  const decodedOnce = decodeHtmlEntities(raw)

  // Decode twice for doubly-escaped payloads that occasionally appear in feeds
  const decoded = decodeHtmlEntities(decodedOnce)

  const withLineBreaks = decoded
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/\s*(p|div|li|h[1-6])\s*>/gi, '\n')
  const withoutTags = withLineBreaks.replace(/<[^>]+>/g, ' ')

  const normalized = withoutTags
    .replace(/[\t\r ]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return normalized || undefined
}
