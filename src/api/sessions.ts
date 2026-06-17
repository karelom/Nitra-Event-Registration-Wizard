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

/**
 * Fetch all conference sessions as a flat array.
 * Sessions are sorted by start time in the mock; group by date on the frontend.
 * Replace the mock import with a real HTTP call when the backend is ready.
 */
export async function fetchSessions(): Promise<Session[]> {
  await new Promise<void>((r) => setTimeout(r, 150))
  return sessions as Session[]
}
