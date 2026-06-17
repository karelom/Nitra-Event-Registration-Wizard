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

/**
 * Fetch event metadata including ticket types.
 * Replace the mock import with a real HTTP call when the backend is ready.
 */
export async function fetchEvent(): Promise<Event> {
  await new Promise<void>((r) => setTimeout(r, 150))
  return event as Event
}
