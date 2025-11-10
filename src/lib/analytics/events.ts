// lib/analytics/events.ts

/**
 * Analytics event tracking utilities for MentorIA
 * Configure with your analytics provider (Google Analytics, Mixpanel, etc.)
 */

export const AnalyticsEvents = {
  // Landing Page Events
  LANDING_CTA_PRIMARY: 'landing_cta_primary_clicked',
  LANDING_CTA_SECONDARY: 'landing_cta_secondary_clicked',
  LANDING_CTA_FOOTER: 'landing_cta_footer_clicked',
  LANDING_DEMO_CLICKED: 'landing_demo_clicked',
  
  // Navigation Events
  NAV_FEATURES_CLICKED: 'nav_features_clicked',
  NAV_HOW_CLICKED: 'nav_how_clicked',
  NAV_TESTIMONIALS_CLICKED: 'nav_testimonials_clicked',
} as const;

export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Track an analytics event
 * @param eventName - Name of the event to track
 * @param properties - Additional properties to send with the event
 */
export function trackEvent(
  eventName: AnalyticsEventName,
  properties?: AnalyticsEventProperties
): void {
  // Google Analytics (gtag)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }

  // Google Tag Manager (dataLayer)
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ...properties,
    });
  }

  // Mixpanel
  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.track(eventName, properties);
  }

  // Plausible
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(eventName, { props: properties });
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', eventName, properties);
  }
}

/**
 * Track a page view
 * @param pagePath - Path of the page viewed
 * @param pageTitle - Title of the page
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('📄 Page View:', pagePath, pageTitle);
  }
}

// Type declarations for analytics providers
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void;
    dataLayer?: Array<Record<string, unknown>>;
    mixpanel?: {
      track: (eventName: string, properties?: Record<string, unknown>) => void;
    };
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

