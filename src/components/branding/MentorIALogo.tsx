'use client';

import { BRAND_NAME } from '@/lib/constants/mentoria-brand';

interface MentorIALogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function MentorIALogo({ 
  variant = 'full', 
  size = 'md',
  className = '' 
}: MentorIALogoProps) {
  
  const sizes = {
    sm: { width: 24, height: 24, text: 'text-lg' },
    md: { width: 32, height: 32, text: 'text-xl' },
    lg: { width: 48, height: 48, text: 'text-3xl' },
    xl: { width: 64, height: 64, text: 'text-5xl' },
  };

  const currentSize = sizes[size];

  // SVG Icon - Stylized "M" with AI circuit pattern
  const IconSVG = () => (
    <svg
      width={currentSize.width}
      height={currentSize.height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="mentoria-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2E5BFF" />
          <stop offset="100%" stopColor="#00C48C" />
        </linearGradient>
      </defs>
      
      {/* Main "M" shape */}
      <path
        d="M20 75 L20 25 L35 45 L50 25 L65 45 L80 25 L80 75 L70 75 L70 45 L50 65 L30 45 L30 75 Z"
        fill="url(#mentoria-gradient)"
      />
      
      {/* AI circuit nodes */}
      <circle cx="35" cy="40" r="3" fill="#00C48C" opacity="0.8" />
      <circle cx="65" cy="40" r="3" fill="#2E5BFF" opacity="0.8" />
      <circle cx="50" cy="55" r="3" fill="#00C48C" opacity="0.8" />
      
      {/* Connecting lines */}
      <line x1="35" y1="40" x2="50" y2="55" stroke="#2E5BFF" strokeWidth="1" opacity="0.5" />
      <line x1="65" y1="40" x2="50" y2="55" stroke="#00C48C" strokeWidth="1" opacity="0.5" />
    </svg>
  );

  // Text Logo
  const TextLogo = () => (
    <span 
      className={`font-bold bg-gradient-to-r from-primary-blue to-success-green bg-clip-text text-transparent ${currentSize.text} ${className}`}
    >
      {BRAND_NAME}
    </span>
  );

  if (variant === 'icon') {
    return <IconSVG />;
  }

  if (variant === 'text') {
    return <TextLogo />;
  }

  // Full logo (icon + text)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <IconSVG />
      <TextLogo />
    </div>
  );
}

