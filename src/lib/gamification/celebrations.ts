/**
 * Celebrations System - MentorIA
 * 
 * Sistema de celebraciones visuales y mensajes motivacionales
 * cuando el usuario logra hitos o gana badges.
 */

import { Badge } from './badges';
import { MENTORIA_COPY } from '../constants/mentoria-brand';

// ============================================
// TYPES
// ============================================

export interface CelebrationConfig {
  type: CelebrationType;
  title: string;
  message: string;
  badge?: Badge;
  icon?: string;
  duration?: number; // milliseconds
  confetti?: boolean;
  sound?: boolean;
}

export type CelebrationType = 
  | 'badge_earned'
  | 'streak_milestone'
  | 'goal_completed'
  | 'budget_success'
  | 'first_action'
  | 'month_complete';

// ============================================
// CELEBRATION BUILDERS
// ============================================

/**
 * Create a celebration configuration for a badge earned
 * 
 * @param badge - Badge que se ganó
 * @returns Configuración de celebración
 */
export function celebrateBadgeEarned(badge: Badge): CelebrationConfig {
  return {
    type: 'badge_earned',
    title: `¡Nuevo Logro Desbloqueado!`,
    message: `**${badge.name}**\n\n${badge.description}`,
    badge,
    icon: badge.icon,
    duration: 5000,
    confetti: badge.rarity !== 'common',
    sound: true
  };
}

/**
 * Create a celebration for a streak milestone
 * 
 * @param days - Número de días de racha
 * @param habitName - Nombre del hábito
 * @returns Configuración de celebración
 */
export function celebrateStreakMilestone(
  days: number,
  habitName: string = 'Registro Diario'
): CelebrationConfig {
  let title = '¡Racha Increíble!';
  let message = `¡${days} días seguidos registrando! Vas muy bien. 🔥`;
  let confetti = false;

  if (days >= 30) {
    title = '¡Un Mes Completo!';
    message = MENTORIA_COPY.celebrations.streak30;
    confetti = true;
  } else if (days >= 21) {
    message = MENTORIA_COPY.celebrations.streak21;
    confetti = true;
  } else if (days >= 14) {
    message = MENTORIA_COPY.celebrations.streak14;
  } else if (days >= 7) {
    message = MENTORIA_COPY.celebrations.streak7;
    confetti = true;
  } else if (days >= 3) {
    message = MENTORIA_COPY.celebrations.streak3;
  }

  return {
    type: 'streak_milestone',
    title,
    message,
    icon: '🔥',
    duration: 4000,
    confetti,
    sound: true
  };
}

/**
 * Create a celebration for goal completed
 * 
 * @param goalName - Nombre de la meta
 * @param amount - Monto alcanzado (opcional)
 * @returns Configuración de celebración
 */
export function celebrateGoalCompleted(
  goalName: string,
  amount?: number
): CelebrationConfig {
  let message = MENTORIA_COPY.celebrations.goalCompleted;
  
  if (amount) {
    message += `\n\nMonto alcanzado: $${amount.toLocaleString()}`;
  }

  return {
    type: 'goal_completed',
    title: `¡Meta Alcanzada!`,
    message: `**${goalName}**\n\n${message}`,
    icon: '🎯',
    duration: 5000,
    confetti: true,
    sound: true
  };
}

/**
 * Create a celebration for budget success
 * 
 * @param percentage - Porcentaje de cumplimiento del presupuesto
 * @returns Configuración de celebración
 */
export function celebrateBudgetSuccess(percentage: number): CelebrationConfig {
  const message = percentage >= 100
    ? '¡Completaste tu presupuesto del mes! 🏆 Excelente control.'
    : `¡Cumpliste el ${percentage}% de tu presupuesto! Vas por buen camino. 📊`;

  return {
    type: 'budget_success',
    title: '¡Bien Hecho!',
    message,
    icon: '💰',
    duration: 4000,
    confetti: percentage >= 100,
    sound: true
  };
}

/**
 * Create a celebration for first action
 * 
 * @param actionType - Tipo de acción (transaction, budget, etc.)
 * @returns Configuración de celebración
 */
export function celebrateFirstAction(
  actionType: 'transaction' | 'budget' | 'savings'
): CelebrationConfig {
  const configs: Record<typeof actionType, { title: string; message: string; icon: string }> = {
    transaction: {
      title: '¡Primer Paso!',
      message: MENTORIA_COPY.celebrations.firstExpense,
      icon: '🎯'
    },
    budget: {
      title: '¡Presupuesto Creado!',
      message: MENTORIA_COPY.celebrations.firstBudget,
      icon: '💰'
    },
    savings: {
      title: '¡Primer Ahorro!',
      message: MENTORIA_COPY.celebrations.savingsStart,
      icon: '💵'
    }
  };

  const config = configs[actionType];

  return {
    type: 'first_action',
    title: config.title,
    message: config.message,
    icon: config.icon,
    duration: 4000,
    confetti: false,
    sound: true
  };
}

/**
 * Create a celebration for month completion
 * 
 * @param monthName - Nombre del mes completado
 * @returns Configuración de celebración
 */
export function celebrateMonthComplete(monthName: string): CelebrationConfig {
  return {
    type: 'month_complete',
    title: '¡Mes Completado!',
    message: `¡Completaste todo el mes de ${monthName}! 🏆\n\nEsto es un logro importante. Cada mes te acercas más a tus metas.`,
    icon: '🏆',
    duration: 5000,
    confetti: true,
    sound: true
  };
}

// ============================================
// CELEBRATION MESSAGES
// ============================================

/**
 * Get a random motivational message based on context
 * 
 * @param context - Contexto de la celebración
 * @returns Mensaje motivacional
 */
export function getMotivationalMessage(
  context: 'streak' | 'savings' | 'budget' | 'general'
): string {
  const messages: Record<typeof context, string[]> = {
    streak: [
      '¡La constancia es clave! Sigue así.',
      'Cada día cuenta. Vas muy bien.',
      '¡No pares! Estás construyendo un gran hábito.',
      'Tu disciplina está dando frutos. 💪'
    ],
    savings: [
      'Cada peso ahorrado es un paso hacia tu libertad financiera.',
      '¡Buen trabajo! El ahorro es el camino.',
      'Poco a poco, estás construyendo tu futuro.',
      'Cada ahorro cuenta. ¡Sigue así!'
    ],
    budget: [
      '¡Excelente control de tu presupuesto!',
      'Manejar bien tu dinero es un superpoder.',
      '¡Lo estás haciendo genial!',
      'Tu disciplina financiera está mejorando cada día.'
    ],
    general: [
      '¡Sigue así! Cada acción cuenta.',
      '¡Vas por buen camino!',
      'Pequeños pasos, grandes resultados.',
      '¡Estás haciendo un gran trabajo!'
    ]
  };

  const contextMessages = messages[context];
  const randomIndex = Math.floor(Math.random() * contextMessages.length);
  return contextMessages[randomIndex];
}

/**
 * Get encouragement message based on progress percentage
 * 
 * @param progress - Porcentaje de progreso (0-100)
 * @returns Mensaje de aliento
 */
export function getProgressEncouragement(progress: number): string {
  if (progress >= 90) {
    return '¡Ya casi! Un último empujón. 💪';
  } else if (progress >= 75) {
    return '¡Vas súper bien! Sigue así.';
  } else if (progress >= 50) {
    return '¡Mitad del camino! No te detengas.';
  } else if (progress >= 25) {
    return 'Buen inicio. Paso a paso llegarás.';
  } else {
    return '¡Empezaste! Eso es lo más importante.';
  }
}

// ============================================
// CONFETTI CONFIGURATIONS
// ============================================

/**
 * Get confetti configuration based on celebration type
 * 
 * @param type - Tipo de celebración
 * @returns Configuración de confetti
 */
export function getConfettiConfig(type: CelebrationType): {
  particleCount: number;
  spread: number;
  origin: { y: number };
  colors?: string[];
} {
  const configs: Record<CelebrationType, any> = {
    badge_earned: {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2E5BFF', '#00C48C', '#FFB800']
    },
    streak_milestone: {
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF6B35', '#FFB800', '#F39C12']
    },
    goal_completed: {
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#00C48C', '#2E5BFF', '#9B59B6']
    },
    budget_success: {
      particleCount: 60,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#00C48C', '#3498DB']
    },
    first_action: {
      particleCount: 50,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#2E5BFF', '#00C48C']
    },
    month_complete: {
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#F39C12', '#E74C3C', '#9B59B6', '#3498DB']
    }
  };

  return configs[type] || configs.badge_earned;
}

// ============================================
// CELEBRATION QUEUE
// ============================================

let celebrationQueue: CelebrationConfig[] = [];

/**
 * Add a celebration to the queue
 * 
 * @param celebration - Configuración de celebración
 */
export function queueCelebration(celebration: CelebrationConfig): void {
  celebrationQueue.push(celebration);
}

/**
 * Get next celebration from queue
 * 
 * @returns Próxima celebración o null
 */
export function getNextCelebration(): CelebrationConfig | null {
  return celebrationQueue.shift() || null;
}

/**
 * Clear all pending celebrations
 */
export function clearCelebrationQueue(): void {
  celebrationQueue = [];
}

/**
 * Get count of pending celebrations
 * 
 * @returns Número de celebraciones pendientes
 */
export function getPendingCelebrationsCount(): number {
  return celebrationQueue.length;
}

