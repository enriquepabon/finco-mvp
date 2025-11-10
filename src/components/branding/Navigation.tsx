'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BRAND_NAME, BRAND_COPY } from '@/lib/constants/mentoria-brand';
import { trackEvent, AnalyticsEvents } from '@/lib/analytics/events';

export function Navigation() {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-[1000] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <Image 
            src="/images/logo-mentoria-full.png" 
            alt="MentorIA - Tu mentor financiero personal" 
            width={160} 
            height={48}
            className="h-11 w-auto"
            priority
          />
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <a 
            href="#features" 
            onClick={() => trackEvent(AnalyticsEvents.NAV_FEATURES_CLICKED)}
            className="text-text-dark font-medium hover:text-primary-blue transition-colors"
          >
            Características
          </a>
          <a 
            href="#how" 
            onClick={() => trackEvent(AnalyticsEvents.NAV_HOW_CLICKED)}
            className="text-text-dark font-medium hover:text-primary-blue transition-colors"
          >
            Cómo funciona
          </a>
          <a 
            href="#testimonials" 
            onClick={() => trackEvent(AnalyticsEvents.NAV_TESTIMONIALS_CLICKED)}
            className="text-text-dark font-medium hover:text-primary-blue transition-colors"
          >
            Testimonios
          </a>
          <Link 
            href="/auth/login" 
            onClick={() => trackEvent(AnalyticsEvents.LANDING_CTA_PRIMARY, { location: 'nav' })}
            className="bg-primary-blue text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            {BRAND_COPY.ctaPrimary}
          </Link>
        </div>

        {/* Mobile menu button - to be implemented later */}
        <button className="md:hidden text-text-dark">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

