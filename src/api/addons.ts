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

/**
 * Fetch all available add-ons as a flat array.
 * Add-ons span three categories: workshop, meal, merchandise — group by `category` on the frontend.
 * Replace the mock import with a real HTTP call when the backend is ready.
 */
export async function fetchAddons(): Promise<Addon[]> {
  await new Promise<void>((r) => setTimeout(r, 150))
  return addons as Addon[]
}
