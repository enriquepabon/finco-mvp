/**
 * API Endpoint: Generación de Reportes Financieros con IA
 * 
 * Genera reportes completos integrando:
 * - Datos financieros del perfil
 * - Presupuesto y transacciones
 * - Hábitos y rachas (micro-habits)
 * - Gamificación (badges y logros)
 * 
 * Usa GPT-4o-mini para análisis inteligente y personalizado
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import openai from '@/lib/openai/client';

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL!,
  env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 MentorIA Report API - Iniciando generación de reporte...');

    // Autenticación
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autorizado' },
        { status: 401 }
      );
    }

    console.log('👤 Usuario autenticado:', user.email);

    // Obtener budgetId del body
    const body = await request.json();
    const { budgetId } = body;

    console.log('📋 Budget ID recibido:', budgetId);

    // 1. Obtener perfil completo
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado. Complete el onboarding primero.' },
        { status: 404 }
      );
    }

    console.log('📊 Perfil:', profile.full_name);

    // 2. Obtener presupuesto específico con categorías y subcategorías
    const { data: budget, error: budgetError } = await supabaseAdmin
      .from('budgets')
      .select(`
        id,
        user_id,
        total_income,
        total_fixed_expenses,
        total_variable_expenses,
        actual_income,
        actual_fixed_expenses,
        actual_variable_expenses,
        actual_savings,
        budget_month,
        budget_year
      `)
      .eq('id', budgetId)
      .maybeSingle();

    if (budgetError) {
      console.error('❌ Error obteniendo presupuesto:', budgetError);
    }

    if (!budget) {
      console.error('⚠️  No se encontró el presupuesto con ID:', budgetId);
    } else {
      console.log('✅ Presupuesto encontrado:', budget.id, `(${budget.budget_month}/${budget.budget_year}), user_id: ${budget.user_id}`);
      // Verificar que el presupuesto pertenezca al usuario
      if (budget.user_id !== user.id) {
        console.error('🚫 El presupuesto no pertenece al usuario autenticado');
        return NextResponse.json(
          { error: 'No tienes acceso a este presupuesto' },
          { status: 403 }
        );
      }
    }

    // 2b. Obtener categorías del presupuesto
    let categories: any[] = [];
    let subcategories: any[] = [];
    if (budget) {
      const { data: cats } = await supabaseAdmin
        .from('budget_categories')
        .select('*')
        .eq('budget_id', budget.id)
        .eq('is_active', true);
      
      categories = cats || [];

      const { data: subs } = await supabaseAdmin
        .from('budget_subcategories')
        .select('*')
        .eq('budget_id', budget.id)
        .eq('is_active', true);
      
      subcategories = subs || [];
    }

    // 3. Obtener transacciones recientes (último mes)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const { data: transactions } = await supabaseAdmin
      .from('transactions')
      .select('transaction_type, amount, transaction_date')
      .eq('user_id', user.id)
      .gte('transaction_date', oneMonthAgo.toISOString().split('T')[0])
      .order('transaction_date', { ascending: false })
      .limit(50);

    // 4. Obtener hábitos y rachas
    const { data: habits } = await supabaseAdmin
      .from('user_habits')
      .select('habit_type, completed_at, streak_count')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(30);

    // Calcular racha actual
    const habitStats = calculateHabitStats(habits || []);

    // 5. Obtener badges ganados
    const { data: userBadges } = await supabaseAdmin
      .from('user_badges')
      .select(`
        earned_at,
        badges (
          name,
          description,
          category
        )
      `)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    console.log('📈 Datos recopilados:', {
      profile: !!profile,
      budget: !!budget,
      categories: categories.length,
      subcategories: subcategories.length,
      transactions: transactions?.length || 0,
      habits: habits?.length || 0,
      badges: userBadges?.length || 0
    });

    // 6. Generar reporte con IA
    const report = await generateFinancialReport({
      profile,
      budget,
      categories,
      subcategories,
      transactions: transactions || [],
      habitStats,
      badges: userBadges || []
    });

    // 7. Guardar reporte
    const { data: savedReport, error: saveError } = await supabaseAdmin
      .from('financial_reports')
      .insert({
        user_id: user.id,
        report_data: report,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Error guardando reporte:', saveError);
    } else {
      console.log('✅ Reporte guardado:', savedReport.id);
    }

    console.log('✅ Reporte generado exitosamente');

    return NextResponse.json({
      success: true,
      report: report,
      reportId: savedReport?.id
    });

  } catch (error) {
    console.error('❌ Error generando reporte financiero:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Calcula estadísticas de hábitos
 */
function calculateHabitStats(habits: any[]) {
  if (!habits || habits.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      consistency: 0
    };
  }

  const streaks = habits.map(h => h.streak_count || 0);
  const currentStreak = Math.max(...streaks, 0);
  const totalDays = habits.length;
  
  // Calcular consistencia (días con al menos un hábito en últimos 30)
  const uniqueDays = new Set(
    habits.map(h => new Date(h.completed_at).toDateString())
  ).size;
  
  const consistency = Math.round((uniqueDays / 30) * 100);

  return {
    currentStreak,
    longestStreak: currentStreak,
    totalDays,
    consistency: Math.min(consistency, 100)
  };
}

/**
 * Genera reporte financiero con GPT-4o-mini
 */
async function generateFinancialReport(data: {
  profile: any;
  budget: any;
  categories: any[];
  subcategories: any[];
  transactions: any[];
  habitStats: any;
  badges: any[];
}) {
  const { profile, budget, categories, subcategories, transactions, habitStats, badges } = data;

  // Calcular métricas básicas
  const patrimonio_neto = (profile.total_assets || 0) - (profile.total_liabilities || 0);
  const capacidad_ahorro = (profile.monthly_income || 0) - (profile.monthly_expenses || 0);
  const nivel_endeudamiento = profile.monthly_income > 0 
    ? Math.round(((profile.total_liabilities || 0) / (profile.monthly_income * 12)) * 100)
    : 0;
  const meses_emergencia = profile.monthly_expenses > 0
    ? Math.round((profile.total_savings || 0) / profile.monthly_expenses)
    : 0;

  // Métricas de presupuesto (presupuestado vs real)
  const totalBudgeted = budget?.total_income || 0;
  const totalFixedExpenses = budget?.total_fixed_expenses || 0;
  const totalVariableExpenses = budget?.total_variable_expenses || 0;
  const totalExpenses = totalFixedExpenses + totalVariableExpenses;
  
  // Calcular total de ahorros presupuestados desde categorías
  const totalSavings = categories
    .filter(c => c.category_type === 'savings')
    .reduce((sum, c) => sum + (c.budgeted_amount || 0), 0);

  const actualIncome = budget?.actual_income || 0;
  const actualFixedExpenses = budget?.actual_fixed_expenses || 0;
  const actualVariableExpenses = budget?.actual_variable_expenses || 0;
  const actualExpenses = actualFixedExpenses + actualVariableExpenses;
  const actualSavings = categories
    .filter(c => c.category_type === 'savings')
    .reduce((sum, c) => sum + (c.actual_amount || 0), 0);
  const actualBalance = actualIncome - actualExpenses - actualSavings;

  // Calcular gastos esenciales vs no esenciales
  const essentialExpenses = categories
    .filter(c => c.category_type === 'expense' && c.is_essential === true)
    .reduce((sum, c) => sum + (c.actual_amount || 0), 0);
  const nonEssentialExpenses = categories
    .filter(c => c.category_type === 'expense' && c.is_essential === false)
    .reduce((sum, c) => sum + (c.actual_amount || 0), 0);

  // Porcentajes de cumplimiento
  const incomeProgress = totalBudgeted > 0 ? Math.round((actualIncome / totalBudgeted) * 100) : 0;
  const expensesProgress = totalExpenses > 0 ? Math.round((actualExpenses / totalExpenses) * 100) : 0;
  const savingsProgress = totalSavings > 0 ? Math.round((actualSavings / totalSavings) * 100) : 0;

  // Regla 50/30/20
  const rule503020 = {
    needs: actualIncome > 0 ? Math.round((essentialExpenses / actualIncome) * 100) : 0,
    wants: actualIncome > 0 ? Math.round((nonEssentialExpenses / actualIncome) * 100) : 0,
    savings: actualIncome > 0 ? Math.round((actualSavings / actualIncome) * 100) : 0,
  };

  // 🆕 CALCULAR SALUD FINANCIERA (0-100) - Mismo que el dashboard
  const financialHealth = (() => {
    let score = 0;
    
    // 30 puntos: Balance positivo
    if (actualBalance > 0) score += 30;
    else if (actualBalance > -actualIncome * 0.1) score += 15;
    
    // 25 puntos: Ahorro >= 20%
    if (rule503020.savings >= 20) score += 25;
    else if (rule503020.savings >= 10) score += 15;
    else if (rule503020.savings > 0) score += 5;
    
    // 25 puntos: Gastos <= 80% del ingreso
    const expenseRatio = actualIncome > 0 ? (actualExpenses / actualIncome) * 100 : 100;
    if (expenseRatio <= 70) score += 25;
    else if (expenseRatio <= 80) score += 15;
    else if (expenseRatio <= 90) score += 5;
    
    // 20 puntos: Cumplimiento de presupuesto
    if (Math.abs(expensesProgress - 100) <= 10) score += 20;
    else if (Math.abs(expensesProgress - 100) <= 20) score += 10;
    
    return Math.min(100, score);
  })();

  // Nivel de salud
  const healthLevel = 
    financialHealth >= 80 ? { label: 'Excelente', emoji: '🌟', color: 'green' } :
    financialHealth >= 60 ? { label: 'Bueno', emoji: '👍', color: 'blue' } :
    financialHealth >= 40 ? { label: 'Regular', emoji: '⚠️', color: 'yellow' } :
    { label: 'Necesita Atención', emoji: '🚨', color: 'red' };

  // Clasificar transacciones
  const ingresos_mes = transactions
    .filter(t => t.transaction_type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const gastos_mes = transactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const prompt = `Eres MentorIA, el mentor financiero personal con IA de este usuario. Tu misión es generar un reporte financiero completo, empático y accionable basado en su presupuesto vs realidad.

**CONTEXTO DEL USUARIO:**

📋 **Perfil Personal:**
- Nombre: ${profile.full_name || 'Usuario'}
- Edad: ${profile.age || 'No especificada'} años
- Estado civil: ${profile.civil_status || 'No especificado'}
- Hijos: ${profile.children_count || 0}

💰 **Situación Financiera General:**
- Ingresos mensuales promedio: $${(profile.monthly_income || 0).toLocaleString('es-CO')}
- Gastos mensuales promedio: $${(profile.monthly_expenses || 0).toLocaleString('es-CO')}
- Activos totales: $${(profile.total_assets || 0).toLocaleString('es-CO')}
- Deudas totales: $${(profile.total_liabilities || 0).toLocaleString('es-CO')}
- Ahorros: $${(profile.total_savings || 0).toLocaleString('es-CO')}

📊 **Métricas Patrimoniales:**
- Patrimonio neto: $${patrimonio_neto.toLocaleString('es-CO')}
- Capacidad de ahorro: $${capacidad_ahorro.toLocaleString('es-CO')}/mes
- Nivel de endeudamiento: ${nivel_endeudamiento}%
- Fondo de emergencia: ${meses_emergencia} meses cubiertos

💳 **PRESUPUESTO VS REAL (Mes Actual):**
${budget ? `
📥 INGRESOS:
   - Presupuestado: $${totalBudgeted.toLocaleString('es-CO')}
   - Real: $${actualIncome.toLocaleString('es-CO')}
   - Cumplimiento: ${incomeProgress}%

💸 GASTOS:
   - Fijos Presupuestados: $${totalFixedExpenses.toLocaleString('es-CO')}
   - Fijos Reales: $${actualFixedExpenses.toLocaleString('es-CO')}
   - Variables Presupuestados: $${totalVariableExpenses.toLocaleString('es-CO')}
   - Variables Reales: $${actualVariableExpenses.toLocaleString('es-CO')}
   - Total Presupuestado: $${totalExpenses.toLocaleString('es-CO')}
   - Total Real: $${actualExpenses.toLocaleString('es-CO')}
   - Cumplimiento: ${expensesProgress}%

🎯 GASTOS POR PRIORIDAD (Real):
   - Esenciales: $${essentialExpenses.toLocaleString('es-CO')}
   - No Esenciales: $${nonEssentialExpenses.toLocaleString('es-CO')}

🐷 AHORROS:
   - Meta: $${totalSavings.toLocaleString('es-CO')}
   - Real: $${actualSavings.toLocaleString('es-CO')}
   - Cumplimiento: ${savingsProgress}%

💰 BALANCE:
   - Disponible: $${actualBalance.toLocaleString('es-CO')}

📚 REGLA 50/30/20:
   - Necesidades (esenciales): ${rule503020.needs}% (ideal: 50%)
   - Deseos (no esenciales): ${rule503020.wants}% (ideal: 30%)
   - Ahorros: ${rule503020.savings}% (ideal: 20%)

🌟 SALUD FINANCIERA: ${financialHealth}/100 - ${healthLevel.label} ${healthLevel.emoji}

📋 CATEGORÍAS: ${categories.length} categorías, ${subcategories.length} subcategorías
` : '- Sin presupuesto activo para este mes'}

📈 **Transacciones (Último mes):**
- Total transacciones: ${transactions.length}
- Ingresos: $${ingresos_mes.toLocaleString('es-CO')}
- Gastos: $${gastos_mes.toLocaleString('es-CO')}
- Balance: $${(ingresos_mes - gastos_mes).toLocaleString('es-CO')}

🔥 **Hábitos y Comportamiento:**
- Racha actual: ${habitStats.currentStreak} días
- Total días activos: ${habitStats.totalDays}
- Consistencia: ${habitStats.consistency}%

🏆 **Gamificación:**
- Badges ganados: ${badges.length}
${badges.slice(0, 3).map(b => `  - ${b.badges?.name}: ${b.badges?.description}`).join('\n')}

---

**TU TAREA:**

Genera un reporte financiero completo en formato JSON que incluya:

1. **Resumen ejecutivo** con puntuación financiera (USAR EL HEALTH SCORE CALCULADO: ${financialHealth}/100)
2. **Análisis presupuesto vs real** (cumplimiento de ingresos, gastos, ahorros)
3. **Análisis de la regla 50/30/20** (qué tan bien la cumple)
4. **Indicadores clave** (patrimonio, ahorro, endeudamiento, emergencia)
5. **Análisis de comportamiento** (hábitos, consistencia, badges)
6. **Recomendaciones prioritarias** (3-5, accionables y específicas)
7. **Objetivos sugeridos** (corto, medio y largo plazo)
8. **Áreas de mejora** con pasos concretos

**IMPORTANTE:**
- Usa tono MentorIA: empático, simple, sin jerga, motivador
- Recomendaciones específicas y accionables basadas en los datos reales
- Celebra logros (badges, hábitos, cumplimiento de presupuesto)
- Sé honesto pero constructivo con áreas de mejora
- Máximo 150 palabras por sección
- Si el usuario está cumpliendo o superando su presupuesto de ingresos, celébralo
- Si está gastando menos de lo presupuestado, es positivo
- Si está ahorrando más de lo planeado, celébralo

**FORMATO JSON (responde SOLO con JSON):**

**IMPORTANTE: Usa EXACTAMENTE estos valores numéricos calculados:**
- salud_financiera = ${financialHealth}
- estado_salud = "${healthLevel.label}"
- patrimonio_neto = ${patrimonio_neto}
- capacidad_ahorro_mensual = ${capacidad_ahorro}
- nivel_endeudamiento_pct = ${nivel_endeudamiento}
- fondo_emergencia_meses = ${meses_emergencia}
- ingreso_cumplimiento_pct = ${incomeProgress}
- gastos_cumplimiento_pct = ${expensesProgress}
- ahorros_cumplimiento_pct = ${savingsProgress}
- rule_needs_pct = ${rule503020.needs}
- rule_wants_pct = ${rule503020.wants}
- rule_savings_pct = ${rule503020.savings}

{
  "resumen_ejecutivo": {
    "titulo": "Tu Situación Financiera Actual",
    "descripcion": "Resumen empático de 2-3 líneas basado en los datos",
    "salud_financiera": ${financialHealth},
    "estado_salud": "${healthLevel.label}",
    "estado_emoji": "${healthLevel.emoji}",
    "mensaje_motivacional": "Mensaje corto motivador personalizado"
  },
  "analisis_presupuesto_vs_real": {
    "ingresos": {
      "presupuestado": ${totalBudgeted},
      "real": ${actualIncome},
      "cumplimiento_pct": ${incomeProgress},
      "evaluacion": "Análisis breve (50 palabras)",
      "estado": "Positivo/Negativo/Neutral"
    },
    "gastos": {
      "presupuestado": ${totalExpenses},
      "real": ${actualExpenses},
      "cumplimiento_pct": ${expensesProgress},
      "evaluacion": "Análisis breve (50 palabras)",
      "estado": "Positivo/Negativo/Neutral",
      "detalle_fijos": {
        "presupuestado": ${totalFixedExpenses},
        "real": ${actualFixedExpenses}
      },
      "detalle_variables": {
        "presupuestado": ${totalVariableExpenses},
        "real": ${actualVariableExpenses}
      }
    },
    "ahorros": {
      "meta": ${totalSavings},
      "real": ${actualSavings},
      "cumplimiento_pct": ${savingsProgress},
      "evaluacion": "Análisis breve (50 palabras)",
      "estado": "Positivo/Negativo/Neutral"
    }
  },
  "analisis_regla_503020": {
    "necesidades": {
      "actual_pct": ${rule503020.needs},
      "ideal_pct": 50,
      "diferencia_pct": ${rule503020.needs - 50},
      "evaluacion": "Bien/Ajustar/Problema",
      "recomendacion": "Qué hacer"
    },
    "deseos": {
      "actual_pct": ${rule503020.wants},
      "ideal_pct": 30,
      "diferencia_pct": ${rule503020.wants - 30},
      "evaluacion": "Bien/Ajustar/Problema",
      "recomendacion": "Qué hacer"
    },
    "ahorros": {
      "actual_pct": ${rule503020.savings},
      "ideal_pct": 20,
      "diferencia_pct": ${rule503020.savings - 20},
      "evaluacion": "Bien/Ajustar/Problema",
      "recomendacion": "Qué hacer"
    },
    "resumen_general": "Análisis general del cumplimiento (100 palabras)"
  },
  "indicadores_clave": {
    "patrimonio_neto": ${patrimonio_neto},
    "capacidad_ahorro_mensual": ${capacidad_ahorro},
    "nivel_endeudamiento_pct": ${nivel_endeudamiento},
    "fondo_emergencia_meses": ${meses_emergencia}
  },
  "analisis_comportamiento": {
    "habitos": {
      "racha_actual": ${habitStats.currentStreak},
      "consistencia_pct": ${habitStats.consistency},
      "evaluacion": "Análisis de consistencia (80 palabras)",
      "siguiente_milestone": "Próximo logro (ej: 7 días)"
    },
    "gamificacion": {
      "badges_ganados": ${badges.length},
      "proximo_badge": "Nombre del próximo badge",
      "progreso_actual": "Descripción del progreso"
    }
  },
  "recomendaciones_prioritarias": [
    {
      "titulo": "Recomendación específica basada en datos",
      "descripcion": "Descripción clara y accionable (máx 100 palabras)",
      "prioridad": "Alta/Media/Baja",
      "categoria": "Ingresos/Gastos/Ahorros/Deudas",
      "impacto_esperado": "Qué mejorará",
      "pasos_accion": ["paso 1 concreto", "paso 2 concreto", "paso 3 concreto"]
    }
  ],
  "objetivos_sugeridos": [
    {
      "objetivo": "Objetivo específico y medible",
      "plazo": "Corto/Medio/Largo plazo (X meses)",
      "meta_numerica": "Valor objetivo concreto",
      "pasos": ["paso 1", "paso 2", "paso 3"],
      "razon": "Por qué es importante para este usuario"
    }
  ],
  "areas_mejora": [
    {
      "area": "Nombre del área",
      "problema_identificado": "Qué está mal basado en datos",
      "impacto": "Cómo le afecta",
      "solucion_propuesta": "Qué hacer específicamente"
    }
  ]
}

Responde ÚNICAMENTE con el JSON, sin explicaciones adicionales.`;

  try {
    console.log('🤖 Generando reporte con GPT-4o-mini...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres MentorIA, un experto mentor financiero. Respondes en formato JSON estructurado.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content || '{}';
    const reportData = JSON.parse(responseContent);
    return reportData;

  } catch (error) {
    console.error('❌ Error generando reporte con IA:', error);
    
    // Reporte de fallback
    return generateFallbackReport(data);
  }
}

/**
 * Genera reporte de fallback si la IA falla
 */
function generateFallbackReport(data: any) {
  const { profile, budget, categories, habitStats, badges } = data;
  
  const patrimonio_neto = (profile.total_assets || 0) - (profile.total_liabilities || 0);
  const capacidad_ahorro = (profile.monthly_income || 0) - (profile.monthly_expenses || 0);
  const nivel_endeudamiento = profile.monthly_income > 0 
    ? Math.round(((profile.total_liabilities || 0) / (profile.monthly_income * 12)) * 100)
    : 0;
  const meses_emergencia = profile.monthly_expenses > 0
    ? Math.round((profile.total_savings || 0) / profile.monthly_expenses)
    : 0;

  const totalBudgeted = budget?.total_income || 0;
  const actualIncome = budget?.actual_income || 0;
  const totalExpenses = (budget?.total_fixed_expenses || 0) + (budget?.total_variable_expenses || 0);
  const actualExpenses = (budget?.actual_fixed_expenses || 0) + (budget?.actual_variable_expenses || 0);
  
  // Calcular ahorros desde categorías
  const totalSavings = categories
    .filter((c: any) => c.category_type === 'savings')
    .reduce((sum: number, c: any) => sum + (c.budgeted_amount || 0), 0);
  const actualSavings = categories
    .filter((c: any) => c.category_type === 'savings')
    .reduce((sum: number, c: any) => sum + (c.actual_amount || 0), 0);

  console.log('⚠️  Usando reporte fallback con valores:', {
    patrimonio_neto,
    capacidad_ahorro,
    nivel_endeudamiento,
    meses_emergencia,
    salud_financiera: 55
  });

    return {
      resumen_ejecutivo: {
      titulo: "Tu Reporte Financiero",
      descripcion: "Análisis de tu situación financiera actual y recomendaciones personalizadas.",
      salud_financiera: 55,
      estado_salud: "Regular",
      estado_emoji: "⚠️",
      mensaje_motivacional: "Vas por buen camino. Sigue mejorando."
    },
    analisis_presupuesto_vs_real: {
      ingresos: {
        presupuestado: totalBudgeted,
        real: actualIncome,
        cumplimiento_pct: totalBudgeted > 0 ? Math.round((actualIncome / totalBudgeted) * 100) : 0,
        evaluacion: "Análisis en proceso",
        estado: "Neutral"
      },
      gastos: {
        presupuestado: totalExpenses,
        real: actualExpenses,
        cumplimiento_pct: totalExpenses > 0 ? Math.round((actualExpenses / totalExpenses) * 100) : 0,
        evaluacion: "Análisis en proceso",
        estado: "Neutral",
        detalle_fijos: {
          presupuestado: budget?.total_fixed_expenses || 0,
          real: budget?.actual_fixed_expenses || 0
        },
        detalle_variables: {
          presupuestado: budget?.total_variable_expenses || 0,
          real: budget?.actual_variable_expenses || 0
        }
      },
      ahorros: {
        meta: totalSavings,
        real: actualSavings,
        cumplimiento_pct: totalSavings > 0 ? Math.round((actualSavings / totalSavings) * 100) : 0,
        evaluacion: "Análisis en proceso",
        estado: "Neutral"
      }
    },
    analisis_regla_503020: {
      necesidades: {
        actual_pct: 0,
        ideal_pct: 50,
        diferencia_pct: -50,
        evaluacion: "Análisis en proceso",
        recomendacion: "Registra más transacciones para análisis preciso"
      },
      deseos: {
        actual_pct: 0,
        ideal_pct: 30,
        diferencia_pct: -30,
        evaluacion: "Análisis en proceso",
        recomendacion: "Clasifica tus gastos para un mejor análisis"
      },
      ahorros: {
        actual_pct: 0,
        ideal_pct: 20,
        diferencia_pct: -20,
        evaluacion: "Análisis en proceso",
        recomendacion: "Comienza a ahorrar el 20% de tus ingresos"
      },
      resumen_general: "Continúa registrando transacciones para obtener un análisis más detallado."
    },
    indicadores_clave: {
      patrimonio_neto,
      capacidad_ahorro_mensual: capacidad_ahorro,
      nivel_endeudamiento_pct: nivel_endeudamiento,
      fondo_emergencia_meses: meses_emergencia
    },
    analisis_comportamiento: {
      habitos: {
        racha_actual: habitStats.currentStreak,
        consistencia_pct: habitStats.consistency,
        evaluacion: "Continúa registrando tus gastos diariamente",
        siguiente_milestone: "7 días de racha"
      },
      gamificacion: {
        badges_ganados: badges.length,
        proximo_badge: "Próximo logro disponible",
        progreso_actual: "Sigue así para desbloquear más"
        }
      },
      recomendaciones_prioritarias: [
        {
        titulo: "Crear fondo de emergencia",
        descripcion: "Ahorra 3-6 meses de gastos para imprevistos",
        prioridad: "Alta",
        categoria: "Ahorros",
        impacto_esperado: "Seguridad financiera",
        pasos_accion: ["Definir meta", "Ahorrar 10% mensual", "Automatizar ahorro"]
        }
      ],
      objetivos_sugeridos: [
        {
        objetivo: "Ahorrar para emergencias",
        plazo: "Corto plazo (3 meses)",
        meta_numerica: "3 meses de gastos",
        pasos: ["Calcular meta", "Automatizar ahorro", "Revisar progreso mensual"],
        razon: "Protección ante imprevistos"
      }
    ],
    areas_mejora: [
      {
        area: "Registro de transacciones",
        problema_identificado: "Pocas transacciones registradas",
        impacto: "Dificulta análisis preciso",
        solucion_propuesta: "Registra todas tus transacciones diariamente"
        }
      ]
    };
  }
