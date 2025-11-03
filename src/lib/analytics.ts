/**
 * Google Analytics wrapper
 * Pluggable via environment configuration
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const isAnalyticsEnabled = !!GA_MEASUREMENT_ID;

interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

/**
 * Log page view event
 */
export function logPageView(url: string): void {
  if (!isAnalyticsEnabled || typeof window === 'undefined') return;

  // @ts-ignore - gtag is loaded via script tag
  window.gtag?.('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

/**
 * Log custom event
 */
export function logEvent({ action, category, label, value }: GAEvent): void {
  if (!isAnalyticsEnabled || typeof window === 'undefined') return;

  // @ts-ignore - gtag is loaded via script tag
  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

/**
 * Log user registration
 */
export function logUserRegistration(method: 'password' | 'magic-link'): void {
  logEvent({
    action: 'sign_up',
    category: 'engagement',
    label: method,
  });
}

/**
 * Log search performed
 */
export function logSearch(searchTerm: string): void {
  logEvent({
    action: 'search',
    category: 'engagement',
    label: searchTerm,
  });
}

/**
 * Log message sent
 */
export function logMessageSent(): void {
  logEvent({
    action: 'message_sent',
    category: 'engagement',
  });
}

/**
 * Log rating submitted
 */
export function logRatingSubmitted(stars: number): void {
  logEvent({
    action: 'rating_submitted',
    category: 'engagement',
    value: stars,
  });
}
