import React from 'react'
import Image from 'next/image'

interface CashbeatLogoProps {
  variant?: 'main' | 'chat'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const CashbeatLogo: React.FC<CashbeatLogoProps> = ({ 
  variant = 'main', 
  size = 'medium',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-40 h-40', 
    large: 'w-50 h-50'
  }

  const logoSrc = variant === 'chat' 
    ? '/Logo/cashbeat (11).png'
    : '/Logo/cashbeat.png'

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <Image
        src={logoSrc}
        alt="Cashbeat Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}

export default CashbeatLogo 