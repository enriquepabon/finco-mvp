/**
 * API de Transacciones - FINCO
 * PUT: Editar transacción existente
 * DELETE: Eliminar transacción
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { UpdateTransactionInput } from '@/types/transaction';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PUT /api/transactions/[id]
 * Actualizar transacción existente
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = params.id;
    const body: UpdateTransactionInput = await request.json();

    console.log(`📝 Updating transaction ${transactionId}:`, body);

    // Obtener transacción actual
    const { data: currentTransaction, error: fetchError } = await supabase
      .from('budget_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (fetchError || !currentTransaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    // Validaciones
    if (body.amount !== undefined && body.amount <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      );
    }

    if (body.transaction_type && !['income', 'expense'].includes(body.transaction_type)) {
      return NextResponse.json(
        { error: 'transaction_type debe ser "income" o "expense"' },
        { status: 400 }
      );
    }

    // Actualizar transacción
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('budget_transactions')
      .update(body)
      .eq('id', transactionId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating transaction:', updateError);
      return NextResponse.json(
        {
          error: 'Error al actualizar transacción',
          // Solo mostrar detalles técnicos en desarrollo
          ...(process.env.NODE_ENV === 'development' && { details: updateError.message })
        },
        { status: 500 }
      );
    }

    console.log('✅ Transaction updated:', transactionId);

    // Recalcular actual_amount si cambió la categoría o el monto
    const oldCategoryId = currentTransaction.category_id;
    const newCategoryId = body.category_id || currentTransaction.category_id;
    const oldSubcategoryId = currentTransaction.subcategory_id;
    const newSubcategoryId = body.subcategory_id !== undefined ? body.subcategory_id : currentTransaction.subcategory_id;

    // Si cambió la categoría, actualizar ambas (vieja y nueva)
    if (oldCategoryId && oldCategoryId !== newCategoryId) {
      await updateCategoryActualAmount(oldCategoryId, oldSubcategoryId);
    }
    
    if (newCategoryId) {
      await updateCategoryActualAmount(newCategoryId, newSubcategoryId);
    }

    // Recalcular totales del presupuesto
    await recalculateBudgetTotals(currentTransaction.budget_id);

    return NextResponse.json({ transaction: updatedTransaction }, { status: 200 });

  } catch (error) {
    console.error('❌ Error in PUT /api/transactions/[id]:', error);
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
 * DELETE /api/transactions/[id]
 * Eliminar transacción
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = params.id;

    console.log(`🗑️  Deleting transaction ${transactionId}`);

    // Obtener transacción antes de eliminar
    const { data: transaction, error: fetchError } = await supabase
      .from('budget_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar transacción
    const { error: deleteError } = await supabase
      .from('budget_transactions')
      .delete()
      .eq('id', transactionId);

    if (deleteError) {
      console.error('❌ Error deleting transaction:', deleteError);
      return NextResponse.json(
        {
          error: 'Error al eliminar transacción',
          // Solo mostrar detalles técnicos en desarrollo
          ...(process.env.NODE_ENV === 'development' && { details: deleteError.message })
        },
        { status: 500 }
      );
    }

    console.log('✅ Transaction deleted:', transactionId);

    // Recalcular actual_amount de la categoría
    if (transaction.category_id) {
      await updateCategoryActualAmount(transaction.category_id, transaction.subcategory_id);
    }

    // Recalcular totales del presupuesto
    await recalculateBudgetTotals(transaction.budget_id);

    return NextResponse.json(
      { message: 'Transacción eliminada exitosamente' },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Error in DELETE /api/transactions/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Actualizar actual_amount de una categoría basado en sus transacciones
 */
async function updateCategoryActualAmount(categoryId: string, subcategoryId?: string | null) {
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
    await supabase.rpc('recalculate_budget_totals', { budget_uuid: budgetId });
    console.log(`✅ Recalculated budget ${budgetId} totals`);
  } catch (error) {
    console.error('❌ Error recalculating budget totals:', error);
  }
}

