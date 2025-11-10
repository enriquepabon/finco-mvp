import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = params.id;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID de transacción requerido' },
        { status: 400 }
      );
    }

    console.log('🗑️ Eliminando transacción:', transactionId);

    // Primero obtener la transacción para actualizar los totales de la categoría
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('category_id, subcategory_id, amount, transaction_type')
      .eq('id', transactionId)
      .single();

    if (fetchError) {
      console.error('❌ Error obteniendo transacción:', fetchError);
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar la transacción
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (deleteError) {
      console.error('❌ Error eliminando transacción:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar la transacción' },
        { status: 500 }
      );
    }

    // Actualizar el actual_amount de la categoría
    if (transaction.category_id) {
      // Obtener el nuevo total de transacciones de esta categoría
      const { data: categoryTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('category_id', transaction.category_id);

      const newCategoryTotal = categoryTransactions?.reduce(
        (sum, t) => sum + t.amount,
        0
      ) || 0;

      // Actualizar la categoría
      await supabase
        .from('budget_categories')
        .update({ actual_amount: newCategoryTotal })
        .eq('id', transaction.category_id);

      console.log('✅ Categoría actualizada:', transaction.category_id, 'Total:', newCategoryTotal);
    }

    // Actualizar el actual_amount de la subcategoría si existe
    if (transaction.subcategory_id) {
      // Obtener el nuevo total de transacciones de esta subcategoría
      const { data: subcategoryTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('subcategory_id', transaction.subcategory_id);

      const newSubcategoryTotal = subcategoryTransactions?.reduce(
        (sum, t) => sum + t.amount,
        0
      ) || 0;

      // Actualizar la subcategoría
      await supabase
        .from('budget_subcategories')
        .update({ actual_amount: newSubcategoryTotal })
        .eq('id', transaction.subcategory_id);

      console.log('✅ Subcategoría actualizada:', transaction.subcategory_id, 'Total:', newSubcategoryTotal);
    }

    console.log('✅ Transacción eliminada exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Transacción eliminada exitosamente'
    });

  } catch (error: any) {
    console.error('❌ Error en DELETE /api/transactions/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
