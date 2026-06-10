/**
 * Centralized timezone utility for consistent IST (Asia/Kolkata) formatting.
 */

const TIMEZONE = 'Asia/Kolkata';

/**
 * Formats a date string or Date object to a human-readable IST string.
 * Format: DD/MM/YYYY, HH:MM:SS AM/PM (IST)
 */
export const formatToIST = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleString('en-IN', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }) + ' (IST)';
};

/**
 * Returns the current date/time initialized securely in the backend.
 */
export const nowIST = (): Date => {
  return new Date(); // Vercel process.env.TZ handles internal alignment
};

/**
 * Extracts just the YYYY-MM-DD date string in IST.
 */
export const getDateStringIST = (date: string | Date = new Date()): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  // Format as YYYY-MM-DD
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  return formatter.format(d);
};
