/**
 * API Route: POST /api/badges/check
 * 
 * Verifica y otorga badges basados en las acciones del usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkAllBadges, checkBadgeCriteria } from '@/lib/gamification/badges';

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
    const { specificBadgeSlug, checkAll } = body;

    let newBadges = [];

    if (specificBadgeSlug) {
      // Verificar un badge específico
      const result = await checkBadgeCriteria(user.id, specificBadgeSlug);
      if (result.earned && result.badge) {
        newBadges.push(result.badge);
      }
    } else if (checkAll) {
      // Verificar todos los badges
      newBadges = await checkAllBadges(user.id);
    } else {
      return NextResponse.json(
        { error: 'Debe especificar specificBadgeSlug o checkAll' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      newBadges,
      count: newBadges.length,
      message: newBadges.length > 0 
        ? `¡Ganaste ${newBadges.length} nuevo${newBadges.length > 1 ? 's' : ''} logro${newBadges.length > 1 ? 's' : ''}!`
        : 'No hay nuevos logros por ahora'
    });

  } catch (error) {
    console.error('Error in POST /api/badges/check:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}

