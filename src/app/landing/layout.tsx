import type { Metadata } from 'next';
import { BRAND_NAME, TAGLINE } from '@/lib/constants/mentoria-brand';
import Script from 'next/script';
import ChatWidget from '@/components/landing/ChatWidget';

export const metadata: Metadata = {
  title: `${BRAND_NAME} - ${TAGLINE}`,
  description: 'Transforma tu relación con el dinero. De la ansiedad a la claridad en solo 2 minutos. Tu mentor financiero personal con IA que te entiende, no te juzga y te guía paso a paso hacia tus metas.',
  keywords: [
    'finanzas personales',
    'presupuesto',
    'ahorro',
    'IA',
    'inteligencia artificial',
    'mentor financiero',
    'educación financiera',
    'control de gastos',
    'planificación financiera',
    'ahorro automático',
  ],
  authors: [{ name: 'MentorIA Team' }],
  creator: 'MentorIA',
  publisher: 'MentorIA',
  openGraph: {
    title: `${BRAND_NAME} - ${TAGLINE}`,
    description: 'Transforma tu relación con el dinero con tu mentor financiero personal. De la ansiedad a la claridad en solo 2 minutos.',
    type: 'website',
    locale: 'es_ES',
    siteName: BRAND_NAME,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} - Tu mentor financiero personal`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} - ${TAGLINE}`,
    description: 'Transforma tu relación con el dinero en solo 2 minutos.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'tu-codigo-de-verificacion-de-google',
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: BRAND_NAME,
  description: 'Tu mentor financiero personal con IA. Transforma tu relación con el dinero.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '127',
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="landing-page">
        {children}
        {/* Chat widget flotante */}
        <ChatWidget />
      </div>
    </>
  );
}

