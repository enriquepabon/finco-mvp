import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CashbeatLogo from './CashbeatLogo'

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
            className={`absolute ${position === 'bottom-right' ? 'right-0' : 'left-0'} bottom-full mb-3 px-4 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap`}
          >
            ¡Hola! Soy tu asistente financiero IA
            <div className={`absolute top-full ${position === 'bottom-right' ? 'right-4' : 'left-4'} w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800`} />
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
        className="relative w-16 h-16 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      >
        {/* Robot Logo */}
        <motion.div
          animate={{
            rotate: isHovered ? [0, -5, 5, 0] : 0
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
        >
          <CashbeatLogo variant="chat" size="small" />
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

        {/* Pulse Ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-full bg-blue-400 -z-10"
        />

        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-400/20 blur-md group-hover:from-blue-400/40 group-hover:to-cyan-400/40 transition-all duration-300 -z-10" />
      </motion.button>
    </div>
  )
}

export default CashbeatFloatingButton 