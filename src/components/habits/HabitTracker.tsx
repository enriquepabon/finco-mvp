/**
 * HabitTracker Component - MentorIA
 * 
 * Panel de tracking de hábitos que muestra todos los hábitos activos del usuario
 * Incluye visualización de rachas y progreso
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import StreakIndicator from './StreakIndicator';
import { StreakData } from '@/lib/habits/streaks';
import { supabase } from '@/lib/supabase/client';

interface HabitTrackerProps {
  userId: string;
  compact?: boolean;
  onStreakClick?: (streakData: StreakData) => void;
}

export default function HabitTracker({ 
  userId, 
  compact = false,
  onStreakClick 
}: HabitTrackerProps) {
  const [streaks, setStreaks] = useState<StreakData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch habits data
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError('No estás autenticado');
          return;
        }

        // Fetch habits from API
        const response = await fetch(`/api/habits/${userId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar hábitos');
        }

        const data = await response.json();
        setStreaks(data.activeStreaks || []);

      } catch (err) {
        console.error('Error fetching habits:', err);
        setError('No pudimos cargar tus hábitos. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchHabits();
    }
  }, [userId]);

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // Silently refresh data
      const fetchHabits = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const response = await fetch(`/api/habits/${userId}`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setStreaks(data.activeStreaks || []);
          }
        } catch (err) {
          console.error('Error refreshing habits:', err);
        }
      };

      fetchHabits();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [userId]);

  // Calculate total stats
  const totalDays = streaks.reduce((sum, s) => sum + s.currentStreak, 0);
  const activeToday = streaks.filter(s => s.isActive).length;
  const longestStreak = Math.max(...streaks.map(s => s.longestStreak), 0);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-50 rounded-xl p-6 border border-red-200">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle size={24} />
          <div>
            <h3 className="font-semibold">Error al cargar hábitos</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (streaks.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <Calendar size={48} className="mx-auto text-blue-600 mb-4" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            ¡Comienza tu primera racha!
          </h3>
          <p className="text-gray-600 mb-4">
            Registra tu primer gasto o completa una acción para iniciar tu tracking de hábitos.
          </p>
          <div className="flex justify-center gap-2 text-sm text-gray-500">
            <CheckCircle2 size={16} className="text-green-600" />
            <span>Registro diario</span>
            <CheckCircle2 size={16} className="text-green-600" />
            <span>Revisión semanal</span>
            <CheckCircle2 size={16} className="text-green-600" />
            <span>Metas claras</span>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        {streaks.slice(0, 3).map((streak) => (
          <StreakIndicator
            key={streak.habitType}
            streakData={streak}
            compact
            onClick={() => onStreakClick?.(streak)}
          />
        ))}
        {streaks.length > 3 && (
          <span className="text-sm text-gray-500">
            +{streaks.length - 3} más
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-xl p-6 shadow-sm border border-gray-100"
    >
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={28} />
            Mis Hábitos
          </h2>
          {activeToday > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold"
            >
              {activeToday} completados hoy ✓
            </motion.span>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{totalDays}</div>
            <div className="text-xs text-blue-600 font-medium">Días totales</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{activeToday}</div>
            <div className="text-xs text-green-600 font-medium">Hoy</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{longestStreak}</div>
            <div className="text-xs text-yellow-600 font-medium">Mejor racha</div>
          </div>
        </div>
      </div>

      {/* Streaks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {streaks.map((streak, index) => (
            <motion.div
              key={streak.habitType}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
            >
              <StreakIndicator
                streakData={streak}
                onClick={() => onStreakClick?.(streak)}
                showProgress
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Encouragement Footer */}
      {streaks.some(s => !s.isActive && s.daysSinceLastCompletion > 1) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-orange-800 text-sm mb-1">
                ¡No pierdas tu momentum!
              </h4>
              <p className="text-orange-700 text-xs">
                Tienes hábitos sin completar. Registra una acción hoy para mantener tus rachas activas.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

