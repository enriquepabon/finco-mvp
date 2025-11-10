/**
 * Badge System - MentorIA
 * 
 * Sistema de verificación y otorgamiento de badges (logros)
 * para gamificación sutil y motivación del usuario.
 */

import { supabase } from '../supabase/client';
import { calculateCurrentStreak } from '../habits/tracker';

// ============================================
// TYPES
// ============================================

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  criteria: BadgeCriteria;
  points: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  progress_data?: Record<string, any>;
  is_seen: boolean;
  seen_at?: string;
  badge?: Badge; // Populated via join
}

export type BadgeCategory = 'habits' | 'streak' | 'savings' | 'milestones';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeCriteria {
  type: 'transaction_count' | 'streak' | 'savings_contribution' | 'budget_created' | 'goal_completed';
  count?: number;
  days?: number;
  habit_type?: string;
  amount?: number;
}

export interface BadgeCheckResult {
  earned: boolean;
  badge?: Badge;
  userBadge?: UserBadge;
  progress?: number; // 0-100
  message?: string;
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Check if user meets criteria for a specific badge
 * 
 * @param userId - ID del usuario
 * @param badgeSlug - Slug del badge a verificar
 * @returns Resultado de la verificación
 */
export async function checkBadgeCriteria(
  userId: string,
  badgeSlug: string
): Promise<BadgeCheckResult> {
  try {
    // Get badge definition
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('slug', badgeSlug)
      .eq('is_active', true)
      .single();

    if (badgeError || !badge) {
      console.error('Badge not found:', badgeSlug);
      return { earned: false };
    }

    // Check if user already has this badge
    const { data: existingBadge } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .eq('badge_id', badge.id)
      .maybeSingle();

    if (existingBadge) {
      return { 
        earned: true, 
        badge: badge as Badge, 
        userBadge: existingBadge as UserBadge,
        message: 'Ya tienes este logro' 
      };
    }

    // Verify criteria based on type
    const criteria = badge.criteria as BadgeCriteria;
    let meetsCriteria = false;
    let progress = 0;

    switch (criteria.type) {
      case 'transaction_count':
        const result = await checkTransactionCount(userId, criteria.count || 1);
        meetsCriteria = result.meets;
        progress = result.progress;
        break;

      case 'streak':
        const streakResult = await checkStreakCriteria(userId, criteria.days || 7, criteria.habit_type);
        meetsCriteria = streakResult.meets;
        progress = streakResult.progress;
        break;

      case 'savings_contribution':
        const savingsResult = await checkSavingsContributions(userId, criteria.count || 1);
        meetsCriteria = savingsResult.meets;
        progress = savingsResult.progress;
        break;

      case 'budget_created':
        const budgetResult = await checkBudgetCreated(userId);
        meetsCriteria = budgetResult.meets;
        progress = budgetResult.progress;
        break;

      case 'goal_completed':
        const goalResult = await checkGoalsCompleted(userId, criteria.count || 1);
        meetsCriteria = goalResult.meets;
        progress = goalResult.progress;
        break;

      default:
        console.warn('Unknown criteria type:', criteria.type);
    }

    if (meetsCriteria) {
      // Award badge to user
      const { data: newUserBadge, error: awardError } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badge.id,
          progress_data: { progress, earned_at_ts: Date.now() }
        })
        .select()
        .single();

      if (awardError) {
        console.error('Error awarding badge:', awardError);
        return { earned: false };
      }

      console.log(`✨ Badge earned: ${badge.name} (${badgeSlug})`);
      return { 
        earned: true, 
        badge: badge as Badge, 
        userBadge: newUserBadge as UserBadge,
        progress: 100,
        message: badge.description 
      };
    }

    return { 
      earned: false, 
      badge: badge as Badge, 
      progress,
      message: `Progreso: ${Math.round(progress)}%` 
    };

  } catch (error) {
    console.error('Error checking badge criteria:', error);
    return { earned: false };
  }
}

/**
 * Check all badges for a user and award any newly earned ones
 * 
 * @param userId - ID del usuario
 * @returns Array de badges ganados en esta verificación
 */
export async function checkAllBadges(userId: string): Promise<Badge[]> {
  try {
    // Get all active badges
    const { data: badges } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (!badges) return [];

    const earnedBadges: Badge[] = [];

    // Check each badge
    for (const badge of badges) {
      const result = await checkBadgeCriteria(userId, badge.slug);
      if (result.earned && result.userBadge && !result.userBadge.is_seen) {
        // Only include newly earned badges (not seen yet)
        earnedBadges.push(badge as Badge);
      }
    }

    return earnedBadges;

  } catch (error) {
    console.error('Error checking all badges:', error);
    return [];
  }
}

/**
 * Get all badges earned by a user
 * 
 * @param userId - ID del usuario
 * @returns Array de badges del usuario
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badges (*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return (data as any[]).map(ub => ({
      ...ub,
      badge: ub.badge
    })) as UserBadge[];

  } catch (error) {
    console.error('Error in getUserBadges:', error);
    return [];
  }
}

/**
 * Mark a badge as seen by the user
 * 
 * @param userBadgeId - ID del user_badge
 */
export async function markBadgeAsSeen(userBadgeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_badges')
      .update({
        is_seen: true,
        seen_at: new Date().toISOString()
      })
      .eq('id', userBadgeId);

    if (error) {
      console.error('Error marking badge as seen:', error);
      return false;
    }

    return true;

  } catch (error) {
    console.error('Error in markBadgeAsSeen:', error);
    return false;
  }
}

// ============================================
// CRITERIA CHECKERS
// ============================================

/**
 * Check if user has registered N transactions
 */
async function checkTransactionCount(
  userId: string, 
  requiredCount: number
): Promise<{ meets: boolean; progress: number }> {
  try {
    const { count } = await supabase
      .from('budget_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const actualCount = count || 0;
    const meets = actualCount >= requiredCount;
    const progress = Math.min((actualCount / requiredCount) * 100, 100);

    return { meets, progress };

  } catch (error) {
    console.error('Error checking transaction count:', error);
    return { meets: false, progress: 0 };
  }
}

/**
 * Check if user has a streak of N days
 */
async function checkStreakCriteria(
  userId: string,
  requiredDays: number,
  habitType?: string
): Promise<{ meets: boolean; progress: number }> {
  try {
    const habit = habitType || 'daily_expense_log';
    const currentStreak = await calculateCurrentStreak(userId, habit as any);

    const meets = currentStreak >= requiredDays;
    const progress = Math.min((currentStreak / requiredDays) * 100, 100);

    return { meets, progress };

  } catch (error) {
    console.error('Error checking streak:', error);
    return { meets: false, progress: 0 };
  }
}

/**
 * Check if user has made N savings contributions
 */
async function checkSavingsContributions(
  userId: string,
  requiredCount: number
): Promise<{ meets: boolean; progress: number }> {
  try {
    const { count } = await supabase
      .from('user_habits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('habit_type', 'savings_contribution');

    const actualCount = count || 0;
    const meets = actualCount >= requiredCount;
    const progress = Math.min((actualCount / requiredCount) * 100, 100);

    return { meets, progress };

  } catch (error) {
    console.error('Error checking savings contributions:', error);
    return { meets: false, progress: 0 };
  }
}

/**
 * Check if user has created a budget
 */
async function checkBudgetCreated(
  userId: string
): Promise<{ meets: boolean; progress: number }> {
  try {
    const { data } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    const meets = data !== null;
    const progress = meets ? 100 : 0;

    return { meets, progress };

  } catch (error) {
    console.error('Error checking budget created:', error);
    return { meets: false, progress: 0 };
  }
}

/**
 * Check if user has completed N goals
 */
async function checkGoalsCompleted(
  userId: string,
  requiredCount: number
): Promise<{ meets: boolean; progress: number }> {
  try {
    // TODO: Implementar cuando se cree el sistema de metas
    // Por ahora, retornar false
    return { meets: false, progress: 0 };

  } catch (error) {
    console.error('Error checking goals completed:', error);
    return { meets: false, progress: 0 };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get badge rarity color
 */
export function getBadgeRarityColor(rarity: BadgeRarity): string {
  const colors: Record<BadgeRarity, string> = {
    common: '#95A5A6',
    rare: '#3498DB',
    epic: '#9B59B6',
    legendary: '#F39C12'
  };
  return colors[rarity] || colors.common;
}

/**
 * Get badge rarity label
 */
export function getBadgeRarityLabel(rarity: BadgeRarity): string {
  const labels: Record<BadgeRarity, string> = {
    common: 'Común',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Legendario'
  };
  return labels[rarity] || 'Común';
}

/**
 * Calculate total points from user badges
 */
export async function getUserTotalPoints(userId: string): Promise<number> {
  try {
    const userBadges = await getUserBadges(userId);
    const total = userBadges.reduce((sum, ub) => {
      return sum + (ub.badge?.points || 0);
    }, 0);
    return total;

  } catch (error) {
    console.error('Error calculating user points:', error);
    return 0;
  }
}

