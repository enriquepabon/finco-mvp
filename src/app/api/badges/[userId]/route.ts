/**
 * API Route: GET /api/badges/[userId]
 * 
 * Obtiene todos los badges ganados por un usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserBadges, getUserTotalPoints } from '@/lib/gamification/badges';

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

    // Verificar que el usuario solo puede ver sus propios badges
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para ver estos badges' },
        { status: 403 }
      );
    }

    // Obtener badges del usuario
    const userBadges = await getUserBadges(userId);
    const totalPoints = await getUserTotalPoints(userId);

    // Obtener badges disponibles (no ganados)
    const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
    const { data: availableBadges } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .not('id', 'in', `(${earnedBadgeIds.join(',') || 'null'})`)
      .order('sort_order');

    return NextResponse.json({
      success: true,
      earnedBadges: userBadges,
      availableBadges: availableBadges || [],
      totalPoints,
      stats: {
        totalEarned: userBadges.length,
        totalAvailable: (availableBadges?.length || 0) + userBadges.length,
        unseenCount: userBadges.filter(b => !b.is_seen).length
      }
    });

  } catch (error) {
    console.error('Error in GET /api/badges/[userId]:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}

