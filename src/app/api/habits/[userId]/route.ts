/**
 * API Route: GET /api/habits/[userId]
 * 
 * Obtiene el resumen de hábitos de un usuario específico
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserHabitSummary } from '@/lib/habits/tracker';
import { getAllActiveStreaks } from '@/lib/habits/streaks';

// Supabase client con service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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

    // Verificar que el usuario solo puede ver sus propios hábitos
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para ver estos hábitos' },
        { status: 403 }
      );
    }

    // Obtener resumen de hábitos
    const { data: habitSummary, error: summaryError } = await getUserHabitSummary(userId);

    if (summaryError) {
      console.error('Error fetching habit summary:', summaryError);
      return NextResponse.json(
        { error: 'Error al obtener hábitos' },
        { status: 500 }
      );
    }

    // Obtener rachas activas
    const activeStreaks = await getAllActiveStreaks(userId);

    return NextResponse.json({
      success: true,
      habitSummary,
      activeStreaks
    });

  } catch (error) {
    console.error('Error in GET /api/habits/[userId]:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}

