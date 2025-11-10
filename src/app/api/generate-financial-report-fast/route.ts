/**
 * API Endpoint OPTIMIZADO: Generación Rápida de Reportes Financieros
 * 
 * Versión optimizada para Vercel Hobby Plan (10s timeout)
 * - Prompt reducido
 * - Timeout de 8s
 * - max_tokens limitado
 * - Fallback inmediato
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import openai from '@/lib/openai/client';

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL!,
  env.SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 10; // Vercel function timeout

export async function POST(request: NextRequest) {
  try {
    console.log('⚡ MentorIA Fast Report API - Iniciando...');

    // Auth
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { budgetId } = body;

    // Fetch data in parallel
    const [profileResult, budgetResult] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('*').eq('user_id', user.id).single(),
      supabaseAdmin.from('budgets').select(`
        total_income, total_fixed_expenses, total_variable_expenses,
        actual_income, actual_fixed_expenses, actual_variable_expenses, actual_savings
      `).eq('id', budgetId).single()
    ]);

    const profile = profileResult.data;
    const budget = budgetResult.data;

    if (!profile || !budget) {
      // Return fallback immediately
      return NextResponse.json({
        success: true,
        report: generateQuickFallback(profile, budget),
        fallback: true
      });
    }

    // Calculate quick metrics
    const totalBudgeted = budget.total_income || 0;
    const actualIncome = budget.actual_income || 0;
    const totalExpenses = (budget.total_fixed_expenses || 0) + (budget.total_variable_expenses || 0);
    const actualExpenses = (budget.actual_fixed_expenses || 0) + (budget.actual_variable_expenses || 0);
    const actualSavings = budget.actual_savings || 0;
    
    const incomeProgress = totalBudgeted > 0 ? Math.round((actualIncome / totalBudgeted) * 100) : 0;
    const expensesProgress = totalExpenses > 0 ? Math.round((actualExpenses / totalExpenses) * 100) : 0;
    
    // Simple health score
    const financialHealth = Math.min(100, Math.max(0, 
      (incomeProgress >= 90 ? 40 : incomeProgress * 0.4) +
      (expensesProgress <= 100 ? 40 : Math.max(0, 40 - (expensesProgress - 100) * 0.5)) +
      (actualSavings > 0 ? 20 : 0)
    ));

    // Compact prompt
    const prompt = `Usuario: ${profile.full_name || 'Usuario'}
Ingreso: $${actualIncome.toLocaleString()} (meta: $${totalBudgeted.toLocaleString()})
Gastos: $${actualExpenses.toLocaleString()} (presupuesto: $${totalExpenses.toLocaleString()})
Ahorros: $${actualSavings.toLocaleString()}
Salud financiera: ${Math.round(financialHealth)}/100

Genera JSON conciso:
{
  "mensaje": "2 frases motivacionales personalizadas",
  "estado": "Excelente|Bueno|Regular|Atención",
  "emoji": "✅|⚠️|🚨",
  "recomendaciones": ["3 tips específicos y accionables"],
  "siguiente_paso": "1 acción inmediata"
}`;

    try {
      // Timeout de 7 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 7000)
      );

      const completionPromise = openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres MentorIA. Responde solo en JSON válido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const completion = await Promise.race([completionPromise, timeoutPromise]) as any;
      const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{}');

      return NextResponse.json({
        success: true,
        report: {
          resumen_ejecutivo: {
            titulo: 'Tu Situación Financiera Actual',
            descripcion: aiResponse.mensaje || 'Análisis generado con IA',
            puntuacion_financiera: Math.round(financialHealth).toString(),
            estado_general: aiResponse.estado || 'Regular'
          },
          indicadores_clave: {
            patrimonio_neto: 0,
            capacidad_ahorro_mensual: actualIncome - actualExpenses,
            nivel_endeudamiento_pct: 0,
            fondo_emergencia_meses: 0,
            presupuesto_usado_pct: expensesProgress
          },
          analisis_detallado: {
            ingresos: {
              evaluacion: `Ingresos reales: $${actualIncome.toLocaleString('es-CO')} (${incomeProgress}% de la meta)`,
              recomendaciones: aiResponse.recomendaciones?.slice(0, 2) || ['Continúa registrando tus ingresos']
            },
            gastos: {
              evaluacion: `Gastos totales: $${actualExpenses.toLocaleString('es-CO')} (${expensesProgress}% del presupuesto)`,
              recomendaciones: aiResponse.recomendaciones?.slice(2, 4) || ['Mantén el control de tus gastos']
            },
            activos: {
              evaluacion: 'Información no disponible en este reporte rápido',
              recomendaciones: ['Registra tus activos en el perfil']
            },
            deudas: {
              evaluacion: 'Información no disponible en este reporte rápido',
              recomendaciones: ['Registra tus deudas en el perfil']
            }
          },
          recomendaciones_prioritarias: (aiResponse.recomendaciones || ['Mantén un seguimiento constante de tus finanzas']).map((r: string, i: number) => ({
            titulo: r.split(':')[0] || r,
            descripcion: r,
            prioridad: i === 0 ? 'alta' : i === 1 ? 'media' : 'baja',
            impacto: i === 0 ? 'Alto' : i === 1 ? 'Medio' : 'Bajo'
          })),
          objetivos_sugeridos: [
            {
              objetivo: aiResponse.siguiente_paso || 'Mantener el presupuesto balanceado',
              plazo: 'Corto plazo (1-3 meses)',
              pasos: [
                'Registra todas tus transacciones',
                'Revisa tu presupuesto semanalmente',
                'Ajusta gastos según sea necesario'
              ]
            }
          ]
        },
        fallback: false
      });

    } catch (aiError) {
      console.error('❌ AI Error:', aiError);
      return NextResponse.json({
        success: true,
        report: generateQuickFallback(profile, budget),
        fallback: true
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      error: 'Error generando reporte',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateQuickFallback(profile: any, budget: any) {
  const totalBudgeted = budget?.total_income || 0;
  const actualIncome = budget?.actual_income || 0;
  const totalExpenses = (budget?.total_fixed_expenses || 0) + (budget?.total_variable_expenses || 0);
  const actualExpenses = (budget?.actual_fixed_expenses || 0) + (budget?.actual_variable_expenses || 0);
  const actualSavings = budget?.actual_savings || 0;
  
  const incomeProgress = totalBudgeted > 0 ? Math.round((actualIncome / totalBudgeted) * 100) : 0;
  const expensesProgress = totalExpenses > 0 ? Math.round((actualExpenses / totalExpenses) * 100) : 0;
  
  const financialHealth = Math.min(100, Math.max(0, 
    (incomeProgress >= 90 ? 40 : incomeProgress * 0.4) +
    (expensesProgress <= 100 ? 40 : Math.max(0, 40 - (expensesProgress - 100) * 0.5)) +
    (actualSavings > 0 ? 20 : 0)
  ));

  const estado = financialHealth >= 75 ? 'Excelente' : financialHealth >= 50 ? 'Bueno' : 'Regular';

  return {
    resumen_ejecutivo: {
      titulo: 'Tu Situación Financiera Actual',
      descripcion: `Hola ${profile?.full_name || 'Usuario'}, tu salud financiera está en ${Math.round(financialHealth)}/100. ${
        financialHealth >= 75 ? '¡Excelente trabajo! Continúa con tus buenos hábitos financieros.' : 
        financialHealth >= 50 ? 'Vas por buen camino. Mantén el enfoque en tus objetivos.' : 
        'Trabajemos juntos para mejorar tu situación financiera.'
      }`,
      puntuacion_financiera: Math.round(financialHealth).toString(),
      estado_general: estado
    },
    indicadores_clave: {
      patrimonio_neto: 0,
      capacidad_ahorro_mensual: actualIncome - actualExpenses,
      nivel_endeudamiento_pct: 0,
      fondo_emergencia_meses: 0,
      presupuesto_usado_pct: expensesProgress
    },
    analisis_detallado: {
      ingresos: {
        evaluacion: `Tus ingresos actuales son de $${actualIncome.toLocaleString('es-CO')}, lo que representa un ${incomeProgress}% de tu meta de $${totalBudgeted.toLocaleString('es-CO')}.`,
        recomendaciones: [
          incomeProgress < 90 ? 'Busca oportunidades para aumentar tus ingresos' : 'Excelente cumplimiento de ingresos',
          'Diversifica tus fuentes de ingreso cuando sea posible'
        ]
      },
      gastos: {
        evaluacion: `Has gastado $${actualExpenses.toLocaleString('es-CO')} de un presupuesto de $${totalExpenses.toLocaleString('es-CO')} (${expensesProgress}%).`,
        recomendaciones: [
          expensesProgress > 100 ? 'Controla tus gastos, estás excediendo el presupuesto' : 'Buen control de gastos',
          'Revisa tus gastos variables para encontrar áreas de mejora'
        ]
      },
      activos: {
        evaluacion: 'Información no disponible en este reporte rápido',
        recomendaciones: ['Registra tus activos en tu perfil para un análisis más completo']
      },
      deudas: {
        evaluacion: 'Información no disponible en este reporte rápido',
        recomendaciones: ['Registra tus deudas para obtener estrategias de pago']
      }
    },
    recomendaciones_prioritarias: [
      { 
        titulo: 'Revisa tu presupuesto', 
        descripcion: 'Mantén un seguimiento semanal de tus gastos para identificar patrones',
        prioridad: 'alta',
        impacto: 'Alto'
      },
      { 
        titulo: 'Aumenta tus ahorros', 
        descripcion: 'Intenta ahorrar al menos 10% de tus ingresos mensuales',
        prioridad: 'media',
        impacto: 'Medio'
      },
      { 
        titulo: 'Reduce gastos variables', 
        descripcion: 'Identifica gastos innecesarios que puedas eliminar o reducir',
        prioridad: 'media',
        impacto: 'Medio'
      }
    ],
    objetivos_sugeridos: [
      {
        objetivo: 'Crear fondo de emergencia',
        plazo: 'Corto plazo (3-6 meses)',
        pasos: [
          'Ahorra al menos $50,000 mensuales',
          'Abre una cuenta de ahorros separada',
          'Meta: 3 meses de gastos básicos'
        ]
      }
    ]
  };
}

