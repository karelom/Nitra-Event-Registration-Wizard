import { sessions } from 'src/mocks/sessions.js'

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

let cached: Promise<Session[]> | null = null

/**
 * Fetch all conference sessions as a flat array.
 * Caches the result; pass `{ refresh: true }` to force a re-fetch.
 * Replace the mock import with a real HTTP call when the backend is ready.
 */
export function fetchSessions(options?: { refresh?: boolean }): Promise<Session[]> {
  if (!cached || options?.refresh) {
    cached = (async () => {
      await new Promise<void>((r) => setTimeout(r, 150))
      return sessions as Session[]
    })()
  }
  return cached
}
