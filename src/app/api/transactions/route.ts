/**
 * API de Transacciones - MentorIA
 * POST: Crear nueva transacción
 * GET: Listar transacciones con filtros
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateTransactionInput, Transaction } from '@/types/transaction';
import { trackHabit } from '@/lib/habits/tracker';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/transactions
 * Crear nueva transacción y actualizar actual_amount de categoría
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateTransactionInput = await request.json();

    console.log('📝 Creating transaction:', body);

    // Validaciones
    if (!body.budget_id || !body.description || !body.amount || !body.transaction_type) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: budget_id, description, amount, transaction_type' },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      );
    }

    if (!['income', 'expense'].includes(body.transaction_type)) {
      return NextResponse.json(
        { error: 'transaction_type debe ser "income" o "expense"' },
        { status: 400 }
      );
    }

    // Obtener user_id del budget
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .select('user_id')
      .eq('id', body.budget_id)
      .single();

    if (budgetError || !budget) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      );
    }

    // 🔍 Validación: Si se especifica una categoría, verificar si tiene subcategorías
    if (body.category_id && !body.subcategory_id) {
      const { data: subcategories, error: subcatError } = await supabase
        .from('budget_subcategories')
        .select('id, name')
        .eq('category_id', body.category_id)
        .eq('is_active', true);

      if (!subcatError && subcategories && subcategories.length > 0) {
        // La categoría tiene subcategorías activas, debe elegir una
        return NextResponse.json(
          {
            error: 'Esta categoría tiene subcategorías. Debes seleccionar una.',
            requires_subcategory: true,
            available_subcategories: subcategories
          },
          { status: 400 }
        );
      }
    }

    // Crear transacción
    const transactionData = {
      budget_id: body.budget_id,
      category_id: body.category_id || null,
      subcategory_id: body.subcategory_id || null,
      user_id: budget.user_id,
      description: body.description,
      detail: body.detail || null, // 🆕 Campo detail
      amount: body.amount,
      transaction_type: body.transaction_type,
      transaction_date: body.transaction_date || new Date().toISOString().split('T')[0],
      location: body.location || null,
      notes: body.notes || null,
      auto_categorized: body.auto_categorized || false,
      confidence_score: body.confidence_score || null
    };

    const { data: transaction, error: insertError } = await supabase
      .from('budget_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting transaction:', insertError);
      return NextResponse.json(
        {
          error: 'Error al crear transacción',
          // Solo mostrar detalles técnicos en desarrollo
          ...(process.env.NODE_ENV === 'development' && { details: insertError.message })
        },
        { status: 500 }
      );
    }

    console.log('✅ Transaction created:', transaction.id);

    // Actualizar actual_amount de la categoría o subcategoría
    if (body.category_id) {
      await updateCategoryActualAmount(body.category_id, body.subcategory_id);
    }

    // Recalcular totales del presupuesto
    await recalculateBudgetTotals(body.budget_id);

    // 🔥 Track habit: Usuario registró un gasto/ingreso
    try {
      await trackHabit(budget.user_id, 'daily_expense_log', {
        transaction_id: transaction.id,
        transaction_type: body.transaction_type,
        amount: body.amount,
      });
      console.log('🎯 Habit tracked: daily_expense_log');
    } catch (habitError) {
      // No fallar la transacción si el tracking de hábito falla
      console.error('⚠️ Error tracking habit (non-critical):', habitError);
    }

    return NextResponse.json({ transaction }, { status: 201 });

  } catch (error) {
    console.error('❌ Error in POST /api/transactions:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        // Solo mostrar detalles técnicos en desarrollo
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/transactions
 * Listar transacciones con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const budgetId = searchParams.get('budget_id');
    const categoryId = searchParams.get('category_id');
    const transactionType = searchParams.get('transaction_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('budget_transactions')
      .select(`
        *,
        category:budget_categories(id, name, category_type, color_hex, icon_name),
        subcategory:budget_subcategories(id, name)
      `)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    // Aplicar filtros
    if (budgetId) {
      query = query.eq('budget_id', budgetId);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (transactionType) {
      query = query.eq('transaction_type', transactionType);
    }

    if (startDate) {
      query = query.gte('transaction_date', startDate);
    }

    if (endDate) {
      query = query.lte('transaction_date', endDate);
    }

    const { data: transactions, error } = await query;

    if (error) {
      console.error('❌ Error fetching transactions:', error);
      return NextResponse.json(
        {
          error: 'Error al obtener transacciones',
          // Solo mostrar detalles técnicos en desarrollo
          ...(process.env.NODE_ENV === 'development' && { details: error.message })
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ transactions }, { status: 200 });

  } catch (error) {
    console.error('❌ Error in GET /api/transactions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Actualizar actual_amount de una categoría basado en sus transacciones
 * 
 * LÓGICA:
 * 1. Si la transacción tiene subcategory_id → actualizar subcategoría
 * 2. Actualizar la categoría sumando TODAS sus subcategorías (si existen)
 * 3. Si la categoría NO tiene subcategorías → sumar transacciones directas
 */
async function updateCategoryActualAmount(categoryId: string, subcategoryId?: string) {
  try {
    // 1. Si hay subcategoría, actualizar su actual_amount
    if (subcategoryId) {
      const { data: subTransactions } = await supabase
        .from('budget_transactions')
        .select('amount')
        .eq('subcategory_id', subcategoryId);

      const subTotalAmount = subTransactions?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

      await supabase
        .from('budget_subcategories')
        .update({ actual_amount: subTotalAmount })
        .eq('id', subcategoryId);

      console.log(`✅ Updated subcategory ${subcategoryId} actual_amount: ${subTotalAmount}`);
    }

    // 2. Verificar si la categoría tiene subcategorías
    const { data: subcategories } = await supabase
      .from('budget_subcategories')
      .select('actual_amount')
      .eq('category_id', categoryId)
      .eq('is_active', true);

    let categoryTotalAmount = 0;

    if (subcategories && subcategories.length > 0) {
      // La categoría tiene subcategorías: sumar los actual_amount de todas
      categoryTotalAmount = subcategories.reduce((sum, sub) => sum + parseFloat(sub.actual_amount?.toString() || '0'), 0);
      console.log(`📊 Category ${categoryId} total from ${subcategories.length} subcategories: ${categoryTotalAmount}`);
    } else {
      // La categoría NO tiene subcategorías: sumar transacciones directas
      const { data: categoryTransactions } = await supabase
        .from('budget_transactions')
        .select('amount')
        .eq('category_id', categoryId)
        .is('subcategory_id', null); // Solo transacciones SIN subcategoría

      categoryTotalAmount = categoryTransactions?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
      console.log(`📊 Category ${categoryId} total from direct transactions: ${categoryTotalAmount}`);
    }

    // 3. Actualizar actual_amount de la categoría
    await supabase
      .from('budget_categories')
      .update({ actual_amount: categoryTotalAmount })
      .eq('id', categoryId);

    console.log(`✅ Updated category ${categoryId} actual_amount: ${categoryTotalAmount}`);

  } catch (error) {
    console.error('❌ Error updating category actual_amount:', error);
  }
}

/**
 * Recalcular totales del presupuesto
 */
async function recalculateBudgetTotals(budgetId: string) {
  try {
    // La base de datos tiene un trigger que hace esto automáticamente
    // pero lo llamamos explícitamente por seguridad
    await supabase.rpc('recalculate_budget_totals', { budget_uuid: budgetId });
    console.log(`✅ Recalculated budget ${budgetId} totals`);
  } catch (error) {
    console.error('❌ Error recalculating budget totals:', error);
  }
}

