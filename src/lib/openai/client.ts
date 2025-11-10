/**
 * OpenAI Client - Reemplazo de Gemini
 *
 * Cliente configurado para usar GPT-4 o GPT-3.5-turbo
 * Compatible con la misma interfaz que el cliente de Gemini
 */

import OpenAI from 'openai';
import { env } from '../env';
import { OnboardingData } from '../../src/types/onboarding';

/**
 * Cliente de OpenAI configurado con API Key
 */
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

/**
 * Modelo a usar - puedes cambiar entre:
 * - 'gpt-4o' (más nuevo, más inteligente)
 * - 'gpt-4o-mini' (óptimo: rápido, económico, muy capaz) ⭐ RECOMENDADO
 * - 'gpt-4-turbo-preview' (muy inteligente, más caro)
 * - 'gpt-3.5-turbo' (rápido, económico, menos capaz)
 */
const MODEL = 'gpt-4o-mini'; // Cambiado a GPT-4o-mini para mejor costo-eficiencia

/**
 * Interfaz de mensaje de chat
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

/**
 * Interfaz de respuesta de chat
 */
export interface ChatResponse {
  message: string;
  success: boolean;
  error?: string;
}

/**
 * Envía un mensaje a OpenAI GPT
 * 
 * @param message - Mensaje del usuario
 * @param context - Contexto del sistema (instrucciones para la IA)
 * @param chatHistory - Historial de conversación
 * @returns Respuesta de la IA
 */
export async function sendMessageToOpenAI(
  message: string,
  context?: string,
  chatHistory?: ChatMessage[]
): Promise<ChatResponse> {
  try {
    // Construir mensajes para OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    // Agregar contexto del sistema si existe
    if (context) {
      messages.push({
        role: 'system',
        content: context
      });
    }

    // Agregar historial de chat
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach(msg => {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        });
      });
    }

    // Agregar mensaje actual del usuario
    messages.push({
      role: 'user',
      content: message
    });

    console.log('🤖 Enviando mensaje a OpenAI:', { 
      model: MODEL,
      messageCount: messages.length,
      hasContext: !!context 
    });

    // Llamar a OpenAI
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: messages,
      temperature: 0.8,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    console.log('✅ Respuesta de OpenAI recibida:', responseText.substring(0, 100) + '...');

    return {
      message: responseText.trim(),
      success: true
    };

  } catch (error) {
    console.error('❌ Error al comunicarse con OpenAI:', error);

    // Detectar errores de cuota/límite
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('insufficient_quota') || errorMessage.includes('rate_limit')) {
      return {
        message: '⏰ **Límite de API alcanzado**\n\nPor favor:\n1. Verifica tu cuenta de OpenAI\n2. O continúa escribiendo tus respuestas normalmente\n\n*El sistema guardará tu información correctamente.*',
        success: false,
        error: 'Límite de OpenAI alcanzado'
      };
    }

    if (errorMessage.includes('invalid_api_key')) {
      return {
        message: '🔑 **API Key inválida**\n\nPor favor configura una API Key válida de OpenAI en tu archivo .env.local',
        success: false,
        error: 'API Key inválida'
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
 * Función especializada para onboarding con FINCO
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

### INFORMACIÓN ACTUAL DEL USUARIO:
- Nombre: ${userProfile?.full_name || 'Aún no proporcionado'}
- Email: ${userProfile?.email || 'No disponible'}

### INSTRUCCIONES CRÍTICAS:
**REGLA #1**: Haz UNA pregunta específica a la vez
**REGLA #2**: Sigue EXACTAMENTE el orden numerado de las 9 preguntas
**REGLA #3**: Mantén respuestas entre 80-150 palabras máximo
**REGLA #4**: NO hagas preguntas adicionales fuera de las 9 básicas
**REGLA #5**: Usa emojis ocasionalmente pero no en exceso
`;

  return sendMessageToOpenAI(message, onboardingContext, chatHistory);
}

/**
 * Función especializada para chat de presupuesto con MentorIA
 */
export async function sendBudgetConversationalMessage(
  message: string,
  userContext: { full_name?: string; email?: string },
  chatHistory?: ChatMessage[]
): Promise<ChatResponse> {
  const { getBudgetConversationalPrompt } = await import('../gemini/specialized-prompts');
  const budgetContext = getBudgetConversationalPrompt(message, userContext, chatHistory);
  
  return sendMessageToOpenAI(message, budgetContext, chatHistory);
}

/**
 * Analiza una conversación completa de presupuesto y extrae datos estructurados
 * 
 * @param chatHistory - Historial completo de la conversación
 * @param userContext - Contexto del usuario
 * @returns Datos estructurados en formato JSON
 */
export async function analyzeBudgetConversation(
  chatHistory: ChatMessage[],
  userContext: { full_name?: string; email?: string }
): Promise<{
  success: boolean;
  data?: {
    ingresos: Array<{ nombre: string; monto: number }>;
    gastos_fijos: Array<{ nombre: string; monto: number }>;
    gastos_variables: Array<{ nombre: string; monto: number }>;
    ahorros: Array<{ nombre: string; monto: number }>;
  };
  error?: string;
}> {
  try {
    const analysisPrompt = `Eres un experto analista financiero. Tu tarea es analizar la siguiente conversación sobre presupuesto y extraer TODA la información mencionada en un formato JSON estructurado.

**CONVERSACIÓN:**
${chatHistory.map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n\n')}

---

**TU TAREA:**
Analiza la conversación completa y extrae TODOS los ingresos, gastos fijos, gastos variables y ahorros mencionados.

**REGLAS IMPORTANTES:**
1. Extrae TODOS los montos mencionados, aunque sean aproximados
2. Si el usuario dice "18 millones", interpreta como 18000000
3. Si dice "500 mil", interpreta como 500000
4. Si dice "2.3 millones", interpreta como 2300000
5. Normaliza los nombres (ej: "arriendo" = "Arriendo")
6. Si un gasto se menciona varias veces, usa el último valor mencionado
7. Ignora montos que sean solo ejemplos del asistente
8. Si no mencionó ningún dato de alguna categoría, devuelve array vacío []

**FORMATO DE RESPUESTA (JSON puro, sin markdown):**
{
  "ingresos": [
    {"nombre": "Salario", "monto": 18000000},
    {"nombre": "Arriendo", "monto": 2300000}
  ],
  "gastos_fijos": [
    {"nombre": "Arriendo", "monto": 2300000},
    {"nombre": "Servicios", "monto": 500000}
  ],
  "gastos_variables": [
    {"nombre": "Comida", "monto": 1000000},
    {"nombre": "Transporte", "monto": 500000}
  ],
  "ahorros": [
    {"nombre": "Inversión", "monto": 2000000}
  ]
}

**RESPONDE SOLO CON EL JSON, SIN EXPLICACIONES NI MARKDOWN.**`;

    console.log('🤖 Analizando conversación completa con GPT-4o-mini...');

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: analysisPrompt
        },
        {
          role: 'user',
          content: 'Analiza la conversación y extrae los datos estructurados.'
        }
      ],
      temperature: 0.1, // Baja temperatura para respuestas más deterministas
      response_format: { type: "json_object" } // Forzar respuesta JSON
    });

    const responseContent = completion.choices[0]?.message?.content || '{}';
    console.log('📊 Respuesta del análisis:', responseContent);

    // Parsear JSON
    const parsedData = JSON.parse(responseContent);

    // Validar estructura
    if (!parsedData.ingresos && !parsedData.gastos_fijos && !parsedData.gastos_variables && !parsedData.ahorros) {
      throw new Error('Formato de datos inválido');
    }

    return {
      success: true,
      data: {
        ingresos: parsedData.ingresos || [],
        gastos_fijos: parsedData.gastos_fijos || [],
        gastos_variables: parsedData.gastos_variables || [],
        ahorros: parsedData.ahorros || []
      }
    };

  } catch (error) {
    console.error('❌ Error analizando conversación:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Analiza una conversación completa de onboarding y extrae datos estructurados del perfil
 * 
 * @param chatHistory - Historial completo de la conversación de onboarding
 * @param userContext - Contexto del usuario
 * @returns Datos estructurados del perfil en formato JSON
 */
export async function analyzeOnboardingConversation(
  chatHistory: ChatMessage[],
  userContext: { full_name?: string; email?: string }
): Promise<{
  success: boolean;
  data?: {
    full_name?: string;
    age?: number;
    civil_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'other';
    children_count?: number;
    monthly_income?: number;
    monthly_expenses?: number;
    total_assets?: number;
    total_liabilities?: number;
    total_savings?: number;
  };
  error?: string;
}> {
  try {
    const analysisPrompt = `Eres un experto analista financiero. Tu tarea es analizar la siguiente conversación de onboarding y extraer TODA la información del perfil financiero del usuario en un formato JSON estructurado.

**CONVERSACIÓN:**
${chatHistory.map(msg => `${msg.role === 'user' ? 'Usuario' : 'MentorIA'}: ${msg.content}`).join('\n\n')}

---

**TU TAREA:**
Analiza la conversación completa y extrae TODOS los datos personales y financieros mencionados.

**REGLAS IMPORTANTES:**
1. Extrae TODOS los datos mencionados, aunque sean aproximados
2. Si el usuario dice "18 millones", interpreta como 18000000
3. Si dice "500 mil", interpreta como 500000
4. Si dice "2.3 millones", interpreta como 2300000
5. Para edad, extrae solo el número (ej: "tengo 35" → 35)
6. Para estado civil, SOLO usa estos valores EXACTOS en español:
   - "soltero" → soltero/soltera/single
   - "casado" → casado/casada/married/en pareja/viviendo juntos/unión libre
   - "divorciado" → divorciado/divorciada/divorced/separado/separada
   - "viudo" → viudo/viuda/widowed
   - Si no está claro o no mencionó, NO incluyas el campo
7. Para número de hijos, extrae solo el número (ej: "dos hijos" → 2, "sin hijos" → 0)
8. Si un dato se menciona varias veces, usa el último valor mencionado
9. Ignora montos que sean solo ejemplos del asistente
10. Si no mencionó algún dato, NO lo incluyas en el JSON (déjalo como null o no lo pongas)
11. Para ahorros (total_savings), busca menciones como: "tengo X ahorrados", "ahorros de X", "guardado X"

**IMPORTANTE: Todos los valores de texto deben estar en ESPAÑOL, especialmente civil_status.**

**CAMPOS A EXTRAER:**
- full_name: Nombre completo del usuario
- age: Edad en años (número)
- civil_status: Estado civil (SOLO en español: "soltero", "casado", "divorciado", "viudo")
- children_count: Número de hijos (número, 0 si no tiene)
- monthly_income: Ingresos mensuales totales (número)
- monthly_expenses: Gastos mensuales totales (número)
- total_assets: Activos totales - propiedades, inversiones, cuentas (número)
- total_liabilities: Deudas totales - préstamos, tarjetas de crédito (número)
- total_savings: Ahorros actuales (número)

**FORMATO DE RESPUESTA (JSON puro, sin markdown):**
{
  "full_name": "Juan Pérez",
  "age": 35,
  "civil_status": "casado",
  "children_count": 2,
  "monthly_income": 18000000,
  "monthly_expenses": 12000000,
  "total_assets": 50000000,
  "total_liabilities": 15000000,
  "total_savings": 5000000
}

**IMPORTANTE:**
- Si un campo no fue mencionado, NO lo incluyas en el JSON
- Solo incluye campos que tengan valores concretos mencionados por el usuario
- NO inventes datos que no estén en la conversación

**RESPONDE SOLO CON EL JSON, SIN EXPLICACIONES NI MARKDOWN.**`;

    console.log('🤖 Analizando conversación de onboarding con GPT-4o-mini...');

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: analysisPrompt
        },
        {
          role: 'user',
          content: 'Analiza la conversación y extrae los datos del perfil estructurados.'
        }
      ],
      temperature: 0.1, // Baja temperatura para respuestas más deterministas
      response_format: { type: "json_object" } // Forzar respuesta JSON
    });

    const responseContent = completion.choices[0]?.message?.content || '{}';
    console.log('📊 Respuesta del análisis de onboarding:', responseContent);

    // Parsear JSON
    const parsedData = JSON.parse(responseContent);

    // Validar que al menos tenga algunos campos
    const hasData = Object.keys(parsedData).length > 0;
    if (!hasData) {
      throw new Error('No se extrajeron datos del perfil');
    }

    return {
      success: true,
      data: {
        full_name: parsedData.full_name,
        age: parsedData.age,
        civil_status: parsedData.civil_status,
        children_count: parsedData.children_count,
        monthly_income: parsedData.monthly_income,
        monthly_expenses: parsedData.monthly_expenses,
        total_assets: parsedData.total_assets,
        total_liabilities: parsedData.total_liabilities,
        total_savings: parsedData.total_savings
      }
    };

  } catch (error) {
    console.error('❌ Error analizando conversación de onboarding:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Analiza un mensaje de transacción (voz o texto) y extrae datos estructurados
 * 
 * @param message - Mensaje del usuario sobre la transacción
 * @param userContext - Contexto del usuario (nombre, email)
 * @param availableCategories - Categorías y subcategorías disponibles del presupuesto con IDs
 * @returns Datos estructurados de la transacción en formato JSON
 */
export async function analyzeTransaction(
  message: string,
  userContext: { full_name?: string; email?: string },
  availableCategories?: {
    income: Array<{ category_id: string; category_name: string; subcategories: Array<{ id: string; name: string }> }>;
    fixed_expenses: Array<{ category_id: string; category_name: string; subcategories: Array<{ id: string; name: string }> }>;
    variable_expenses: Array<{ category_id: string; category_name: string; subcategories: Array<{ id: string; name: string }> }>;
  }
): Promise<{
  success: boolean;
  data?: {
    transaction_type: 'income' | 'expense';
    category: 'income' | 'fixed_expense' | 'variable_expense';
    suggested_category_name: string;
    suggested_subcategory_name: string;
    amount: number;
    description: string;
    date?: string;
  };
  error?: string;
}> {
  try {
    // Construir contexto de categorías disponibles con estructura jerárquica
    let categoriesContext = '';
    if (availableCategories) {
      categoriesContext = `\n**CATEGORÍAS Y SUBCATEGORÍAS DISPONIBLES EN EL PRESUPUESTO DEL USUARIO:**\n\n`;
      
      if (availableCategories.income.length > 0) {
        categoriesContext += `📊 INGRESOS:\n`;
        availableCategories.income.forEach(cat => {
          categoriesContext += `  • ${cat.category_name}\n`;
          if (cat.subcategories.length > 0) {
            cat.subcategories.forEach(sub => {
              categoriesContext += `    - ${sub.name}\n`;
            });
          }
        });
        categoriesContext += `\n`;
      }

      if (availableCategories.fixed_expenses.length > 0) {
        categoriesContext += `💳 GASTOS FIJOS:\n`;
        availableCategories.fixed_expenses.forEach(cat => {
          categoriesContext += `  • ${cat.category_name}\n`;
          if (cat.subcategories.length > 0) {
            cat.subcategories.forEach(sub => {
              categoriesContext += `    - ${sub.name}\n`;
            });
          }
        });
        categoriesContext += `\n`;
      }

      if (availableCategories.variable_expenses.length > 0) {
        categoriesContext += `🛒 GASTOS VARIABLES:\n`;
        availableCategories.variable_expenses.forEach(cat => {
          categoriesContext += `  • ${cat.category_name}\n`;
          if (cat.subcategories.length > 0) {
            cat.subcategories.forEach(sub => {
              categoriesContext += `    - ${sub.name}\n`;
            });
          }
        });
      }
    }

    const analysisPrompt = `Eres un experto clasificador de transacciones financieras. Tu tarea es analizar el siguiente mensaje del usuario y extraer la información de la transacción en formato JSON estructurado.

**MENSAJE DEL USUARIO:**
"${message}"

**USUARIO:** ${userContext.full_name || 'Usuario'}
${categoriesContext}

---

**TU TAREA:**
Analiza el mensaje y determina:
1. Si es un ingreso, gasto o ahorro
2. Si es gasto: clasificar como fijo/variable y esencial/no esencial
3. **CRÍTICO:** La categoría PADRE y subcategoría (busca primero en el presupuesto, luego sugiere categorías estándar)
4. El monto
5. Una descripción clara

**REGLAS DE CLASIFICACIÓN:**

1. **TIPO DE TRANSACCIÓN:**
   - "income" → Ingreso (recibí, me pagaron, gané, cobré, ingreso, salario)
   - "expense" → Gasto (pagué, gasté, compré, me cobraron)
   - "savings" → Ahorro (ahorré, invertí, guardé, ahorro)

2. **PARA GASTOS (SOLO SI transaction_type = "expense"):**
   
   a) **TIPO DE GASTO (expense_type):**
      - "fixed" → Gasto Fijo: Recurrente, obligatorio, mismo monto
        Ejemplos: arriendo, servicios (luz, agua, gas), celular, seguros, suscripciones fijas
      
      - "variable" → Gasto Variable: Ocasional, opcional, monto cambia
        Ejemplos: mercado, restaurantes, ropa, entretenimiento, transporte variable
   
   b) **PRIORIDAD (is_essential):**
      - true → Esencial: Necesario para vivir, obligatorio, crítico
        Ejemplos: arriendo, comida básica, servicios públicos, salud, transporte al trabajo
      
      - false → No Esencial: Opcional, lujo, entretenimiento
        Ejemplos: restaurantes, streaming, compras de lujo, viajes recreativos

3. **🔥 CATEGORÍA Y SUBCATEGORÍA (MUY IMPORTANTE):**
   
   **ESTRATEGIA DE BÚSQUEDA (EN ORDEN):**
   
   a) **PRIMERO: Busca en el presupuesto del usuario**
      - Busca coincidencias exactas o similares en subcategorías
      - Si encuentras, usa la categoría padre de esa subcategoría
   
   b) **SEGUNDO: Si NO encuentras coincidencia, usa CATEGORÍAS ESTÁNDAR**
      
      **CATEGORÍAS ESTÁNDAR PARA GASTOS FIJOS (fixed):**
      - Vivienda:
        * Arriendo / Alquiler
        * Hipoteca
        * Administración
      - Servicios:
        * Agua
        * Luz / Electricidad
        * Gas
        * Internet
        * Teléfono
      - Transporte:
        * Gasolina
        * Transporte público
        * Parqueadero
      - Seguros:
        * Seguro de vida
        * Seguro de salud
        * Seguro de auto
      - Suscripciones:
        * Netflix / Streaming
        * Spotify
        * Gym

      **CATEGORÍAS ESTÁNDAR PARA GASTOS VARIABLES (variable):**
      - Alimentación:
        * Mercado / Supermercado
        * Restaurantes
        * Cafeterías
      - Entretenimiento:
        * Cine
        * Eventos
        * Viajes
      - Compras:
        * Ropa
        * Tecnología
        * Hogar
      - Salud:
        * Medicamentos
        * Doctor
        * Farmacia
      - Educación:
        * Libros
        * Cursos
        * Material educativo

   **EJEMPLOS DE APLICACIÓN:**
   - Usuario dice "pago agua" y NO existe "Agua" en su presupuesto
     → suggested_category_name: "Servicios", suggested_subcategory_name: "Agua"
   
   - Usuario dice "pago electricidad" y existe "Admin Batan 50" en presupuesto
     → Evalúa: ¿"Admin Batan 50" se relaciona con electricidad? Probablemente NO
     → Usa categoría estándar: suggested_category_name: "Servicios", suggested_subcategory_name: "Electricidad"
   
   - Usuario dice "compré mercado" y existe "Mercado" en presupuesto
     → Usa del presupuesto: suggested_category_name: "Gastos Variables", suggested_subcategory_name: "Mercado"
   
   - Usuario dice "pagué arriendo" y existe "Arriendo" en presupuesto
     → Usa del presupuesto: suggested_category_name: del presupuesto, suggested_subcategory_name: "Arriendo"

4. **MONTO:**
   - Convierte lenguaje natural a números:
     * "15 millones" = 15000000
     * "2.3 millones" = 2300000
     * "500 mil" = 500000
     * "1 millón" = 1000000
   - **CRÍTICO:** Si el usuario NO menciona monto, devuelve -1 (no 0)
   - Ejemplos:
     * "pagué electricidad" sin monto → amount: -1
     * "pagué electricidad 50 mil" → amount: 50000

5. **DESCRIPCIÓN:**
   - Clara y concisa (máx 100 caracteres)
   - Incluye qué es la transacción

**FORMATO DE RESPUESTA (JSON puro, sin markdown):**

PARA GASTOS:
{
  "transaction_type": "expense",
  "category": "expense",
  "expense_type": "fixed",
  "is_essential": true,
  "suggested_category_name": "Servicios",
  "suggested_subcategory_name": "Agua",
  "amount": 1000000,
  "description": "Pago de servicio de agua"
}

**EJEMPLOS REALES:**

Usuario: "pago agua 1 millón de pesos"
(Presupuesto NO tiene "Agua")
→ {
  "transaction_type": "expense",
  "category": "expense",
  "expense_type": "fixed",
  "is_essential": true,
  "suggested_category_name": "Servicios",
  "suggested_subcategory_name": "Agua",
  "amount": 1000000,
  "description": "Pago de servicio de agua"
}

Usuario: "pagué luz 150 mil"
(Presupuesto NO tiene "Luz")
→ {
  "transaction_type": "expense",
  "category": "expense",
  "expense_type": "fixed",
  "is_essential": true,
  "suggested_category_name": "Servicios",
  "suggested_subcategory_name": "Electricidad",
  "amount": 150000,
  "description": "Pago de servicio de luz"
}

Usuario: "compré en el supermercado 200 mil"
(Presupuesto tiene "Mercado")
→ {
  "transaction_type": "expense",
  "category": "expense",
  "expense_type": "variable",
  "is_essential": true,
  "suggested_category_name": "Gastos Variables",
  "suggested_subcategory_name": "Mercado",
  "amount": 200000,
  "description": "Compra en supermercado"
}

**IMPORTANTE:**
- Usa categorías del presupuesto si existen
- Si NO existen, usa categorías ESTÁNDAR lógicas y comunes
- Para servicios (agua, luz, gas), SIEMPRE usa categoría "Servicios"
- Para GASTOS, SIEMPRE incluye expense_type e is_essential
- Responde SOLO con JSON, sin markdown

**RESPONDE SOLO CON EL JSON:**`;

    console.log('🤖 Analizando transacción con GPT-4o-mini...');

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: analysisPrompt
        },
        {
          role: 'user',
          content: 'Analiza la transacción y devuelve el JSON estructurado.'
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content || '{}';
    console.log('📊 Respuesta del análisis de transacción:', responseContent);

    const parsedData = JSON.parse(responseContent);

    // Validar datos completos (permitir amount: -1 para indicar monto faltante)
    if (!parsedData.transaction_type || !parsedData.category || parsedData.amount === undefined) {
      throw new Error('Datos de transacción incompletos');
    }

    return {
      success: true,
      data: {
        transaction_type: parsedData.transaction_type,
        category: parsedData.category,
        suggested_category_name: parsedData.suggested_category_name || parsedData.subcategory || '',
        suggested_subcategory_name: parsedData.suggested_subcategory_name || parsedData.subcategory || '',
        expense_type: parsedData.expense_type || null,      // 🆕 Tipo de gasto (fixed/variable)
        is_essential: parsedData.is_essential ?? null,      // 🆕 Esencial o no
        amount: parsedData.amount,
        description: parsedData.description,
        date: parsedData.date
      }
    };

  } catch (error) {
    console.error('❌ Error analizando transacción:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

export default openai;

