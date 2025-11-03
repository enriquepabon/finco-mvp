// Script para probar la generación de reportes financieros
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

async function testFinancialReport() {
  console.log('🧪 Probando generación de reporte financiero...\n');

  // Perfil de prueba
  const testProfile = {
    full_name: 'Enrique Pabon',
    age: 39,
    civil_status: 'union_libre',
    children_count: 0,
    monthly_income: 23000000,
    monthly_expenses: 18000000,
    total_assets: 900000000,
    total_liabilities: 25000000,
    total_savings: 50000000
  };

  console.log('📊 Perfil de prueba:');
  console.log(JSON.stringify(testProfile, null, 2));
  console.log('\n🤖 Generando reporte con IA...\n');

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Eres FINCO, un experto analista financiero. Genera un reporte financiero completo y profesional para:

PERFIL DEL USUARIO:
- Nombre: ${testProfile.full_name}
- Edad: ${testProfile.age} años
- Estado civil: ${testProfile.civil_status}
- Hijos: ${testProfile.children_count}
- Ingresos mensuales: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(testProfile.monthly_income)}
- Gastos mensuales: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(testProfile.monthly_expenses)}
- Activos totales: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(testProfile.total_assets)}
- Deudas totales: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(testProfile.total_liabilities)}
- Ahorros: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(testProfile.total_savings)}

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('📝 Respuesta cruda de IA:');
    console.log(text);
    console.log('\n🔧 Procesando respuesta...\n');
    
    // Limpiar y parsear respuesta JSON
    const cleanedText = text.replace(/```json|```/g, '').trim();
    const reportData = JSON.parse(cleanedText);
    
    console.log('✅ Reporte generado exitosamente:');
    console.log('\n📋 RESUMEN EJECUTIVO:');
    console.log(`Título: ${reportData.resumen_ejecutivo.titulo}`);
    console.log(`Descripción: ${reportData.resumen_ejecutivo.descripcion}`);
    console.log(`Puntuación: ${reportData.resumen_ejecutivo.puntuacion_financiera}/100`);
    console.log(`Estado: ${reportData.resumen_ejecutivo.estado_general}`);
    
    console.log('\n📊 INDICADORES CLAVE:');
    console.log(`Patrimonio Neto: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(reportData.indicadores_clave.patrimonio_neto)}`);
    console.log(`Capacidad de Ahorro: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(reportData.indicadores_clave.capacidad_ahorro)}`);
    console.log(`Nivel de Endeudamiento: ${reportData.indicadores_clave.nivel_endeudamiento}`);
    console.log(`Fondo de Emergencia: ${reportData.indicadores_clave.fondo_emergencia}`);
    
    console.log('\n🎯 RECOMENDACIONES PRIORITARIAS:');
    reportData.recomendaciones_prioritarias.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.titulo} (${rec.prioridad})`);
      console.log(`   ${rec.descripcion}`);
      console.log(`   Impacto: ${rec.impacto}\n`);
    });
    
    console.log('🎯 OBJETIVOS SUGERIDOS:');
    reportData.objetivos_sugeridos.forEach((obj, index) => {
      console.log(`${index + 1}. ${obj.objetivo} (${obj.plazo})`);
      obj.pasos.forEach((paso, pasoIndex) => {
        console.log(`   - ${paso}`);
      });
      console.log('');
    });
    
    console.log('🎉 Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error generando reporte:', error);
    
    if (error.message.includes('JSON')) {
      console.log('\n🔧 Error de formato JSON. La IA devolvió texto no válido.');
    }
  }
}

// Ejecutar prueba
testFinancialReport()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error en prueba:', error);
    process.exit(1);
  }); 