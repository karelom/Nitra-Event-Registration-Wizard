/**
 * Formats an ISO UTC timestamp to a locale time string.
 * Uses UTC timezone so output is consistent regardless of the user's locale offset.
 * @example formatTime('2028-11-15T09:00:00Z') // '9:00 AM'
 */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  })
}

/**
 * Formats a start/end ISO UTC pair as a human-readable time range.
 * @example formatTimeRange('2028-11-15T09:00:00Z', '2028-11-15T10:00:00Z') // '9:00 AM – 10:00 AM'
 */
export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}
