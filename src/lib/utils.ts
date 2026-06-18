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

/**
 * Formats a workshop time slot as "Nov 16, 2:00 PM – 5:00 PM".
 * Includes the date prefix for sessions that span across days.
 */
export function formatWorkshopTime(start: string, end: string): string {
  const dateStr = new Date(start).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  return `${dateStr}, ${formatTimeRange(start, end)}`
}

/**
 * Formats a number as USD currency string.
 * @example formatCurrency(1234.5) // '$1,234.50'
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
