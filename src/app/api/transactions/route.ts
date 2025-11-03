/**
 * API de Transacciones - FINCO
 * POST: Crear nueva transacción
 * GET: Listar transacciones con filtros
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { CreateTransactionInput, Transaction } from '@/types/transaction';

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

    // Crear transacción
    const transactionData = {
      budget_id: body.budget_id,
      category_id: body.category_id || null,
      subcategory_id: body.subcategory_id || null,
      user_id: budget.user_id,
      description: body.description,
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
        { error: 'Error al crear transacción', details: insertError.message },
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

    return NextResponse.json({ transaction }, { status: 201 });

  } catch (error) {
    console.error('❌ Error in POST /api/transactions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
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
        { error: 'Error al obtener transacciones', details: error.message },
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
 */
async function updateCategoryActualAmount(categoryId: string, subcategoryId?: string) {
  try {
    // Si hay subcategoría, actualizar su actual_amount
    if (subcategoryId) {
      const { data: transactions } = await supabase
        .from('budget_transactions')
        .select('amount')
        .eq('subcategory_id', subcategoryId);

      const totalAmount = transactions?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

      await supabase
        .from('budget_subcategories')
        .update({ actual_amount: totalAmount })
        .eq('id', subcategoryId);

      console.log(`✅ Updated subcategory ${subcategoryId} actual_amount: ${totalAmount}`);
    }

    // Actualizar actual_amount de la categoría
    const { data: transactions } = await supabase
      .from('budget_transactions')
      .select('amount')
      .eq('category_id', categoryId);

    const totalAmount = transactions?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;

    await supabase
      .from('budget_categories')
      .update({ actual_amount: totalAmount })
      .eq('id', categoryId);

    console.log(`✅ Updated category ${categoryId} actual_amount: ${totalAmount}`);

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

