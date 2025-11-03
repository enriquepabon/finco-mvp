import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_GEMINI_API_KEY) {
  throw new Error('GOOGLE_GEMINI_API_KEY no está configurada');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Tipos para el análisis
export interface BudgetAnalysisData {
  type: 'income' | 'fixed_expense' | 'variable_expense' | 'savings';
  title: string;
  entries: Array<{
    category: string;
    subcategory?: string;
    amount: number;
  }>;
  totalAmount: number;
}

export interface AnalysisContext {
  currentStep: number;
  totalSteps: number;
  previousAnalysis?: string[];
  userProfile?: {
    name?: string;
    monthlyIncome?: number;
    totalExpenses?: number;
  };
}

/**
 * 🎯 FINCO BUDGET ANALYST - Análisis Inteligente de Presupuestos
 */
export async function analyzeBudgetData(
  data: BudgetAnalysisData,
  context: AnalysisContext
): Promise<string> {
  
  const { type, title, entries, totalAmount } = data;
  const { currentStep, totalSteps, userProfile } = context;
  
  // Crear resumen de los datos para el análisis
  const dataResumen = entries.map(entry => {
    const subcategoryText = entry.subcategory ? ` - ${entry.subcategory}` : '';
    return `• ${entry.category}${subcategoryText}: $${entry.amount.toLocaleString('es-CO')}`;
  }).join('\n');

  const prompt = `
🤖 Eres FINCO, el coach financiero personal más empático y experto de Colombia. 

📊 DATOS RECIBIDOS - ${title.toUpperCase()}:
${dataResumen}
💰 TOTAL: $${totalAmount.toLocaleString('es-CO')}

📍 CONTEXTO:
- Paso ${currentStep} de ${totalSteps} del presupuesto
- Usuario: ${userProfile?.name || 'Usuario'}
- Tipo de análisis: ${type}

🎯 TU MISIÓN:
Haz un análisis INTELIGENTE y CONSTRUCTIVO de estos datos. NO hagas preguntas, sino da insights, consejos y observaciones valiosas.

📋 ESTRUCTURA DE RESPUESTA:
1. 🎉 Felicitación por completar esta sección
2. 🔍 Análisis específico de los datos (patrones, distribución, oportunidades)
3. 💡 Consejos prácticos y específicos
4. 🚀 Motivación para continuar

🎨 PERSONALIDAD FINCO:
- 😊 Amigable y cercano (usa el nombre del usuario)
- 💪 Motivador pero realista
- 🧠 Analítico pero fácil de entender
- 🎯 Enfocado en mejoras concretas
- 💰 Experto en finanzas colombianas

${getSpecificAnalysisPrompt(type, entries, totalAmount)}

⚠️ IMPORTANTE:
- Respuesta máximo 150 palabras
- Usa emojis para hacer más amigable
- Sé específico con los números y categorías mencionadas
- NO hagas preguntas al final
- Termina con motivación para continuar
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generando análisis:', error);
    return getFallbackAnalysis(type, title, totalAmount);
  }
}

/**
 * Prompts específicos por tipo de categoría
 */
function getSpecificAnalysisPrompt(
  type: string, 
  entries: BudgetAnalysisData['entries'], 
  total: number
): string {
  switch (type) {
    case 'income':
      const diversificationLevel = entries.length > 1 ? 'diversificados' : 'concentrados';
      return `
🔍 ANÁLISIS DE INGRESOS:
- Tienes ${entries.length} fuente(s) de ingresos (${diversificationLevel})
- Ingreso total: $${total.toLocaleString('es-CO')}
- Analiza si hay dependencia excesiva de una sola fuente
- Sugiere diversificación si es necesario
- Celebra la organización de sus ingresos
      `;

    case 'fixed_expense':
      const averageFixed = total / entries.length;
      return `
🔍 ANÁLISIS DE GASTOS FIJOS:
- ${entries.length} gastos fijos identificados
- Promedio por gasto: $${averageFixed.toLocaleString('es-CO')}
- Busca patrones: ¿hay gastos muy altos? ¿oportunidades de optimización?
- Sugiere revisión de contratos o planes si ves oportunidades
- Recuerda que los gastos fijos deben ser máximo 50% del ingreso
      `;

    case 'variable_expense':
      const categories = [...new Set(entries.map(e => e.category))];
      return `
🔍 ANÁLISIS DE GASTOS VARIABLES:
- ${categories.length} categorías principales de gastos variables
- Total gastado: $${total.toLocaleString('es-CO')}
- Identifica la categoría con mayor gasto
- Sugiere áreas de optimización específicas
- Da tips prácticos para reducir gastos sin afectar calidad de vida
      `;

    case 'savings':
      return `
🔍 ANÁLISIS DE AHORROS:
- Meta de ahorro: $${total.toLocaleString('es-CO')}
- Evalúa si cumple con la regla 20-30-50 (20% mínimo para ahorro)
- Celebra el hábito de ahorro
- Sugiere diversificación de ahorros si es apropiado
      `;

    default:
      return '';
  }
}

/**
 * Análisis de respaldo en caso de error
 */
function getFallbackAnalysis(type: string, title: string, total: number): string {
  const responses = {
    income: `¡Excelente! 🎉 Has organizado tus ingresos de manera clara. Un total de $${total.toLocaleString('es-CO')} es una buena base para construir tu presupuesto. 💪 ¡Continuemos organizando tus gastos!`,
    fixed_expense: `¡Perfecto! 🏠 Tener claros tus gastos fijos es fundamental. $${total.toLocaleString('es-CO')} en gastos fijos te ayudará a planificar mejor. 💡 Recuerda que idealmente no deberían superar el 50% de tus ingresos.`,
    variable_expense: `¡Genial! 🛒 Has identificado tus gastos variables por $${total.toLocaleString('es-CO')}. Esta es el área donde más puedes optimizar y ahorrar. 🎯 ¡Sigamos con el siguiente paso!`,
    savings: `¡Increíble! 💾 Planificar ahorros por $${total.toLocaleString('es-CO')} muestra tu compromiso financiero. 🚀 ¡Estás en el camino correcto hacia la libertad financiera!`
  };

  return responses[type as keyof typeof responses] || '¡Excelente trabajo organizando tu presupuesto! 🎉';
}

/**
 * 🎯 ANÁLISIS FINAL - Regla 20-30-50
 */
export async function generateFinalBudgetAnalysis(
  income: number,
  fixedExpenses: number,
  variableExpenses: number,
  savings: number,
  userName?: string
): Promise<string> {
  
  const totalExpenses = fixedExpenses + variableExpenses;
  const remainingIncome = income - totalExpenses - savings;
  
  const fixedPercentage = (fixedExpenses / income) * 100;
  const variablePercentage = (variableExpenses / income) * 100;
  const savingsPercentage = (savings / income) * 100;

  const prompt = `
🤖 Eres FINCO, coach financiero experto. Haz un análisis final del presupuesto completo.

👤 USUARIO: ${userName || 'Usuario'}

📊 PRESUPUESTO COMPLETO:
💰 Ingresos: $${income.toLocaleString('es-CO')}
🏠 Gastos Fijos: $${fixedExpenses.toLocaleString('es-CO')} (${fixedPercentage.toFixed(1)}%)
🛒 Gastos Variables: $${variableExpenses.toLocaleString('es-CO')} (${variablePercentage.toFixed(1)}%)
💾 Ahorros: $${savings.toLocaleString('es-CO')} (${savingsPercentage.toFixed(1)}%)
💸 Sobrante/Faltante: $${remainingIncome.toLocaleString('es-CO')}

🎯 REGLA 20-30-50 IDEAL:
- Gastos Fijos: máximo 50%
- Gastos Variables: máximo 30% 
- Ahorros: mínimo 20%

📋 TU ANÁLISIS DEBE INCLUIR:
1. 🎉 Felicitación por completar el presupuesto
2. 📊 Evaluación vs regla 20-30-50
3. 🔍 Identificar fortalezas y áreas de mejora
4. 💡 3 consejos específicos y prácticos
5. 🚀 Motivación final

⚠️ MÁXIMO 200 palabras, usa emojis, sé específico con números y porcentajes.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generando análisis final:', error);
    return `¡Felicitaciones ${userName}! 🎉 Has completado tu presupuesto. Tu distribución actual es: ${fixedPercentage.toFixed(1)}% gastos fijos, ${variablePercentage.toFixed(1)}% variables, y ${savingsPercentage.toFixed(1)}% ahorros. ¡Excelente trabajo! 💪`;
  }
} 