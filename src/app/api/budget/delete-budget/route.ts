import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    // Obtener usuario autenticado
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autorizado' },
        { status: 401 }
      );
    }

    // Obtener mes y año de los query params
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Se requieren parámetros month y year' },
        { status: 400 }
      );
    }

    console.log(`🗑️  Eliminando presupuesto de ${month}/${year} para usuario:`, user.email);

    // Buscar el presupuesto
    const { data: budget, error: findError } = await supabaseAdmin
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('budget_month', parseInt(month))
      .eq('budget_year', parseInt(year))
      .single();

    if (findError || !budget) {
      return NextResponse.json(
        { error: 'No se encontró el presupuesto' },
        { status: 404 }
      );
    }

    console.log(`📦 Presupuesto encontrado: ${budget.id}`);

    // Eliminar subcategorías primero (si existen)
    const { error: subcatError } = await supabaseAdmin
      .from('budget_subcategories')
      .delete()
      .eq('budget_id', budget.id);

    if (subcatError) {
      console.error('❌ Error eliminando subcategorías:', subcatError);
    } else {
      console.log('✅ Subcategorías eliminadas');
    }

    // Eliminar categorías
    const { error: catError } = await supabaseAdmin
      .from('budget_categories')
      .delete()
      .eq('budget_id', budget.id);

    if (catError) {
      console.error('❌ Error eliminando categorías:', catError);
    } else {
      console.log('✅ Categorías eliminadas');
    }

    // Eliminar el presupuesto principal
    const { error: budgetError } = await supabaseAdmin
      .from('budgets')
      .delete()
      .eq('id', budget.id);

    if (budgetError) {
      console.error('❌ Error eliminando presupuesto:', budgetError);
      throw new Error('Error al eliminar el presupuesto');
    }

    console.log('✅ Presupuesto completamente eliminado');

    return NextResponse.json({
      success: true,
      message: 'Presupuesto eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en delete-budget API:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

