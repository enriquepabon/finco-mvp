import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Financial Report API - Iniciando generación de reporte...');

    // Obtener usuario autenticado
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

    // Obtener perfil completo del usuario
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError);
      return NextResponse.json(
        { error: 'Error obteniendo perfil del usuario' },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado. Complete el onboarding primero.' },
        { status: 404 }
      );
    }

    console.log('📊 Generando reporte para perfil:', profile.full_name);

    // Generar reporte con IA
    const report = await generateFinancialReport(profile);

    // Guardar reporte en base de datos
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
      // Continuar aunque no se pueda guardar
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

async function generateFinancialReport(profile: any) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Eres FINCO, un experto analista financiero. Genera un reporte financiero completo y profesional para:

PERFIL DEL USUARIO:
- Nombre: ${profile.full_name || 'Usuario'}
- Edad: ${profile.age || 'No especificada'} años
- Estado civil: ${profile.civil_status || 'No especificado'}
- Hijos: ${profile.children_count || 0}
- Ingresos mensuales: ${profile.monthly_income ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(profile.monthly_income) : 'No especificado'}
- Gastos mensuales: ${profile.monthly_expenses ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(profile.monthly_expenses) : 'No especificado'}
- Activos totales: ${profile.total_assets ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(profile.total_assets) : 'No especificado'}
- Deudas totales: ${profile.total_liabilities ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(profile.total_liabilities) : 'No especificado'}
- Ahorros: ${profile.total_savings ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(profile.total_savings) : 'No especificado'}

INSTRUCCIONES:
1. Responde ÚNICAMENTE en formato JSON válido
2. Incluye análisis detallado de cada área financiera
3. Proporciona recomendaciones específicas y accionables
4. Calcula indicadores financieros importantes
5. Identifica fortalezas y áreas de mejora
6. Mantén un tono profesional pero amigable

FORMATO DE RESPUESTA (JSON):
{
  "resumen_ejecutivo": {
    "titulo": "Resumen de tu situación financiera",
    "descripcion": "Descripción general de 2-3 líneas",
    "puntuacion_financiera": "número del 1-100",
    "estado_general": "Excelente|Bueno|Regular|Necesita atención"
  },
  "indicadores_clave": {
    "patrimonio_neto": "valor calculado",
    "capacidad_ahorro": "valor calculado", 
    "nivel_endeudamiento": "porcentaje",
    "fondo_emergencia": "meses cubiertos"
  },
  "analisis_detallado": {
    "ingresos": {
      "evaluacion": "análisis de ingresos",
      "recomendaciones": ["recomendación 1", "recomendación 2"]
    },
    "gastos": {
      "evaluacion": "análisis de gastos",
      "recomendaciones": ["recomendación 1", "recomendación 2"]
    },
    "activos": {
      "evaluacion": "análisis de activos",
      "recomendaciones": ["recomendación 1", "recomendación 2"]
    },
    "deudas": {
      "evaluacion": "análisis de deudas",
      "recomendaciones": ["recomendación 1", "recomendación 2"]
    }
  },
  "recomendaciones_prioritarias": [
    {
      "titulo": "Recomendación 1",
      "descripcion": "Descripción detallada",
      "prioridad": "Alta|Media|Baja",
      "impacto": "descripción del impacto"
    }
  ],
  "objetivos_sugeridos": [
    {
      "objetivo": "Objetivo específico",
      "plazo": "Corto|Medio|Largo plazo",
      "pasos": ["paso 1", "paso 2"]
    }
  ]
}

Responde SOLO con el JSON, sin texto adicional:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpiar y parsear respuesta JSON
    const cleanedText = text.replace(/```json|```/g, '').trim();
    const reportData = JSON.parse(cleanedText);
    
    return reportData;
  } catch (error) {
    console.error('❌ Error generando reporte con IA:', error);
    
    // Reporte de fallback
    return {
      resumen_ejecutivo: {
        titulo: "Reporte Financiero",
        descripcion: "Análisis de tu situación financiera actual",
        puntuacion_financiera: "75",
        estado_general: "Bueno"
      },
      indicadores_clave: {
        patrimonio_neto: profile.total_assets - profile.total_liabilities,
        capacidad_ahorro: profile.monthly_income - profile.monthly_expenses,
        nivel_endeudamiento: "Calculando...",
        fondo_emergencia: "Calculando..."
      },
      analisis_detallado: {
        ingresos: {
          evaluacion: "Análisis en proceso...",
          recomendaciones: ["Diversificar fuentes de ingreso"]
        }
      },
      recomendaciones_prioritarias: [
        {
          titulo: "Revisar presupuesto",
          descripcion: "Analiza tus gastos mensuales",
          prioridad: "Media",
          impacto: "Mejora en control financiero"
        }
      ],
      objetivos_sugeridos: [
        {
          objetivo: "Crear fondo de emergencia",
          plazo: "Corto plazo",
          pasos: ["Definir meta", "Ahorrar mensualmente"]
        }
      ]
    };
  }
} 