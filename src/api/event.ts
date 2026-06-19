import { event } from 'src/mocks/event.js'
import type { TicketId } from 'src/schemas/Step1AttendeeInfo'
import { createCachedFetcher } from 'src/lib/createCachedFetcher'

export type TicketType = {
  id: TicketId
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

/**
 * Fetch event metadata including ticket types.
 * Caches the result; pass `{ refresh: true }` to force a re-fetch.
 */
export const fetchEvent = createCachedFetcher<Event>(() => event as Event)
