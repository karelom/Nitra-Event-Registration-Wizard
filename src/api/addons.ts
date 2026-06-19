import { addons } from 'src/mocks/addons.js'
import { createCachedFetcher } from 'src/lib/createCachedFetcher'

export type AddonCategory = 'workshop' | 'meal' | 'merchandise'

export const ADDON_CATEGORY_LABELS: Record<AddonCategory, string> = {
  workshop: 'Workshops',
  meal: 'Meal Packages',
  merchandise: 'Merchandise',
}

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

/**
 * Fetch all available add-ons as a flat array.
 * Caches the result; pass `{ refresh: true }` to force a re-fetch.
 */
export const fetchAddons = createCachedFetcher<Addon[]>(() => addons as Addon[])
