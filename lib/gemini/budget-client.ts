// ============================================================================
// CLIENTE GOOGLE GEMINI PARA CHAT DE PRESUPUESTO - FINCO
// Versión: 1.0.0
// Fecha: Enero 2025
// Descripción: Cliente especializado para conversaciones de presupuesto con personalidad FINCO
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

// Interfaz para el mensaje de presupuesto
interface BudgetMessageRequest {
  message: string;
  questionNumber: number;
  parsedData?: any;
  chatHistory?: any[];
  userProfile?: any;
}

// Configuración del cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// Modelo especializado para presupuesto
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
});

// Personalidad FINCO para presupuesto
const FINCO_BUDGET_PERSONALITY = `
Eres FINCO, un coach financiero personal experto en presupuestos. Tu personalidad es:

🎯 EXPERTO: Dominas completamente los presupuestos personales y la educación financiera
😊 AMIGABLE: Conversación cercana, empática y motivadora
💪 EDUCATIVO: Explicas conceptos financieros de forma simple y clara
🤔 ORGANIZADO: Mantienes el flujo estructurado de 10 preguntas
📚 DIDÁCTICO: Compartes tips breves y datos curiosos relevantes
🔥 MOTIVADOR: Generas entusiasmo por la planificación financiera

REGLAS ESTRICTAS:
- SIEMPRE responde en español colombiano
- NUNCA hagas más de una pregunta a la vez
- SIEMPRE explica brevemente conceptos financieros cuando sea relevante
- MANTÉN el flujo de 10 preguntas estructurado
- INCLUYE emojis para hacer la conversación más amigable
- COMPARTE tips financieros cortos cuando sea apropiado
- RECONOCE y valida las respuestas del usuario
- SÉ ESPECÍFICO sobre presupuestos y categorías

CONCEPTOS CLAVE A ENSEÑAR:
- Presupuesto: Plan financiero mensual que organiza ingresos y gastos
- Gastos fijos: Pagos que no cambian mes a mes (arriendo, servicios, seguros)
- Gastos variables: Gastos que cambian según decisiones (comida, entretenimiento)
- Gastos hormiga: Pequeños gastos frecuentes que suman mucho
- Regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorros
- Fondo de emergencia: 3-6 meses de gastos ahorrados
`;

// Preguntas estructuradas del presupuesto (SIMPLIFICADAS - 4 PREGUNTAS DIRECTAS)
const BUDGET_QUESTIONS = {
  1: {
    question: "¡Hola! Vamos a crear tu presupuesto de manera estructurada. Empecemos con tus **INGRESOS MENSUALES**. Usa la tabla para organizar todos tus ingresos por categoría y subcategoría.",
    context: "Primera pregunta - Ingresos mensuales",
    expectedData: "Tabla con ingresos estructurados"
  },
  2: {
    question: "Perfecto! Ahora necesito conocer tus **GASTOS FIJOS MENSUALES**. Estos son los gastos que tienes cada mes sin falta. Usa la tabla para organizarlos por categoría y subcategoría.",
    context: "Segunda pregunta - Gastos fijos",
    expectedData: "Tabla con gastos fijos estructurados"
  },
  3: {
    question: "¡Excelente! Continuemos con tus **GASTOS VARIABLES MENSUALES**. Estos son gastos que pueden cambiar mes a mes. Organízalos en la tabla por categoría y subcategoría.",
    context: "Tercera pregunta - Gastos variables", 
    expectedData: "Tabla con gastos variables estructurados"
  },
  4: {
    question: "¡Casi terminamos! Por último, cuéntame sobre tus **AHORROS Y METAS FINANCIERAS**. ¿Cuánto planeas ahorrar este mes? Organiza tus ahorros por categoría y objetivo específico.",
    context: "Cuarta pregunta - Ahorros y metas",
    expectedData: "Tabla con ahorros estructurados"
  }
};

// Obtener la siguiente pregunta (SIMPLIFICADO - 4 preguntas)
function getNextQuestion(questionNumber: number): string {
  const questions = {
    1: "¡Hola! Vamos a crear tu presupuesto de manera estructurada. Empecemos con tus **INGRESOS MENSUALES**. Usa la tabla para organizar todos tus ingresos por categoría y subcategoría.",
    2: "Perfecto! Ahora necesito conocer tus **GASTOS FIJOS MENSUALES**. Estos son los gastos que tienes cada mes sin falta. Usa la tabla para organizarlos por categoría y subcategoría.",
    3: "¡Excelente! Continuemos con tus **GASTOS VARIABLES MENSUALES**. Estos son gastos que pueden cambiar mes a mes. Organízalos en la tabla por categoría y subcategoría.",
    4: "¡Casi terminamos! Por último, cuéntame sobre tus **AHORROS Y METAS FINANCIERAS**. ¿Cuánto planeas ahorrar este mes? Organiza tus ahorros por categoría y objetivo específico."
  };
  
  return questions[questionNumber as keyof typeof questions] || "¡Tu presupuesto está completo! 🎉";
}

// Función principal para enviar mensajes de presupuesto
export async function sendBudgetMessage(request: BudgetMessageRequest): Promise<string> {
  try {
    const { message, questionNumber, parsedData, chatHistory = [], userProfile } = request;
    
    console.log(`🤖 Enviando mensaje de presupuesto a Gemini - Pregunta ${questionNumber}`);
    
    // Construir contexto de la conversación
    const conversationContext = buildConversationContext(chatHistory, userProfile);
    
    // Obtener información de la pregunta actual
    const currentQuestion = BUDGET_QUESTIONS[questionNumber as keyof typeof BUDGET_QUESTIONS];
    
    // Construir el prompt especializado
    const prompt = buildBudgetPrompt({
      message,
      questionNumber,
      currentQuestion,
      parsedData,
      conversationContext,
      userProfile
    });
    
    console.log(`📝 Prompt construido para pregunta ${questionNumber}`);
    
    // Enviar a Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log(`✅ Respuesta de Gemini recibida: ${text.length} caracteres`);
    
    return text;
    
  } catch (error) {
    console.error('❌ Error en sendBudgetMessage:', error);
    return getFallbackResponse(request.questionNumber);
  }
}

// Construir contexto de la conversación
function buildConversationContext(chatHistory: any[], userProfile: any): string {
  let context = "";
  
  // Agregar información del perfil si existe
  if (userProfile) {
    context += `\nINFORMACIÓN DEL USUARIO:
- Nombre: ${userProfile.full_name || 'No especificado'}
- Edad: ${userProfile.age || 'No especificada'}
- Estado civil: ${userProfile.civil_status || 'No especificado'}
- Hijos: ${userProfile.children_count || 0}
- Ingresos mensuales: $${userProfile.monthly_income?.toLocaleString() || 'No especificado'}
- Gastos mensuales: $${userProfile.monthly_expenses?.toLocaleString() || 'No especificado'}`;
  }
  
  // Agregar historial reciente de chat
  if (chatHistory.length > 0) {
    context += "\n\nHISTORIAL RECIENTE:";
    chatHistory.forEach((entry, index) => {
      context += `\nPregunta ${entry.question_number}: ${entry.user_message}`;
      if (entry.parsed_data && Object.keys(entry.parsed_data).length > 0) {
        context += ` (Datos: ${JSON.stringify(entry.parsed_data)})`;
      }
    });
  }
  
  return context;
}

// Construir prompt especializado para presupuesto
function buildBudgetPrompt(params: {
  message: string;
  questionNumber: number;
  currentQuestion: any;
  parsedData: any;
  conversationContext: string;
  userProfile: any;
}): string {
  const { message, questionNumber, currentQuestion, parsedData, conversationContext, userProfile } = params;
  
  let prompt = FINCO_BUDGET_PERSONALITY;
  
  // Agregar contexto
  if (conversationContext) {
    prompt += `\n\nCONTEXTO DE LA CONVERSACIÓN:${conversationContext}`;
  }
  
  // Agregar información de la pregunta actual
  if (currentQuestion) {
    prompt += `\n\nPREGUNTA ACTUAL (${questionNumber}/10):
Concepto: ${currentQuestion.concept}
Explicación: ${currentQuestion.explanation}`;
  }
  
  // Agregar datos parseados si existen
  if (parsedData && Object.keys(parsedData).length > 0) {
    prompt += `\n\nDATOS DETECTADOS: ${JSON.stringify(parsedData, null, 2)}`;
  }
  
  // Instrucciones específicas por pregunta
  prompt += `\n\nINSTRUCCIONES ESPECÍFICAS:`;
  
  switch (questionNumber) {
    case 1:
      prompt += `\n- Pregunta DIRECTA sobre el período
- Si menciona un mes, pregunta el año
- Continúa inmediatamente con ingresos`;
      break;
      
    case 2:
      prompt += `\n- Solicita el MONTO TOTAL de ingresos
- Insiste en cifras específicas en pesos
- Si no da monto, pide que sea más específico`;
      break;
      
    case 3:
      prompt += `\n- Pide LISTA con MONTOS específicos
- Formato: "Concepto $monto"
- Si no da montos, insiste en cifras`;
      break;
      
    case 4:
      prompt += `\n- Pide LISTA con MONTOS específicos
- Formato: "Concepto $monto"
- Si no da montos, insiste en cifras`;
      break;
      
    case 5:
      prompt += `\n- Pregunta si quiere subcategorías
- Si dice sí, pide montos específicos
- Si dice no, continúa con ahorro`;
      break;
      
    case 6:
      prompt += `\n- Pide MONTO específico de ahorro
- Insiste en cifras en pesos
- Continúa con ajustes finales`;
      break;
      
    case 7:
      prompt += `\n- Pregunta por ajustes o gastos olvidados
- Si no hay cambios, continúa con confirmación
- Mantén conversación breve`;
      break;
      
    case 8:
      prompt += `\n- Pide confirmación final
- Si dice SÍ, felicita y despídete
- El presupuesto se creará automáticamente`;
      break;
      
    default:
      prompt += `\n- Responde de forma breve y directa`;
  }
  
  prompt += `\n\nMENSAJE DEL USUARIO: "${message}"
  
RESPONDE COMO FINCO con máximo 150 palabras, siendo educativo, motivador y avanzando al siguiente paso.`;
  
  return prompt;
}

// Respuesta de fallback en caso de error
function getFallbackResponse(questionNumber: number): string {
  const fallbackResponses = {
    1: "¡Hola! Soy FINCO 💪 ¿Para qué mes y año quieres crear tu presupuesto? (Ejemplo: agosto 2025)",
    2: "¿Cuál es tu ingreso total mensual? Incluye salario, rentas, trabajos extra, etc. Dame el monto en pesos.",
    3: "Lista tus gastos fijos mensuales CON MONTOS. Ejemplo: Arriendo $800,000, Servicios $200,000, etc.",
    4: "Lista tus gastos variables CON MONTOS. Ejemplo: Comida $600,000, Transporte $300,000, etc.",
    5: "¿Quieres desglosar alguna categoría? Ejemplo: Comida → Mercado $400,000, Restaurantes $200,000",
    6: "¿Cuánto quieres AHORRAR este mes? Dame el monto específico en pesos.",
    7: "¿Hay algo que quieras AJUSTAR en las cifras que me diste? ¿Algún gasto que olvidaste?",
    8: "¡Perfecto! ¿Confirmas estos datos para crear tu presupuesto? Responde SÍ para finalizar."
  };
  
  return fallbackResponses[questionNumber as keyof typeof fallbackResponses] || 
         "Continuemos con tu presupuesto. ¿En qué puedo ayudarte?";
} 