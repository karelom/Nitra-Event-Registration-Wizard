import { event } from 'src/mocks/event.js'

export type TicketType = {
  id: 'general' | 'vip' | 'student'
  name: string
  price: number
  description: string
  perks: string[]
}

export type Event = {
  id: string
  name: string
  description: string
  dates: string[]
  venue: { name: string; address: string }
  ticketTypes: TicketType[]
}

let cached: Promise<Event> | null = null

/**
 * Fetch event metadata including ticket types.
 * Caches the result; pass `{ refresh: true }` to force a re-fetch.
 * Replace the mock import with a real HTTP call when the backend is ready.
 */
export function fetchEvent(options?: { refresh?: boolean }): Promise<Event> {
  if (!cached || options?.refresh) {
    cached = (async () => {
      await new Promise<void>((r) => setTimeout(r, 150))
      return event as Event
    })()
  }
  return cached
}
