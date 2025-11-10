// ============================================================================
// API ENDPOINT PARA CHAT DE PRESUPUESTO CONVERSACIONAL - MentorIA
// Versión: 2.0.0 - Sistema de Análisis Inteligente
// Fecha: Enero 2025
// Descripción: Endpoint especializado para análisis inteligente de presupuestos
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { sendBudgetConversationalMessage, analyzeBudgetConversation, ChatMessage } from '@/lib/openai/client';
import { parseStructuredData, validateStructuredData, ParsedBudgetData } from '@/lib/parsers/structured-parser';
import { analyzeBudgetData, generateFinalBudgetAnalysis, BudgetAnalysisData, AnalysisContext } from '@/lib/gemini/budget-analysis-client';
import { BudgetCategory, CategoryType } from '../../../types/budget';

// Interfaz para la request
interface BudgetChatRequest {
  message: string;
  chatHistory?: ChatMessage[];
  questionNumber?: number;
  budgetId?: string;
  budgetPeriod?: {
    month: number;
    year: number;
  };
  period?: {
    month: number;
    year: number;
  };
  isStructuredData?: boolean;
  userToken?: string;
}

// Helper para obtener títulos por tipo
function getTitleForType(type: string): string {
  const titles = {
    'income': '💰 Ingresos Mensuales',
    'fixed_expenses': '🏠 Gastos Fijos Mensuales', 
    'variable_expenses': '🛒 Gastos Variables Mensuales',
    'savings': '💾 Ahorros y Metas'
  };
  return titles[type as keyof typeof titles] || 'Datos Financieros';
}

// Obtener o crear presupuesto para el período especificado
async function getOrCreateBudget(supabase: SupabaseClient, userId: string, period: { month: number; year: number }) {
  console.log(`📅 Obteniendo/creando presupuesto para ${period.month}/${period.year}`);
  
  // Buscar presupuesto existente
  const { data: existingBudget, error: searchError } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', userId)
    .eq('budget_month', period.month)
    .eq('budget_year', period.year)
    .single();

  if (searchError && searchError.code !== 'PGRST116') {
    console.error('❌ Error buscando presupuesto:', searchError);
    throw new Error('Error buscando presupuesto existente');
  }

  if (existingBudget) {
    console.log('✅ Presupuesto existente encontrado:', existingBudget.id);
    return existingBudget.id;
  }

  // Crear nuevo presupuesto
  const { data: newBudget, error: createError } = await supabase
    .from('budgets')
    .insert({
      user_id: userId,
      budget_month: period.month,
      budget_year: period.year,
      status: 'active',
      created_via_chat: true,
      chat_completed: false
    })
    .select('id')
    .single();

  if (createError) {
    console.error('❌ Error creando presupuesto:', createError);
    throw new Error('Error creando nuevo presupuesto');
  }

  console.log('✅ Nuevo presupuesto creado:', newBudget.id);
  return newBudget.id;
}

// Guardar categorías y subcategorías creadas (con upsert para evitar duplicados)
async function saveBudgetCategories(supabase: SupabaseClient, budgetId: string, userId: string, parsedData: ParsedBudgetData) {
  console.log('📝 Datos parseados recibidos:', JSON.stringify(parsedData, null, 2));
  
  const { categories, subcategories } = parsedData;
  
  if (!categories || categories.length === 0) {
    console.log('⚠️ No hay categorías para guardar');
    return;
  }

  const colors = ['#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A', '#059669', '#0891B2', '#0284C7', '#2563EB', '#4F46E5', '#7C3AED'];

  // Primero, guardar todas las categorías principales
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    console.log(`📊 Procesando categoría ${i + 1}:`, category);

    const categoryData = {
      budget_id: budgetId,
      user_id: userId,
      name: category.name,
      description: category.description || `${category.name} - ${category.type === 'income' ? 'Ingreso mensual' : 'Gasto mensual'}`,
      category_type: category.type,
      budgeted_amount: category.amount,
      actual_amount: 0,
      is_essential: category.isEssential || true,
      icon_name: category.icon || 'Circle',
      color_hex: colors[i % colors.length],
      sort_order: i + 1,
      is_active: true
    };

    console.log('💾 Datos de categoría preparados:', categoryData);

    const { data: savedCategory, error } = await supabase
      .from('budget_categories')
      .upsert(categoryData, { 
        onConflict: 'budget_id,name,category_type',
        ignoreDuplicates: false 
      })
      .select('id, name')
      .single();

    if (error) {
      console.error(`❌ Error guardando categoría "${category.name}":`, error);
      throw new Error(`Error guardando categoría: ${category.name}`);
    }

    console.log(`✅ Categoría "${category.name}" guardada/actualizada exitosamente`);

    // Guardar subcategorías si existen
    if (subcategories[category.name] && subcategories[category.name].length > 0) {
      console.log(`🔗 Guardando ${subcategories[category.name].length} subcategorías para "${category.name}"`);
      
      for (let j = 0; j < subcategories[category.name].length; j++) {
        const subcategory = subcategories[category.name][j];
        
        const subcategoryData = {
          category_id: savedCategory.id,
          budget_id: budgetId,
          user_id: userId,
          name: subcategory.name,
          description: subcategory.description || `${subcategory.name} - Subcategoría de ${category.name}`,
          budgeted_amount: subcategory.amount,
          actual_amount: 0,
          icon_name: subcategory.icon || 'Circle',
          sort_order: j + 1,
          is_active: true
        };

        console.log(`💾 Datos de subcategoría preparados:`, subcategoryData);

        const { error: subError } = await supabase
          .from('budget_subcategories')
          .upsert(subcategoryData, {
            onConflict: 'category_id,name',
            ignoreDuplicates: false
          });

        if (subError) {
          console.error(`❌ Error guardando subcategoría "${subcategory.name}":`, subError);
          throw new Error(`Error guardando subcategoría: ${subcategory.name}`);
        }

        console.log(`✅ Subcategoría "${subcategory.name}" guardada exitosamente`);
      }
    }
  }

  console.log('✅ Todas las categorías y subcategorías procesadas exitosamente');
}

// Función temporal de análisis mientras solucionamos el import
function generateTempAnalysis(type: string, totalAmount: number, categoriesCount: number): string {
  const formattedAmount = totalAmount.toLocaleString('es-CO');
  
  switch (type) {
    case 'income':
      return `¡Excelente! 🎉 Has organizado tus ingresos de manera clara. Un total de $${formattedAmount} con ${categoriesCount} fuentes de ingreso. Tener múltiples fuentes es una gran estrategia financiera. 💪 ¡Continuemos organizando tus gastos!`;
    
    case 'fixed_expenses':
      return `¡Perfecto! 🏠 Tienes claros tus gastos fijos por $${formattedAmount} en ${categoriesCount} categorías. Estos gastos son predecibles, lo que te ayuda a planificar mejor. 💡 Recuerda que idealmente no deberían superar el 50% de tus ingresos. ¡Sigamos con los gastos variables!`;
    
    case 'variable_expenses':
      return `¡Genial! 🛒 Has identificado tus gastos variables por $${formattedAmount} en ${categoriesCount} categorías. Esta es el área donde más puedes optimizar y ahorrar. 🎯 Revisa si hay oportunidades de reducir algunos gastos. ¡Ahora definamos tus metas de ahorro!`;
    
    case 'savings':
      return `¡Increíble! 💾 Planificar ahorros por $${formattedAmount} muestra tu compromiso financiero. Con ${categoriesCount} metas de ahorro, estás construyendo un futuro sólido. 🚀 ¡Felicitaciones por completar tu presupuesto! Ahora podrás ver todo organizado en tu dashboard.`;
    
    default:
      return `¡Excelente trabajo! 🎉 Has organizado $${formattedAmount} en ${categoriesCount} categorías. ¡Continuemos construyendo tu presupuesto!`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: BudgetChatRequest = await request.json();
    const { 
      message, 
      chatHistory = [],
      questionNumber = 1, 
      budgetId, 
      budgetPeriod,
      period,
      isStructuredData = false
    } = body;

    // Usar period si está disponible, sino budgetPeriod, sino default
    const finalPeriod = period || budgetPeriod || { month: new Date().getMonth() + 1, year: new Date().getFullYear() };

    console.log('🔄 Budget Chat API - Solicitud recibida:', { 
      questionNumber, 
      budgetId, 
      budgetPeriod: finalPeriod, 
      isStructuredData,
      historyLength: chatHistory.length 
    });

    // Obtener token de autorización del header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with service role to validate token
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL!,
      env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get authenticated user using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Error de autenticación:', authError);
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    console.log('👤 Usuario autenticado:', user.email);
    console.log('📅 Período para presupuesto:', finalPeriod);

    // Obtener perfil del usuario para nombre completo
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single();

    const userContext = {
      full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'amigo',
      email: user.email || ''
    };

    // FLUJO CONVERSACIONAL PRINCIPAL CON MENTORIA
    if (!isStructuredData) {
      console.log('💬 Procesando mensaje conversacional con MentorIA...');
      
      try {
        // Llamar a MentorIA con el contexto conversacional
        const response = await sendBudgetConversationalMessage(
          message,
          userContext,
          chatHistory
        );

        if (!response.success) {
          return NextResponse.json({
            message: response.message || 'Lo siento, hubo un problema temporal. Por favor intenta de nuevo.',
            questionNumber,
            isComplete: false
          });
        }

        // Determinar progreso basado en el historial
        const userMessages = chatHistory.filter((msg: ChatMessage) => msg.role === 'user').length;
        const currentProgress = Math.min(Math.floor(userMessages / 2) + 1, 4); // 4 pasos
        const isComplete = currentProgress >= 4 && userMessages >= 6; // Al menos 6 intercambios

        // 🎯 Si la conversación está completa, usar IA para analizar y guardar
        let finalBudgetId = budgetId;
        if (isComplete && !budgetId) {
          console.log('✅ Conversación completada - Analizando con IA para extraer datos...');
          
          try {
            // 🤖 Usar GPT-4o-mini para analizar toda la conversación
            const analysisResult = await analyzeBudgetConversation(chatHistory, userContext);

            if (analysisResult.success && analysisResult.data) {
              console.log('✅ Datos extraídos por IA:', {
                ingresos: analysisResult.data.ingresos.length,
                gastos_fijos: analysisResult.data.gastos_fijos.length,
                gastos_variables: analysisResult.data.gastos_variables.length,
                ahorros: analysisResult.data.ahorros.length
              });

              // Convertir a formato ParsedBudgetData
              const parsedData: ParsedBudgetData = {
                categories: [],
                subcategories: {}
              };

              // Crear categoría de Ingresos
              if (analysisResult.data.ingresos.length > 0) {
                parsedData.categories.push({
                  name: 'Ingresos',
                  type: 'income',
                  amount: analysisResult.data.ingresos.reduce((sum, i) => sum + i.monto, 0),
                  icon: 'DollarSign',
                  description: 'Ingresos mensuales',
                  isEssential: true
                });
                
                // Agregar subcategorías
                parsedData.subcategories['Ingresos'] = analysisResult.data.ingresos.map(ingreso => ({
                  name: ingreso.nombre,
                  amount: ingreso.monto,
                  description: `Ingreso: ${ingreso.nombre}`,
                  icon: 'ArrowDownCircle'
                }));
              }

              // Crear categoría de Gastos Fijos
              if (analysisResult.data.gastos_fijos.length > 0) {
                parsedData.categories.push({
                  name: 'Gastos Fijos',
                  type: 'fixed_expense',
                  amount: analysisResult.data.gastos_fijos.reduce((sum, g) => sum + g.monto, 0),
                  icon: 'Home',
                  description: 'Gastos fijos mensuales',
                  isEssential: true
                });
                
                // Agregar subcategorías
                parsedData.subcategories['Gastos Fijos'] = analysisResult.data.gastos_fijos.map(gasto => ({
                  name: gasto.nombre,
                  amount: gasto.monto,
                  description: `Gasto fijo: ${gasto.nombre}`,
                  icon: 'Minus'
                }));
              }

              // Crear categoría de Gastos Variables
              if (analysisResult.data.gastos_variables.length > 0) {
                parsedData.categories.push({
                  name: 'Gastos Variables',
                  type: 'variable_expense',
                  amount: analysisResult.data.gastos_variables.reduce((sum, g) => sum + g.monto, 0),
                  icon: 'ShoppingCart',
                  description: 'Gastos variables mensuales',
                  isEssential: false
                });
                
                // Agregar subcategorías
                parsedData.subcategories['Gastos Variables'] = analysisResult.data.gastos_variables.map(gasto => ({
                  name: gasto.nombre,
                  amount: gasto.monto,
                  description: `Gasto variable: ${gasto.nombre}`,
                  icon: 'TrendingDown'
                }));
              }

              // Crear categoría de Ahorros (como fixed_expense pero con flag especial)
              if (analysisResult.data.ahorros.length > 0) {
                parsedData.categories.push({
                  name: 'Ahorros',
                  type: 'fixed_expense', // Usamos fixed_expense porque no existe 'savings' en el enum
                  amount: analysisResult.data.ahorros.reduce((sum, a) => sum + a.monto, 0),
                  icon: 'PiggyBank',
                  description: 'Metas de ahorro',
                  isEssential: true
                });
                
                // Agregar subcategorías
                parsedData.subcategories['Ahorros'] = analysisResult.data.ahorros.map(ahorro => ({
                  name: ahorro.nombre,
                  amount: ahorro.monto,
                  description: `Ahorro: ${ahorro.nombre}`,
                  icon: 'TrendingUp'
                }));
              }

              // Guardar presupuesto si hay datos
              if (parsedData.categories.length > 0) {
                // Crear presupuesto
                const createdBudgetId = await getOrCreateBudget(supabase, user.id, finalPeriod);
                finalBudgetId = createdBudgetId;
                
                // Guardar categorías
                await saveBudgetCategories(supabase, createdBudgetId, user.id, parsedData);
                
                // Marcar como completado
                await supabase
                  .from('budgets')
                  .update({ chat_completed: true })
                  .eq('id', finalBudgetId);

                console.log('🎉 Presupuesto guardado exitosamente! Budget ID:', finalBudgetId);
              } else {
                console.log('⚠️ No se extrajeron suficientes datos para crear el presupuesto');
              }
            } else {
              console.log('⚠️ Error en análisis de IA:', analysisResult.error);
            }
          } catch (parseError) {
            console.error('⚠️ Error al analizar/guardar presupuesto (no crítico):', parseError);
            // No fallar la respuesta, solo logear el error
          }
        }

        return NextResponse.json({
          message: response.message,
          questionNumber: currentProgress,
          isComplete,
          budgetId: finalBudgetId
        });

      } catch (error) {
        console.error('❌ Error en conversación con MentorIA:', error);
        return NextResponse.json({
          message: 'Lo siento, tuve un problema procesando tu mensaje. ¿Podrías intentar de nuevo?',
          questionNumber,
          isComplete: false
        });
      }
    }

    // Manejar datos estructurados con ANÁLISIS INTELIGENTE (Legacy - mantener por compatibilidad)
    if (isStructuredData) {
      console.log('📊 Procesando datos estructurados con análisis...');
      try {
        const structuredData = JSON.parse(message);
        const validation = validateStructuredData(structuredData);
        
        if (!validation.isValid) {
          return NextResponse.json(
            { error: `Datos estructurados inválidos: ${validation.errors.join(', ')}` },
            { status: 400 }
          );
        }
        
        const parsedData = parseStructuredData(structuredData);
        console.log('✅ Categorías y subcategorías estructuradas creadas:', parsedData);

        // Calcular total
        const totalAmount = parsedData.categories.reduce((sum: number, cat: BudgetCategory) => sum + (cat.amount || 0), 0);
        
        // Preparar datos para análisis
        const analysisData: BudgetAnalysisData = {
          type: structuredData.type as CategoryType,
          title: getTitleForType(structuredData.type),
          entries: structuredData.entries.map((entry: { category: string; subcategory?: string; amount: number }) => ({
            category: entry.category,
            subcategory: entry.subcategory || undefined,
            amount: entry.amount
          })),
          totalAmount
        };
        
        const analysisContext: AnalysisContext = {
          currentStep: questionNumber,
          totalSteps: 4,
          userProfile: {
            name: user.email?.split('@')[0] || 'Usuario'
          }
        };
        
        // Generar análisis inteligente
        // const analysisResponse = await analyzeBudgetData(analysisData, analysisContext);
        
        // Análisis temporal mientras solucionamos el import
        const analysisResponse = generateTempAnalysis(structuredData.type, totalAmount, parsedData.categories.length);
        
        // Guardar categorías
        if (parsedData.categories.length > 0) {
          const currentBudgetId = budgetId || await getOrCreateBudget(supabase, user.id, finalPeriod);
          await saveBudgetCategories(supabase, currentBudgetId, user.id, parsedData);
          
          const nextStep = questionNumber + 1;
          const isComplete = nextStep > 4;
          
          return NextResponse.json({
            message: analysisResponse,
            questionNumber: nextStep,
            isComplete,
            budgetId: currentBudgetId,
            categoriesCreated: parsedData,
            analysisType: structuredData.type,
            totalAmount
          });
        }
      } catch (error) {
        console.error('❌ Error procesando datos estructurados:', error);
        return NextResponse.json(
          { error: 'Error procesando datos estructurados' },
          { status: 400 }
        );
      }
    }

    // Fallback para casos no estructurados
    return NextResponse.json({
      message: 'Sistema de análisis inteligente activo. Por favor usa los formularios estructurados.',
      questionNumber,
      isComplete: false,
      budgetId
    });

  } catch (error) {
    console.error('❌ Error en Budget Chat API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 