/**
 * Formats a date as `yyyy-MM-dd` using the user's local calendar day.
 * @returns The local day as `yyyy-MM-dd`.
 */
export function localDate(date: Date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
