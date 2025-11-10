import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { BRAND_NAME } from '@/lib/constants/mentoria-brand'

interface CashbeatFloatingButtonProps {
  onClick?: () => void
  hasNotifications?: boolean
  notificationCount?: number
  position?: 'bottom-right' | 'bottom-left'
}

const CashbeatFloatingButton: React.FC<CashbeatFloatingButtonProps> = ({
  onClick,
  hasNotifications = false,
  notificationCount = 0,
  position = 'bottom-right'
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6'
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className={`absolute ${position === 'bottom-right' ? 'right-0' : 'left-0'} bottom-full mb-3 px-4 py-2 bg-gradient-to-r from-[#2E5BFF] to-[#00C48C] text-white text-sm rounded-lg shadow-lg whitespace-nowrap font-medium`}
          >
            ¡Hola! Soy {BRAND_NAME}, tu mentor financiero
            <div className={`absolute top-full ${position === 'bottom-right' ? 'right-4' : 'left-4'} w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2E5BFF]`} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={onClick}
        onMouseEnter={() => {
          setIsHovered(true)
          setShowTooltip(true)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          setShowTooltip(false)
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-16 h-16 bg-white backdrop-blur-sm border-2 border-[#2E5BFF]/20 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group overflow-hidden"
      >
        {/* MentorIA Logo Icon */}
        <motion.div
          animate={{
            rotate: isHovered ? [0, -8, 8, 0] : 0,
            scale: isHovered ? 1.1 : 1
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
          className="relative w-10 h-10"
        >
          <Image
            src="/images/logo-mentoria-icon.png"
            alt={BRAND_NAME}
            width={40}
            height={40}
            className="w-full h-full object-contain"
            priority
          />
        </motion.div>

        {/* Notification Badge */}
        <AnimatePresence>
          {hasNotifications && notificationCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse Ring - MentorIA Colors */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 0, 0.6]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#2E5BFF] to-[#00C48C] -z-10"
        />

        {/* Glow Effect - MentorIA Gradient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#2E5BFF]/20 to-[#00C48C]/20 blur-md group-hover:from-[#2E5BFF]/40 group-hover:to-[#00C48C]/40 transition-all duration-300 -z-10" />
      </motion.button>
    </div>
  )
}

export default CashbeatFloatingButton 