/**
 * Parser de transacciones por voz usando OpenAI (migrated from Gemini)
 * Extrae información de texto en español colombiano
 */

import { analyzeTransaction } from '../openai/client';
import type { VoiceTransactionParsed } from '@/types/transaction';

interface Category {
  id: string;
  name: string;
  category_type: 'income' | 'fixed_expense' | 'variable_expense';
}

/**
 * Analiza un mensaje de transacción (voz o texto) y extrae información estructurada usando OpenAI
 *
 * @param text - Texto de la transacción del usuario
 * @param existingCategories - Categorías existentes del usuario
 * @returns Información estructurada de la transacción
 */
export async function parseVoiceTransaction(
  text: string,
  existingCategories: Category[]
): Promise<VoiceTransactionParsed> {
  console.log('🔄 Using OpenAI for transaction parsing (migrated from Gemini)');

  // Agrupar categorías por tipo para pasarlas a OpenAI
  const groupedCategories = {
    income: existingCategories
      .filter(c => c.category_type === 'income')
      .map(c => ({
        category_id: c.id,
        category_name: c.name,
        subcategories: [] // Simplificado - en producción deberías pasar las subcategorías reales
      })),
    fixed_expenses: existingCategories
      .filter(c => c.category_type === 'fixed_expense')
      .map(c => ({
        category_id: c.id,
        category_name: c.name,
        subcategories: []
      })),
    variable_expenses: existingCategories
      .filter(c => c.category_type === 'variable_expense')
      .map(c => ({
        category_id: c.id,
        category_name: c.name,
        subcategories: []
      }))
  };

  try {
    // Llamar a OpenAI para analizar la transacción
    const result = await analyzeTransaction(
      text,
      { full_name: 'Usuario' }, // Contexto básico
      groupedCategories
    );

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to analyze transaction');
    }

    const data = result.data;

    // Buscar la categoría existente por nombre
    const matchedCategory = existingCategories.find(
      c => c.name.toLowerCase() === data.suggested_category_name.toLowerCase()
    );

    // Construir respuesta
    const response: VoiceTransactionParsed = {
      amount: data.amount,
      description: data.description,
      transaction_type: data.transaction_type === 'income' ? 'income' : 'expense',
      category_id: matchedCategory?.id, // Si encontramos coincidencia, usamos el ID
      new_category_name: matchedCategory ? undefined : data.suggested_category_name, // Si no, sugerimos nueva
      new_category_type: matchedCategory
        ? undefined
        : (data.category === 'income'
          ? 'income'
          : data.category === 'fixed_expense'
          ? 'fixed_expense'
          : 'variable_expense'),
      date: data.date ? new Date(data.date) : new Date()
    };

    console.log('✅ Transaction parsed:', response);
    return response;

  } catch (error) {
    console.error('❌ Error parsing transaction with OpenAI:', error);
    
    // Fallback: retornar respuesta básica
    return {
      amount: 0,
      description: text,
      transaction_type: 'expense',
      new_category_name: 'Varios',
      new_category_type: 'variable_expense',
      date: new Date()
    };
  }
}
