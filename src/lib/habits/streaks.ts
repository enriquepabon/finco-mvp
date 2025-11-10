/**
 * Streak Calculator - MentorIA
 * 
 * Lógica avanzada para cálculo y visualización de rachas consecutivas.
 * Integra con el sistema de gamificación y nudges.
 */

import { supabase } from '../supabase/client';
import { HabitType, calculateCurrentStreak, getDaysSinceLastCompletion } from './tracker';
import { MENTORIA_COPY } from '../constants/mentoria-brand';

// ============================================
// TYPES
// ============================================

export interface StreakData {
  habitType: HabitType;
  currentStreak: number;
  longestStreak: number;
  isActive: boolean; // Si completó el hábito hoy
  daysSinceLastCompletion: number;
  encouragementMessage: string | null;
  nextMilestone: number | null; // Próxima meta de días
}

export interface StreakMilestone {
  days: number;
  badgeName: string;
  message: string;
}

// ============================================
// MILESTONES
// ============================================

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 3,
    badgeName: 'Racha de 3 días',
    message: '¡3 días seguidos! Vas muy bien. 🔥'
  },
  {
    days: 7,
    badgeName: 'Primera Semana',
    message: '¡Primera semana completa! 🎉 Ya eres parte del 30% que lo logra.'
  },
  {
    days: 14,
    badgeName: 'Dos Semanas',
    message: '¡2 semanas! Esto se está volviendo un hábito. 💪'
  },
  {
    days: 21,
    badgeName: '21 Días',
    message: '¡21 días! Los expertos dicen que ya es un hábito formado. ⭐'
  },
  {
    days: 30,
    badgeName: 'Un Mes',
    message: '¡Un mes completo! Increíble constancia. 🏆'
  },
  {
    days: 60,
    badgeName: 'Dos Meses',
    message: '¡Dos meses! Eres imparable. 🚀'
  },
  {
    days: 90,
    badgeName: 'Tres Meses',
    message: '¡90 días! Este es un hito importante. 👏'
  },
  {
    days: 180,
    badgeName: 'Medio Año',
    message: '¡6 meses! Tu constancia es inspiradora. 🌟'
  },
  {
    days: 365,
    badgeName: 'Un Año',
    message: '¡UN AÑO! Esto es extraordinario. 🎆'
  }
];

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Get detailed streak data for a habit
 * 
 * @param userId - ID del usuario
 * @param habitType - Tipo de hábito
 * @returns Datos detallados de la racha
 */
export async function getStreakData(
  userId: string,
  habitType: HabitType
): Promise<StreakData> {
  try {
    // Obtener streak actual
    const currentStreak = await calculateCurrentStreak(userId, habitType);

    // Obtener el longest streak histórico
    const { data: habits } = await supabase
      .from('user_habits')
      .select('streak_count')
      .eq('user_id', userId)
      .eq('habit_type', habitType)
      .order('streak_count', { ascending: false })
      .limit(1)
      .maybeSingle();

    const longestStreak = habits?.streak_count || currentStreak;

    // Días desde última completación
    const daysSince = await getDaysSinceLastCompletion(userId, habitType);

    // Verificar si completó hoy
    const isActive = daysSince === 0;

    // Mensaje de aliento
    const encouragementMessage = getEncouragementMessage(
      currentStreak,
      daysSince,
      habitType
    );

    // Próxima meta
    const nextMilestone = getNextMilestone(currentStreak);

    return {
      habitType,
      currentStreak,
      longestStreak,
      isActive,
      daysSinceLastCompletion: daysSince,
      encouragementMessage,
      nextMilestone
    };

  } catch (error) {
    console.error('Error in getStreakData:', error);
    return {
      habitType,
      currentStreak: 0,
      longestStreak: 0,
      isActive: false,
      daysSinceLastCompletion: Infinity,
      encouragementMessage: null,
      nextMilestone: 3
    };
  }
}

/**
 * Get next milestone for a streak
 * 
 * @param currentStreak - Racha actual
 * @returns Número de días del próximo milestone o null
 */
export function getNextMilestone(currentStreak: number): number | null {
  const nextMilestone = STREAK_MILESTONES.find(m => m.days > currentStreak);
  return nextMilestone ? nextMilestone.days : null;
}

/**
 * Get encouragement message based on streak status
 * 
 * @param currentStreak - Racha actual
 * @param daysSinceLastCompletion - Días desde última completación
 * @param habitType - Tipo de hábito
 * @returns Mensaje de aliento o null
 */
export function getEncouragementMessage(
  currentStreak: number,
  daysSinceLastCompletion: number,
  habitType: HabitType
): string | null {
  // Si completó hoy, celebrar
  if (daysSinceLastCompletion === 0) {
    if (currentStreak >= 7) {
      return MENTORIA_COPY.celebrations.streak7;
    }
    if (currentStreak >= 3) {
      return MENTORIA_COPY.celebrations.streak3;
    }
    if (currentStreak === 1) {
      return MENTORIA_COPY.celebrations.firstExpense;
    }
    return null;
  }

  // Si lleva 2+ días sin completar, nudge
  if (daysSinceLastCompletion >= 2) {
    return MENTORIA_COPY.nudges.missingDays;
  }

  // Si está cerca de un milestone, alentar
  const nextMilestone = getNextMilestone(currentStreak);
  if (nextMilestone && (nextMilestone - currentStreak) <= 2) {
    return `¡Vas por ${currentStreak} días! ${nextMilestone - currentStreak} más y desbloqueas el badge de ${getMilestoneName(nextMilestone)}.`;
  }

  return null;
}

/**
 * Get milestone name by days
 */
export function getMilestoneName(days: number): string {
  const milestone = STREAK_MILESTONES.find(m => m.days === days);
  return milestone ? milestone.badgeName : `${days} días`;
}

/**
 * Check if user reached a new milestone
 * 
 * @param currentStreak - Racha actual
 * @param previousStreak - Racha anterior
 * @returns Milestone alcanzado o null
 */
export function checkMilestoneReached(
  currentStreak: number,
  previousStreak: number
): StreakMilestone | null {
  // Encontrar si cruzó algún milestone
  const reachedMilestone = STREAK_MILESTONES.find(
    m => currentStreak >= m.days && previousStreak < m.days
  );

  return reachedMilestone || null;
}

/**
 * Get streak color based on status
 * 
 * @param currentStreak - Racha actual
 * @param isActive - Si está activa hoy
 * @returns Color hex
 */
export function getStreakColor(currentStreak: number, isActive: boolean): string {
  if (!isActive) return '#95A5A6'; // Gris si no está activa

  if (currentStreak >= 21) return '#FFD700'; // Dorado para 21+ días
  if (currentStreak >= 7) return '#FF6B35';  // Naranja para 7-20 días
  if (currentStreak >= 3) return '#00C48C';  // Verde para 3-6 días
  return '#2E5BFF'; // Azul para 1-2 días
}

/**
 * Get streak emoji based on count
 */
export function getStreakEmoji(currentStreak: number): string {
  if (currentStreak >= 30) return '🏆';
  if (currentStreak >= 21) return '⭐';
  if (currentStreak >= 14) return '💪';
  if (currentStreak >= 7) return '🔥';
  if (currentStreak >= 3) return '✨';
  return '🎯';
}

/**
 * Calculate streak percentage to next milestone
 * 
 * @param currentStreak - Racha actual
 * @returns Porcentaje (0-100)
 */
export function getStreakProgress(currentStreak: number): number {
  const nextMilestone = getNextMilestone(currentStreak);
  if (!nextMilestone) return 100; // Ya llegó al último milestone

  const previousMilestone = STREAK_MILESTONES
    .filter(m => m.days <= currentStreak)
    .pop()?.days || 0;

  const progress = ((currentStreak - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Get all active streaks for a user
 * 
 * @param userId - ID del usuario
 * @returns Array de datos de rachas activas
 */
export async function getAllActiveStreaks(
  userId: string
): Promise<StreakData[]> {
  const habitTypes: HabitType[] = [
    'daily_expense_log',
    'budget_check',
    'goal_review',
    'savings_contribution'
  ];

  const streaks: StreakData[] = [];

  for (const habitType of habitTypes) {
    const streakData = await getStreakData(userId, habitType);
    
    // Solo incluir si tiene al menos 1 día de streak o si completó hoy
    if (streakData.currentStreak > 0 || streakData.isActive) {
      streaks.push(streakData);
    }
  }

  // Ordenar por streak descendente
  return streaks.sort((a, b) => b.currentStreak - a.currentStreak);
}

/**
 * Get the highest active streak for a user
 * 
 * @param userId - ID del usuario
 * @returns Datos de la racha más alta o null
 */
export async function getHighestActiveStreak(
  userId: string
): Promise<StreakData | null> {
  const allStreaks = await getAllActiveStreaks(userId);
  return allStreaks.length > 0 ? allStreaks[0] : null;
}

