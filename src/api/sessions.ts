import { sessions } from 'src/mocks/sessions.js'
import { createCachedFetcher } from 'src/lib/createCachedFetcher'

export type SessionTrack = 'main' | 'frontend' | 'backend' | 'devops'

export type Session = {
  id: string
  title: string
  speaker: string
  speakerTitle: string
  track: SessionTrack
  /** ISO 8601 start time */
  date: string
  /** ISO 8601 end time */
  endDate: string
  capacity: number
  registered: number
  description: string
}

/**
 * Fetch all conference sessions as a flat array.
 * Caches the result; pass `{ refresh: true }` to force a re-fetch.
 */
export const fetchSessions = createCachedFetcher<Session[]>(() => sessions as Session[])
