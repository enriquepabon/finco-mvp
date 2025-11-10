/**
 * API Route: POST /api/habits/track
 * 
 * Registra la completación de un hábito
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { trackHabit, HabitType } from '@/lib/habits/tracker';
import { getStreakData, checkMilestoneReached } from '@/lib/habits/streaks';

// Supabase client con service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const { habitType, metadata } = body;

    if (!habitType) {
      return NextResponse.json(
        { error: 'habitType is required' },
        { status: 400 }
      );
    }

    // Validar habitType
    const validHabitTypes: HabitType[] = [
      'daily_expense_log',
      'budget_check',
      'goal_review',
      'savings_contribution',
      'weekly_review',
      'document_upload',
      'chat_interaction'
    ];

    if (!validHabitTypes.includes(habitType as HabitType)) {
      return NextResponse.json(
        { error: 'Invalid habit type' },
        { status: 400 }
      );
    }

    // Obtener streak anterior
    const previousStreakData = await getStreakData(user.id, habitType as HabitType);
    const previousStreak = previousStreakData.currentStreak;

    // Registrar hábito
    const { data: habit, error: trackError } = await trackHabit(
      user.id,
      habitType as HabitType,
      metadata
    );

    if (trackError || !habit) {
      console.error('Error tracking habit:', trackError);
      return NextResponse.json(
        { error: 'Error al registrar hábito' },
        { status: 500 }
      );
    }

    // Obtener streak actualizado
    const newStreakData = await getStreakData(user.id, habitType as HabitType);

    // Verificar si alcanzó un milestone
    const milestoneReached = checkMilestoneReached(
      newStreakData.currentStreak,
      previousStreak
    );

    return NextResponse.json({
      success: true,
      habit,
      streakData: newStreakData,
      milestoneReached,
      message: newStreakData.encouragementMessage
    });

  } catch (error) {
    console.error('Error in POST /api/habits/track:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}

