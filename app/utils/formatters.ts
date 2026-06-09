// Formatting utilities

/**
 * Format salary range as human-readable string
 */
export function formatSalary(min: number | null, max: number | null, currency = '₹'): string {
  if (!min && !max) return 'Not disclosed';
  if (!max) return `${currency}${formatLakh(min!)}+ LPA`;
  if (!min) return `Up to ${currency}${formatLakh(max)} LPA`;
  return `${currency}${formatLakh(min)} – ${formatLakh(max)} LPA`;
}

function formatLakh(value: number): string {
  if (value >= 100) return `${(value / 100).toFixed(1)}Cr`;
  return `${value}L`;
}

/**
 * Format deadline countdown
 */
export function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No deadline';
  const dateObj = new Date(deadline);
  
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const exactString = `(Expires: ${formattedDate} at ${formattedTime})`;

  const diff = dateObj.getTime() - Date.now();
  if (diff < 0) return `Expired on ${formattedDate}`;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  let relative = '';
  if (days === 0) relative = 'Today!';
  else if (days === 1) relative = '1 day left';
  else if (days <= 7) relative = `${days} days left`;
  else if (days <= 30) relative = `${Math.ceil(days / 7)} weeks left`;
  else relative = `${Math.ceil(days / 30)} months left`;
  
  return `${relative} ${exactString}`;
}

/**
 * Format date as relative time or absolute
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Format number with K/M suffix
 */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * Truncate text to max chars
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.substring(0, max)}...`;
}

/**
 * Get initials from full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Calculate match score color
 */
export function getMatchColor(score: number): string {
  if (score >= 80) return '#43D9AD';
  if (score >= 60) return '#FFB84D';
  return '#FF5E5E';
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
