import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { budgetData } = await request.json();

    if (!budgetData) {
      return NextResponse.json(
        { error: 'budgetData es requerido' },
        { status: 400 }
      );
    }

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

    console.log('📊 Creando presupuesto para usuario:', user.email);
    console.log('📋 Datos recibidos:', JSON.stringify(budgetData, null, 2));

    // Extraer mes y año
    const budgetMonth = budgetData.month || (new Date().getMonth() + 1);
    const budgetYear = budgetData.year || new Date().getFullYear();

    // Verificar si ya existe un presupuesto para este período
    const { data: existingBudget } = await supabaseAdmin
      .from('budgets')
      .select('id')
      .eq('user_id', user.id)
      .eq('budget_month', budgetMonth)
      .eq('budget_year', budgetYear)
      .single();

    if (existingBudget) {
      return NextResponse.json(
        { 
          error: 'Ya existe un presupuesto para este período',
          existingBudgetId: existingBudget.id,
          message: `Ya tienes un presupuesto creado para ${budgetMonth}/${budgetYear}. ¿Deseas editarlo?`
        },
        { status: 409 }
      );
    }

    // Calcular totales
    const totalIncome = (budgetData.ingresos || []).reduce((sum: number, item: any) => sum + (item.monto || 0), 0);
    const totalFixedExpenses = (budgetData.gastos_fijos || []).reduce((sum: number, item: any) => sum + (item.monto || 0), 0);
    const totalVariableExpenses = (budgetData.gastos_variables || []).reduce((sum: number, item: any) => sum + (item.monto || 0), 0);
    const totalSavings = (budgetData.ahorros || []).reduce((sum: number, item: any) => sum + (item.monto || 0), 0);

    console.log('💰 Totales:', {
      ingresos: totalIncome,
      gastos_fijos: totalFixedExpenses,
      gastos_variables: totalVariableExpenses,
      ahorros: totalSavings
    });

    // Crear presupuesto
    const { data: budget, error: budgetError } = await supabaseAdmin
      .from('budgets')
      .insert({
        user_id: user.id,
        budget_month: budgetMonth,
        budget_year: budgetYear,
        total_income: totalIncome,
        total_fixed_expenses: totalFixedExpenses,
        total_variable_expenses: totalVariableExpenses,
        total_savings_goal: totalSavings,
        status: 'active',
        created_via_chat: true,
        chat_completed: true
      })
      .select()
      .single();

    if (budgetError) {
      console.error('❌ Error creando presupuesto:', budgetError);
      throw new Error('Error al crear el presupuesto en la base de datos');
    }

    console.log('✅ Presupuesto creado con ID:', budget.id);

    // Preparar categorías individuales
    const categoriesToCreate: any[] = [];

    // Ingresos - cada uno como categoría separada
    (budgetData.ingresos || []).forEach((item: any) => {
      categoriesToCreate.push({
        tipo: 'income',
        nombre: item.nombre,
        monto: item.monto,
        expense_type: null,
        is_essential: null
      });
    });

    // Gastos fijos - cada uno como categoría separada
    (budgetData.gastos_fijos || []).forEach((item: any) => {
      categoriesToCreate.push({
        tipo: 'expense',
        nombre: item.nombre,
        monto: item.monto,
        expense_type: 'fixed',
        is_essential: true
      });
    });

    // Gastos variables - cada uno como categoría separada
    (budgetData.gastos_variables || []).forEach((item: any) => {
      categoriesToCreate.push({
        tipo: 'expense',
        nombre: item.nombre,
        monto: item.monto,
        expense_type: 'variable',
        is_essential: false
      });
    });

    // Ahorros - cada uno como categoría separada
    (budgetData.ahorros || []).forEach((item: any) => {
      categoriesToCreate.push({
        tipo: 'savings',
        nombre: item.nombre,
        monto: item.monto,
        expense_type: null,
        is_essential: null
      });
    });

    console.log(`📝 Creando ${categoriesToCreate.length} categorías individuales...`);

    // Crear categorías
    for (const categoria of categoriesToCreate) {
      const { error: categoryError } = await supabaseAdmin
        .from('budget_categories')
        .insert({
          budget_id: budget.id,
          user_id: user.id,
          name: categoria.nombre,
          category_type: categoria.tipo,
          expense_type: categoria.expense_type,
          budgeted_amount: categoria.monto,
          actual_amount: 0,
          is_essential: categoria.is_essential,
          is_active: true
        });

      if (categoryError) {
        console.error(`❌ Error creando categoría "${categoria.nombre}":`, categoryError);
        continue;
      }

      console.log(`✅ ${categoria.nombre} (${categoria.tipo}${categoria.expense_type ? `:${categoria.expense_type}` : ''})`);
    }

    console.log('✅ Presupuesto completamente creado');

    return NextResponse.json({
      success: true,
      budget: {
        id: budget.id,
        budget_month: budgetMonth,
        budget_year: budgetYear
      },
      message: '¡Presupuesto creado exitosamente! 🎉'
    });

  } catch (error) {
    console.error('❌ Error en create-budget API:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
