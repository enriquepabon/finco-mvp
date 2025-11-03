/**
 * Parser de transacciones por voz usando Google Gemini
 * Extrae información de texto en español colombiano
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VoiceTransactionParsed } from '@/types/transaction';

interface Category {
  id: string;
  name: string;
  category_type: 'income' | 'fixed_expense' | 'variable_expense';
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

export async function parseVoiceTransaction(
  text: string,
  existingCategories: Category[]
): Promise<VoiceTransactionParsed> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const categoriesContext = existingCategories.map(c => ({
    id: c.id,
    name: c.name,
    type: c.category_type
  }));

  const prompt = `Eres un asistente financiero en Colombia. Analiza esta transacción en español:

"${text}"

Categorías existentes del usuario:
${JSON.stringify(categoriesContext, null, 2)}

TAREAS:
1. Identifica si es un INGRESO o un GASTO
2. Extrae el MONTO en pesos colombianos (COP)
   - "50 mil" = 50000
   - "2 millones" = 2000000
   - "100k" = 100000
3. Crea una DESCRIPCIÓN clara y concisa
4. CATEGORIZACIÓN:
   - Si encuentras una categoría existente que coincida (por nombre o contexto), usa su ID
   - Si NO encuentras coincidencia, sugiere un nombre para una NUEVA categoría
   - Para nuevas categorías, determina el tipo: "income", "fixed_expense" o "variable_expense"

REGLAS IMPORTANTES:
- Compras de comida rápida (McDonald's, Subway, etc.) = "variable_expense"
- Servicios recurrentes (Netflix, Spotify, etc.) = "fixed_expense"
- Salarios, bonos, ventas = "income"
- Da un puntaje de confianza (0-100) sobre tu análisis

Responde SOLO con este JSON (sin markdown, sin explicaciones):
{
  "description": "descripción clara",
  "amount": número,
  "transaction_type": "income" o "expense",
  "suggested_category_id": "id de categoría existente" o null,
  "suggested_category_name": "nombre de categoría existente" o null,
  "new_category_name": "nombre para nueva categoría" o null,
  "new_category_type": "income", "fixed_expense" o "variable_expense",
  "confidence": número entre 0 y 100
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text();

    console.log('🤖 Gemini raw response:', textResponse);

    // Limpiar markdown si viene envuelto
    let cleanText = textResponse.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(cleanText) as VoiceTransactionParsed;

    console.log('✅ Parsed transaction:', parsed);

    // Validaciones básicas
    if (!parsed.description || !parsed.amount || !parsed.transaction_type) {
      throw new Error('Respuesta de IA incompleta');
    }

    if (parsed.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    if (!['income', 'expense'].includes(parsed.transaction_type)) {
      throw new Error('Tipo de transacción inválido');
    }

    return parsed;
  } catch (error) {
    console.error('❌ Error parsing voice transaction:', error);
    
    // Fallback: intento manual de extraer monto
    const manualParse = manualParseTransaction(text);
    if (manualParse) {
      return manualParse;
    }

    throw new Error('No se pudo procesar la transacción. Intenta de nuevo con más detalles.');
  }
}

/**
 * Parser manual de respaldo si Gemini falla
 */
function manualParseTransaction(text: string): VoiceTransactionParsed | null {
  try {
    // Detectar montos comunes en español
    const patterns = [
      { regex: /(\d+)\s*mil(?:es)?\s*(?:pesos)?/i, multiplier: 1000 },
      { regex: /(\d+)\s*mill[oó]n(?:es)?\s*(?:pesos)?/i, multiplier: 1000000 },
      { regex: /(\d+)k/i, multiplier: 1000 },
      { regex: /\$?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i, multiplier: 1 },
    ];

    let amount = 0;
    for (const { regex, multiplier } of patterns) {
      const match = text.match(regex);
      if (match) {
        amount = parseFloat(match[1].replace(/\./g, '')) * multiplier;
        break;
      }
    }

    if (amount === 0) return null;

    // Detectar tipo (palabras clave)
    const isIncome = /ingreso|salario|pago|venta|bono|cobro/i.test(text);
    const transaction_type = isIncome ? 'income' : 'expense';

    return {
      description: text.substring(0, 100),
      amount,
      transaction_type,
      confidence: 50, // Baja confianza para parser manual
      new_category_name: transaction_type === 'income' ? 'Otros ingresos' : 'Gastos varios',
      new_category_type: transaction_type === 'income' ? 'income' : 'variable_expense'
    };
  } catch {
    return null;
  }
}

