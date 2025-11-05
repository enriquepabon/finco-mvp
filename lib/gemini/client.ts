/**
 * Google Gemini AI Client
 *
 * Provides integration with Google's Gemini AI model for conversational financial coaching.
 * Handles chat history, context injection, error handling, and quota management.
 *
 * @module gemini/client
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../env';
import { OnboardingData } from '../../src/types/onboarding';

/**
 * Google Generative AI client instance.
 * Initialized with API key from validated environment variables.
 *
 * @constant
 * @type {GoogleGenerativeAI}
 */
const genAI = new GoogleGenerativeAI(env.GOOGLE_GEMINI_API_KEY);

/**
 * Configured Gemini 1.5 Flash model instance.
 *
 * Model configuration:
 * - temperature: 0.8 (balanced creativity)
 * - topP: 0.8 (nucleus sampling)
 * - topK: 40 (top K tokens)
 * - maxOutputTokens: 1000 (max response length)
 *
 * @constant
 * @type {GenerativeModel}
 */
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.8,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1000,
  },
});

/**
 * Represents a single message in a chat conversation.
 *
 * @interface ChatMessage
 * @property {'user' | 'assistant'} role - Message author: 'user' for client, 'assistant' for FINCO AI
 * @property {string} content - Message text content
 * @property {Date} [timestamp] - Optional message timestamp
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

/**
 * Response object from Gemini AI operations.
 *
 * @interface ChatResponse
 * @property {string} message - AI-generated response message or error message
 * @property {boolean} success - Whether the request succeeded
 * @property {string} [error] - Error details if success is false
 */
export interface ChatResponse {
  message: string;
  success: boolean;
  error?: string;
}

/**
 * Sends a message to Google Gemini AI and returns the response.
 *
 * Constructs a full prompt including optional context and chat history,
 * sends it to Gemini 1.5 Flash, and handles errors including quota exhaustion (429).
 *
 * Prompt structure:
 * 1. Context (if provided)
 * 2. Chat history (if provided)
 * 3. Current user message
 *
 * Error handling:
 * - 429 (quota exceeded): Returns user-friendly Spanish message with retry instructions
 * - Other errors: Returns generic error message
 *
 * @param {string} message - User's message to send to Gemini
 * @param {string} [context] - Optional system context/instructions for AI behavior
 * @param {ChatMessage[]} [chatHistory] - Optional conversation history for context
 * @returns {Promise<ChatResponse>} AI response with success status and error details if failed
 *
 * @example
 * const response = await sendMessageToGemini(
 *   "¿Cómo puedo ahorrar más dinero?",
 *   "Eres FINCO, un coach financiero",
 *   [{ role: 'user', content: 'Hola', timestamp: new Date() }]
 * );
 * if (response.success) {
 *   console.log(response.message);
 * }
 */
export async function sendMessageToGemini(
  message: string,
  context?: string,
  chatHistory?: ChatMessage[]
): Promise<ChatResponse> {
  try {
    // Construir el contexto completo
    let fullPrompt = '';
    
    if (context) {
      fullPrompt += `${context}\n\n`;
    }
    
    // Agregar historial de chat si existe
    if (chatHistory && chatHistory.length > 0) {
      fullPrompt += 'Historial de conversación:\n';
      chatHistory.forEach(msg => {
        const role = msg.role === 'user' ? 'Usuario' : 'FINCO';
        fullPrompt += `${role}: ${msg.content}\n`;
      });
      fullPrompt += '\n';
    }
    
    fullPrompt += `Usuario: ${message}\nFINCO:`;
    
    console.log('🤖 Enviando mensaje a Gemini:', { message, hasContext: !!context, historyLength: chatHistory?.length || 0 });
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Respuesta de Gemini recibida:', text.substring(0, 100) + '...');
    
    return {
      message: text.trim(),
      success: true
    };
    
  } catch (error) {
    console.error('❌ Error al comunicarse con Gemini:', error);
    
    // Detectar error 429 - cuota agotada
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
      return {
        message: '⏰ **Cuota de IA temporalmente agotada**\n\nPor favor:\n1. Espera unos minutos e intenta de nuevo\n2. O continúa escribiendo tus respuestas normalmente\n\n*El sistema guardará tu información correctamente.*',
        success: false,
        error: 'Cuota de Gemini agotada - error 429'
      };
    }
    
    // Otros errores
    return {
      message: 'Lo siento, tengo problemas técnicos en este momento. ¿Podrías intentar de nuevo escribiendo tu respuesta?',
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Specialized function for financial onboarding conversations.
 *
 * Injects comprehensive FINCO coaching persona and onboarding context into the prompt.
 * Ensures structured 9-question flow for collecting user financial profile data.
 *
 * FINCO Persona:
 * - Expert financial coach with empathetic, educational approach
 * - Strict about following exact question sequence (1-9)
 * - One question per message, no assumptions
 * - Includes financial tips and motivational quotes
 *
 * Onboarding Questions (EXACT ORDER):
 * 1. Full name
 * 2. Age
 * 3. Civil status
 * 4. Children count
 * 5. Monthly income
 * 6. Monthly expenses
 * 7. Total assets
 * 8. Total liabilities
 * 9. Total savings
 *
 * Message format enforced:
 * 1. Acknowledge previous response (1-2 lines)
 * 2. Optional financial tip (1 line)
 * 3. Next question from sequence (1 line)
 * 4. Optional motivational phrase (1 line)
 *
 * @param {string} message - User's onboarding response
 * @param {Partial<OnboardingData> | {full_name?: string; email?: string}} userProfile - Current user profile data
 * @param {ChatMessage[]} [chatHistory] - Conversation history to track progress
 * @returns {Promise<ChatResponse>} AI response following onboarding rules
 *
 * @example
 * const response = await sendOnboardingMessage(
 *   "Me llamo Juan Pérez",
 *   { full_name: "Juan Pérez", email: "juan@example.com" },
 *   []
 * );
 * // Response will acknowledge name and ask question #2 (age)
 */
export async function sendOnboardingMessage(
  message: string,
  userProfile: Partial<OnboardingData> | { full_name?: string; email?: string },
  chatHistory?: ChatMessage[]
): Promise<ChatResponse> {
  const onboardingContext = `
## ERES FINCO - TU COACH FINANCIERO PERSONAL 🤖💰

### TU PERSONALIDAD:
- 🎯 **EXPERTO**: Dominas las finanzas personales como pocos
- 😊 **AMIGABLE**: Conversas de manera cercana y empática  
- 💪 **ESTRICTO**: Cuando se trata de dinero, eres directo y honesto
- 🤔 **CURIOSO**: Haces muchas preguntas para conocer bien a tus clientes
- 📚 **EDUCADOR**: Compartes tips, datos interesantes y citas de expertos financieros
- 🔥 **MOTIVADOR**: Emocionas a las personas sobre sus finanzas

### INFORMACIÓN BÁSICA DEL PERFIL (EXACTAMENTE 9 PREGUNTAS):
1. **Nombre completo** - "¿Cómo te llamas?"
2. **Edad** - "¿Cuántos años tienes?"
3. **Estado Civil** - "¿Cuál es tu estado civil? (soltero/casado/unión libre/divorciado/viudo)"
4. **Hijos** - "¿Tienes hijos? ¿Cuántos?"
5. **Ingresos mensuales totales** - "¿Cuánto ganas al mes en total? (trabajo + otros ingresos)"
6. **Gastos mensuales totales** - "¿Cuánto gastas aproximadamente al mes en total?"
7. **Activos principales** - "¿Qué activos tienes? (casa, carro, propiedades - valores aproximados)"
8. **Pasivos/Deudas** - "¿Qué deudas tienes? (tarjetas, préstamos, hipoteca - montos aproximados)"
9. **Ahorros actuales** - "¿Cuánto tienes ahorrado en total actualmente?"

### TU ESTILO DE CONVERSACIÓN:
- Si es el primer mensaje, preséntate brevemente con entusiasmo
- Haz UNA pregunta específica a la vez
- Intercala datos curiosos y tips financieros relevantes
- Usa emojis ocasionalmente (pero no en exceso)
- Incluye citas de expertos cuando sea pertinente
- Mantén respuestas entre 80-150 palabras máximo
- Haz la conversación dinámica y emocionante

### EJEMPLOS DE DATOS CURIOSOS:
- "¿Sabías que solo el 32% de las personas tiene un presupuesto escrito?"
- "Dato curioso: Las personas que escriben sus metas financieras tienen un 42% más probabilidades de alcanzarlas"
- "Como decía Dave Ramsey: 'Un presupuesto es decirle a tu dinero a dónde ir, en lugar de preguntarte a dónde se fue'"
- "Warren Buffett dice: 'No ahorres lo que te queda después de gastar, gasta lo que te queda después de ahorrar'"

### INFORMACIÓN ACTUAL DEL USUARIO:
- Nombre: ${userProfile?.full_name || 'Aún no proporcionado'}
- Email: ${userProfile?.email || 'No disponible'}

### SEGUIMIENTO DE PROGRESO:
**IMPORTANTE**: Analiza el historial de conversación para determinar en qué pregunta estás:
- Si es el primer mensaje del usuario: Pregunta #1 (Nombre completo)
- Cuenta los intercambios anteriores para saber qué pregunta sigue (1-9)
- NO repitas preguntas ya respondidas
- NO te saltes preguntas sin responder
- Recuerda: solo necesitas información BÁSICA para el perfil y presupuesto

### INSTRUCCIONES CRÍTICAS - SEGUIR AL PIE DE LA LETRA:

**REGLA #1 - UNA PREGUNTA POR VEZ:**
- NUNCA hagas más de UNA pregunta por mensaje
- NUNCA asumas respuestas del usuario
- ESPERA la respuesta antes de continuar a la siguiente pregunta

**REGLA #2 - ORDEN ESTRICTO:**
- Sigue EXACTAMENTE el orden numerado de las 9 preguntas básicas
- NO te saltes preguntas
- NO cambies el orden

**REGLA #3 - PROPÓSITO DEL ONBOARDING:**
- Esta información es para llenar el PERFIL BÁSICO del usuario
- Con estos datos podrá crear su PRESUPUESTO en el dashboard
- NO preguntes sobre metas, inversiones específicas o seguros (eso será después)

**REGLA #4 - FORMATO DE MENSAJE:**
1. Celebra/reconoce la respuesta anterior (1-2 líneas)
2. Opcional: Un dato curioso o tip (1 línea)
3. Haz LA SIGUIENTE pregunta de la lista (1 línea)
4. Opcional: Una frase motivacional corta (1 línea)

**REGLA #5 - FINAL:**
- Solo después de la pregunta #9 y su respuesta, despídete
- Menciona que ahora puede crear su presupuesto en el dashboard
- NO hagas preguntas adicionales

### EJEMPLOS DE FORMATO CORRECTO:

**✅ CORRECTO:**
"¡Excelente Juan! 32 años es una edad perfecta para planificar.
💡 ¿Sabías que empezar a los 30 años da 35 años para construir riqueza?
¿Cuál es tu estado civil? (soltero/casado/unión libre/divorciado/viudo)
¡Esta información me ayuda a personalizar tu presupuesto! 📊"

**❌ INCORRECTO:**
"¿Cuál es tu estado civil? ¿Y tienes hijos? ¿Cuánto ganas?"

**❌ INCORRECTO:**
"Como tienes 32 años, asumo que ya tienes estabilidad laboral..."
`;

  return sendMessageToGemini(message, onboardingContext, chatHistory);
}

/**
 * Default export: Configured Gemini 1.5 Flash model instance.
 * Use this for direct model access if custom generation config is needed.
 *
 * @default model
 */
export default model; 