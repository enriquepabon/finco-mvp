/**
 * StreakIndicator Component - MentorIA
 * 
 * Indicador visual de racha con animación de fuego/llama
 * Muestra el progreso del usuario en mantener hábitos consecutivos
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, TrendingUp, Award } from 'lucide-react';
import { StreakData, getStreakEmoji, getStreakColor, getStreakProgress } from '@/lib/habits/streaks';
import { getHabitDisplayName } from '@/lib/habits/tracker';

interface StreakIndicatorProps {
  streakData: StreakData;
  onClick?: () => void;
  compact?: boolean;
  showProgress?: boolean;
  className?: string;
}

export default function StreakIndicator({
  streakData,
  onClick,
  compact = false,
  showProgress = true,
  className = ''
}: StreakIndicatorProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const streakColor = getStreakColor(streakData.currentStreak, streakData.isActive);
  const streakEmoji = getStreakEmoji(streakData.currentStreak);
  const progress = getStreakProgress(streakData.currentStreak);

  // Animación cuando la racha aumenta
  useEffect(() => {
    if (streakData.isActive && streakData.currentStreak > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [streakData.currentStreak, streakData.isActive]);

  if (compact) {
    return (
      <motion.div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-100 ${className}`}
        whileHover={{ scale: 1.05 }}
        onClick={onClick}
      >
        <motion.div
          animate={isAnimating ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.6 }}
        >
          <Flame 
            size={16} 
            style={{ color: streakColor }}
            fill={streakData.isActive ? streakColor : 'none'}
          />
        </motion.div>
        <span className="text-sm font-semibold" style={{ color: streakColor }}>
          {streakData.currentStreak}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100 cursor-pointer ${className}`}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={isAnimating ? { 
              scale: [1, 1.3, 1], 
              rotate: [0, -15, 15, 0] 
            } : {}}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <Flame 
              size={24} 
              style={{ color: streakColor }}
              fill={streakData.isActive ? streakColor : 'none'}
              strokeWidth={2}
            />
          </motion.div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">
              {getHabitDisplayName(streakData.habitType)}
            </h3>
            {streakData.isActive && (
              <span className="text-xs text-green-600 font-medium">
                ✓ Completado hoy
              </span>
            )}
          </div>
        </div>

        {/* Emoji Badge */}
        <motion.div
          className="text-2xl"
          animate={isAnimating ? { scale: [1, 1.5, 1] } : {}}
          transition={{ duration: 0.6 }}
        >
          {streakEmoji}
        </motion.div>
      </div>

      {/* Streak Count */}
      <div className="flex items-baseline gap-2 mb-3">
        <motion.span 
          className="text-4xl font-bold"
          style={{ color: streakColor }}
          animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
        >
          {streakData.currentStreak}
        </motion.span>
        <span className="text-gray-500 text-sm">
          {streakData.currentStreak === 1 ? 'día' : 'días'} seguidos
        </span>
      </div>

      {/* Progress Bar */}
      {showProgress && streakData.nextMilestone && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progreso</span>
            <span className="font-medium">
              {streakData.nextMilestone - streakData.currentStreak} días para {streakData.nextMilestone}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${streakColor}, ${streakColor}dd)` 
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <Award size={14} className="text-yellow-500" />
          <span>
            Mejor: <span className="font-semibold text-gray-700">{streakData.longestStreak}</span> días
          </span>
        </div>
        {!streakData.isActive && streakData.daysSinceLastCompletion < Infinity && (
          <div className="flex items-center gap-1 text-orange-600">
            <TrendingUp size={14} />
            <span>
              Hace {streakData.daysSinceLastCompletion} {streakData.daysSinceLastCompletion === 1 ? 'día' : 'días'}
            </span>
          </div>
        )}
      </div>

      {/* Encouragement Message */}
      <AnimatePresence>
        {streakData.encouragementMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-2 bg-blue-50 rounded-lg"
          >
            <p className="text-xs text-blue-800 font-medium">
              💡 {streakData.encouragementMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle Effect for Active Streak */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: '50%',
                top: '20%',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: streakColor,
              }}
              initial={{ opacity: 1, scale: 0 }}
              animate={{
                opacity: [1, 0],
                scale: [0, 1],
                x: [(Math.random() - 0.5) * 100],
                y: [-20, -60],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

