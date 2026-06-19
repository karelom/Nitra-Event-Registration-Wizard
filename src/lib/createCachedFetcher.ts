/**
 * Creates a cached async fetcher that wraps a synchronous data source.
 * Returns the same promise on repeated calls; pass `{ refresh: true }` to invalidate.
 */
export function createCachedFetcher<T>(fetcher: () => T, delayMs = 150) {
  let cached: Promise<T> | null = null
  return (options?: { refresh?: boolean }): Promise<T> => {
    if (!cached || options?.refresh) {
      cached = (async () => {
        await new Promise<void>((r) => setTimeout(r, delayMs))
        return fetcher()
      })()
    }
    return cached
  }
}
