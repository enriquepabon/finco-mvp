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
            salud_financiera: Math.round(financialHealth),
            estado_salud: aiResponse.estado || 'Regular',
            estado_emoji: aiResponse.emoji || '⚠️',
            mensaje_motivacional: aiResponse.mensaje || 'Sigue así!'
          },
          analisis_presupuesto_vs_real: {
            ingresos: {
              presupuestado: totalBudgeted,
              real: actualIncome,
              cumplimiento_pct: incomeProgress
            },
            gastos: {
              presupuestado: totalExpenses,
              real: actualExpenses,
              cumplimiento_pct: expensesProgress
            },
            ahorros: {
              real: actualSavings
            }
          },
          recomendaciones_prioritarias: (aiResponse.recomendaciones || []).map((r: string, i: number) => ({
            prioridad: i + 1,
            titulo: r.split(':')[0] || r,
            descripcion: r
          })),
          siguiente_paso: aiResponse.siguiente_paso || 'Revisa tu presupuesto mensualmente'
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
  const emoji = financialHealth >= 75 ? '✅' : financialHealth >= 50 ? '⚠️' : '🚨';

  return {
    resumen_ejecutivo: {
      salud_financiera: Math.round(financialHealth),
      estado_salud: estado,
      estado_emoji: emoji,
      mensaje_motivacional: `Hola ${profile?.full_name || 'Usuario'}, tu salud financiera está en ${Math.round(financialHealth)}/100. ${
        financialHealth >= 75 ? '¡Excelente trabajo!' : 
        financialHealth >= 50 ? 'Vas por buen camino.' : 
        'Trabajemos juntos para mejorar.'
      }`
    },
    analisis_presupuesto_vs_real: {
      ingresos: {
        presupuestado: totalBudgeted,
        real: actualIncome,
        cumplimiento_pct: incomeProgress
      },
      gastos: {
        presupuestado: totalExpenses,
        real: actualExpenses,
        cumplimiento_pct: expensesProgress
      },
      ahorros: {
        real: actualSavings
      }
    },
    recomendaciones_prioritarias: [
      { prioridad: 1, titulo: 'Revisa tu presupuesto', descripcion: 'Mantén un seguimiento semanal de tus gastos' },
      { prioridad: 2, titulo: 'Aumenta tus ahorros', descripcion: 'Intenta ahorrar al menos 10% de tus ingresos' },
      { prioridad: 3, titulo: 'Reduce gastos variables', descripcion: 'Identifica gastos innecesarios que puedas eliminar' }
    ],
    siguiente_paso: 'Registra todas tus transacciones durante esta semana'
  };
}

