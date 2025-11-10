/**
 * API de Transacciones por Voz - MentorIA
 * POST: Procesar texto transcrito y usar Gemini para extraer datos
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { parseVoiceTransaction } from '@/lib/gemini/transaction-parser';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/transactions/voice
 * Parsear texto de voz y sugerir categoría
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, budget_id } = body;

    console.log('🎙️  Processing voice transaction:', text);

    if (!text || !budget_id) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: text, budget_id' },
        { status: 400 }
      );
    }

    // Obtener categorías existentes del presupuesto
    const { data: categories, error: categoriesError } = await supabase
      .from('budget_categories')
      .select('id, name, category_type')
      .eq('budget_id', budget_id)
      .eq('is_active', true);

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError);
      return NextResponse.json(
        { error: 'Error al obtener categorías' },
        { status: 500 }
      );
    }

    // Parsear con Gemini
    const parsed = await parseVoiceTransaction(text, categories || []);

    console.log('✅ Voice transaction parsed:', parsed);

    // Si Gemini sugirió una categoría existente, verificar que existe
    if (parsed.suggested_category_id) {
      const categoryExists = categories?.some(c => c.id === parsed.suggested_category_id);
      if (!categoryExists) {
        // Si no existe, buscar por nombre
        const categoryByName = categories?.find(
          c => c.name.toLowerCase() === parsed.suggested_category_name?.toLowerCase()
        );
        if (categoryByName) {
          parsed.suggested_category_id = categoryByName.id;
        } else {
          // No existe, limpiar el ID y preparar para crear nueva
          parsed.suggested_category_id = undefined;
        }
      }
    }

    // Si no encontró categoría existente, preparar datos para crear nueva
    if (!parsed.suggested_category_id && parsed.new_category_name) {
      // Buscar si ya existe una categoría con ese nombre
      const existingCategory = categories?.find(
        c => c.name.toLowerCase() === parsed.new_category_name?.toLowerCase()
      );

      if (existingCategory) {
        parsed.suggested_category_id = existingCategory.id;
        parsed.suggested_category_name = existingCategory.name;
        parsed.new_category_name = undefined;
      }
    }

    return NextResponse.json({ parsed }, { status: 200 });

  } catch (error) {
    console.error('❌ Error in POST /api/transactions/voice:', error);
    return NextResponse.json(
      {
        error: 'Error al procesar transacción por voz',
        // Solo mostrar detalles técnicos en desarrollo
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      },
      { status: 500 }
    );
  }
}

