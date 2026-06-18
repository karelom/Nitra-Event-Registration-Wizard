import { addons } from 'src/mocks/addons.js'

export type AddonCategory = 'workshop' | 'meal' | 'merchandise'

export type Addon = {
  id: string
  category: AddonCategory
  name: string
  description: string
  price: number
  /** Workshops only: ISO 8601 start time */
  date?: string
  /** Workshops only: ISO 8601 end time */
  endDate?: string
  /** Workshops only */
  capacity?: number
  /** Workshops only */
  registered?: number
  /** Merchandise only: available sizes */
  sizes?: string[]
  /** Merchandise only: per-order quantity cap */
  maxQuantity?: number
}

let cached: Promise<Addon[]> | null = null

/**
 * Fetch all available add-ons as a flat array.
 * Caches the result; pass `{ refresh: true }` to force a re-fetch.
 * Replace the mock import with a real HTTP call when the backend is ready.
 */
export function fetchAddons(options?: { refresh?: boolean }): Promise<Addon[]> {
  if (!cached || options?.refresh) {
    cached = (async () => {
      await new Promise<void>((r) => setTimeout(r, 150))
      return addons as Addon[]
    })()
  }
  return cached
}
