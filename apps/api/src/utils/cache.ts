const cacheStore = new Map<string, { value: unknown; expiresAt: number }>()

export function getCachedValue<T>(key: string): T | null {
  const entry = cacheStore.get(key)

  if (!entry) {
    return null
  }

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key)
    return null
  }

  return entry.value as T
}

export function setCachedValue<T>(key: string, value: T, ttlMs: number): void {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  })
}

export function clearCacheByPrefix(prefix: string): void {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key)
    }
  }
}

export function clearAllCache(): void {
  cacheStore.clear()
}
