/**
 * API Endpoint para Análisis Inteligente de Transacciones
 * 
 * Permite al usuario enviar una descripción en lenguaje natural (voz o texto)
 * y la IA clasifica automáticamente la transacción.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { analyzeTransaction } from '@/lib/openai/client';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje es requerido' },
        { status: 400 }
      );
    }

    // Obtener token de autorización
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with service role
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    console.log('🤖 Analizando transacción para:', user.email, 'Mensaje:', message);

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single();

    const userContext = {
      full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
      email: user.email || ''
    };

    // Obtener categorías y subcategorías disponibles del presupuesto actual
    const currentDate = new Date();
    const { data: budget } = await supabase
      .from('budgets')
      .select(`
        id,
        budget_categories (
          id,
          name,
          category_type,
          expense_type,
          is_essential,
          budget_subcategories (
            id,
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('budget_month', currentDate.getMonth() + 1)
      .eq('budget_year', currentDate.getFullYear())
      .maybeSingle();

    // Preparar categorías y subcategorías disponibles con estructura completa
    let availableCategories;
    let categoryMap = new Map(); // Para mapear nombres → IDs
    
    if (budget && budget.budget_categories) {
      availableCategories = {
        income: [] as Array<{ category_id: string; category_name: string; subcategories: Array<{ id: string; name: string }> }>,
        fixed_expenses: [] as Array<{ category_id: string; category_name: string; subcategories: Array<{ id: string; name: string }> }>,
        variable_expenses: [] as Array<{ category_id: string; category_name: string; subcategories: Array<{ id: string; name: string }> }>,
        savings: [] as Array<{ category_id: string; category_name: string; subcategories: Array<{ id: string; name: string }> }>
      };

      budget.budget_categories.forEach((cat: any) => {
        const subcategories = cat.budget_subcategories?.map((sub: any) => ({
          id: sub.id,
          name: sub.name
        })) || [];
        
        const categoryInfo = {
          category_id: cat.id,
          category_name: cat.name,
          subcategories
        };

        // Mapear para búsqueda rápida
        categoryMap.set(cat.id, { name: cat.name, subcategories });
        subcategories.forEach(sub => {
          categoryMap.set(`${cat.id}_${sub.name.toLowerCase()}`, {
            category_id: cat.id,
            category_name: cat.name,
            subcategory_id: sub.id,
            subcategory_name: sub.name
          });
        });
        
        // 🆕 NUEVA ESTRUCTURA: Clasificar según category_type y expense_type
        if (cat.category_type === 'income') {
          availableCategories.income.push(categoryInfo);
        } else if (cat.category_type === 'savings') {
          availableCategories.savings.push(categoryInfo);
        } else if (cat.category_type === 'expense') {
          // Para gastos, clasificar por expense_type
          if (cat.expense_type === 'fixed') {
            availableCategories.fixed_expenses.push(categoryInfo);
          } else if (cat.expense_type === 'variable') {
            availableCategories.variable_expenses.push(categoryInfo);
          }
        }
      });

      console.log('📊 Categorías disponibles con IDs:', JSON.stringify(availableCategories, null, 2));
    }

    // Analizar transacción con IA
    const analysisResult = await analyzeTransaction(message, userContext, availableCategories);

    if (!analysisResult.success || !analysisResult.data) {
      return NextResponse.json(
        { 
          error: 'No pude analizar la transacción. ¿Podrías ser más específico?',
          details: analysisResult.error
        },
        { status: 400 }
      );
    }

    console.log('✅ Transacción analizada:', analysisResult.data);

    // 🆕 Mapear nombres de categoría/subcategoría a IDs
    let category_id = null;
    let subcategory_id = null;
    let matched = false;

    if (analysisResult.data.suggested_category_name && analysisResult.data.suggested_subcategory_name) {
      // Buscar en el mapa
      for (const [key, value] of categoryMap.entries()) {
        if (value.subcategory_name &&
            value.subcategory_name.toLowerCase() === analysisResult.data.suggested_subcategory_name.toLowerCase() &&
            value.category_name.toLowerCase().includes(analysisResult.data.suggested_category_name.toLowerCase())) {
          category_id = value.category_id;
          subcategory_id = value.subcategory_id;
          matched = true;
          console.log(`✅ Mapeado: "${analysisResult.data.suggested_subcategory_name}" → category_id: ${category_id}, subcategory_id: ${subcategory_id}`);
          break;
        }
      }
    }

    // Preparar respuesta
    const response: any = {
      success: true,
      transaction: {
        ...analysisResult.data,
        category_id: matched ? category_id : null,
        subcategory_id: matched ? subcategory_id : null,
        requires_user_confirmation: !matched
      }
    };

    if (!matched) {
      response.message = `No encontré "${analysisResult.data.suggested_subcategory_name}" en tus categorías. ¿Deseas crearla?`;
      response.available_categories = availableCategories;
    } else {
      response.message = `Transacción clasificada: ${analysisResult.data.description} - $${analysisResult.data.amount.toLocaleString('es-CO')}`;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en análisis de transacción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

