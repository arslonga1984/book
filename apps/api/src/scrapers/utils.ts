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

    return NAMED_ENTITIES[entity] ?? ' '
  })
}

export function sanitizeDescription(raw: string | null | undefined): string | undefined {
  if (!raw) {
    return undefined
  }

  const withLineBreaks = raw
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/\s*(p|div|li|h[1-6])\s*>/gi, '\n')
  const withoutTags = withLineBreaks.replace(/<[^>]+>/g, ' ')
  const decoded = decodeHtmlEntities(withoutTags)

  const normalized = decoded
    .replace(/[\t\r ]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return normalized || undefined
}
