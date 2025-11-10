/**
 * Habit Tracker - MentorIA
 * 
 * Sistema de tracking de hábitos financieros para gamificación
 * y nudges comportamentales.
 */

import { supabase } from '../supabase/client';

// ============================================
// TYPES
// ============================================

export type HabitType =
  | 'daily_expense_log'      // Usuario registró al menos un gasto hoy
  | 'budget_check'           // Usuario revisó su presupuesto hoy
  | 'goal_review'            // Usuario revisó sus metas financieras
  | 'savings_contribution'   // Usuario hizo una contribución a ahorros
  | 'weekly_review'          // Usuario completó su revisión semanal
  | 'document_upload'        // Usuario subió un documento financiero
  | 'chat_interaction';      // Usuario interactuó con MentorIA

export interface Habit {
  id: string;
  user_id: string;
  habit_type: HabitType;
  completed_at: string;
  streak_count: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface HabitSummary {
  habit_type: HabitType;
  current_streak: number;
  last_completed: string | null;
  total_completions: number;
  longest_streak: number;
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Track a habit completion
 * 
 * @param userId - ID del usuario
 * @param habitType - Tipo de hábito completado
 * @param metadata - Datos adicionales opcionales
 * @returns Habit record creado o error
 */
export async function trackHabit(
  userId: string,
  habitType: HabitType,
  metadata?: Record<string, any>
): Promise<{ data: Habit | null; error: Error | null }> {
  try {
    // Verificar si ya existe un registro hoy para este hábito
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: existingHabit, error: checkError } = await supabase
      .from('user_habits')
      .select('*')
      .eq('user_id', userId)
      .eq('habit_type', habitType)
      .gte('completed_at', today.toISOString())
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing habit:', checkError);
      return { data: null, error: checkError };
    }

    // Si ya completó este hábito hoy, no crear duplicado
    if (existingHabit) {
      console.log(`Habit ${habitType} already completed today for user ${userId}`);
      return { data: existingHabit as Habit, error: null };
    }

    // Calcular el streak actual
    const streak = await calculateCurrentStreak(userId, habitType);

    // Crear nuevo registro de hábito
    const { data: newHabit, error: insertError } = await supabase
      .from('user_habits')
      .insert({
        user_id: userId,
        habit_type: habitType,
        completed_at: new Date().toISOString(),
        streak_count: streak + 1,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting habit:', insertError);
      return { data: null, error: insertError };
    }

    console.log(`✅ Habit tracked: ${habitType} for user ${userId} (streak: ${streak + 1})`);
    return { data: newHabit as Habit, error: null };

  } catch (error) {
    console.error('Error in trackHabit:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Calculate current streak for a specific habit
 * 
 * @param userId - ID del usuario
 * @param habitType - Tipo de hábito
 * @returns Número de días consecutivos
 */
export async function calculateCurrentStreak(
  userId: string,
  habitType: HabitType
): Promise<number> {
  try {
    // Obtener los últimos 30 registros para este hábito
    const { data: habits, error } = await supabase
      .from('user_habits')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('habit_type', habitType)
      .order('completed_at', { ascending: false })
      .limit(30);

    if (error || !habits || habits.length === 0) {
      return 0;
    }

    // Calcular streak consecutivo
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const habit of habits) {
      const habitDate = new Date(habit.completed_at);
      habitDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor(
        (currentDate.getTime() - habitDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Si es el mismo día o el día anterior, incrementar streak
      if (daysDiff === streak) {
        streak++;
      } else {
        // Si hay un gap, terminar el conteo
        break;
      }
    }

    return streak;

  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

/**
 * Get user's habit summary
 * 
 * @param userId - ID del usuario
 * @returns Array de resúmenes de hábitos
 */
export async function getUserHabitSummary(
  userId: string
): Promise<{ data: HabitSummary[]; error: Error | null }> {
  try {
    const habitTypes: HabitType[] = [
      'daily_expense_log',
      'budget_check',
      'goal_review',
      'savings_contribution',
      'weekly_review',
      'document_upload',
      'chat_interaction'
    ];

    const summaries: HabitSummary[] = [];

    for (const habitType of habitTypes) {
      // Obtener todos los registros de este hábito
      const { data: habits, error } = await supabase
        .from('user_habits')
        .select('completed_at, streak_count')
        .eq('user_id', userId)
        .eq('habit_type', habitType)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error(`Error fetching habits for ${habitType}:`, error);
        continue;
      }

      if (!habits || habits.length === 0) {
        summaries.push({
          habit_type: habitType,
          current_streak: 0,
          last_completed: null,
          total_completions: 0,
          longest_streak: 0
        });
        continue;
      }

      // Calcular estadísticas
      const currentStreak = await calculateCurrentStreak(userId, habitType);
      const longestStreak = Math.max(...habits.map(h => h.streak_count));
      const lastCompleted = habits[0].completed_at;

      summaries.push({
        habit_type: habitType,
        current_streak: currentStreak,
        last_completed: lastCompleted,
        total_completions: habits.length,
        longest_streak: longestStreak
      });
    }

    return { data: summaries, error: null };

  } catch (error) {
    console.error('Error in getUserHabitSummary:', error);
    return { data: [], error: error as Error };
  }
}

/**
 * Check if user has completed a habit today
 * 
 * @param userId - ID del usuario
 * @param habitType - Tipo de hábito
 * @returns boolean
 */
export async function hasCompletedHabitToday(
  userId: string,
  habitType: HabitType
): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('user_habits')
      .select('id')
      .eq('user_id', userId)
      .eq('habit_type', habitType)
      .gte('completed_at', today.toISOString())
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error checking habit completion:', error);
      return false;
    }

    return data !== null;

  } catch (error) {
    console.error('Error in hasCompletedHabitToday:', error);
    return false;
  }
}

/**
 * Get days since last habit completion
 * 
 * @param userId - ID del usuario
 * @param habitType - Tipo de hábito
 * @returns Número de días desde la última completación
 */
export async function getDaysSinceLastCompletion(
  userId: string,
  habitType: HabitType
): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('user_habits')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('habit_type', habitType)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return Infinity; // Nunca ha completado el hábito
    }

    const lastCompleted = new Date(data.completed_at);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysDiff;

  } catch (error) {
    console.error('Error in getDaysSinceLastCompletion:', error);
    return Infinity;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get habit display name
 */
export function getHabitDisplayName(habitType: HabitType): string {
  const names: Record<HabitType, string> = {
    daily_expense_log: 'Registro Diario',
    budget_check: 'Revisión de Presupuesto',
    goal_review: 'Revisión de Metas',
    savings_contribution: 'Ahorro',
    weekly_review: 'Revisión Semanal',
    document_upload: 'Subir Documentos',
    chat_interaction: 'Conversar con MentorIA'
  };

  return names[habitType] || habitType;
}

/**
 * Get habit icon
 */
export function getHabitIcon(habitType: HabitType): string {
  const icons: Record<HabitType, string> = {
    daily_expense_log: '📝',
    budget_check: '💰',
    goal_review: '🎯',
    savings_contribution: '💵',
    weekly_review: '📊',
    document_upload: '📄',
    chat_interaction: '💬'
  };

  return icons[habitType] || '✅';
}

