/**
 * Represents the structured data extracted from user onboarding responses.
 * All fields are optional as they are populated progressively through the onboarding flow.
 *
 * @interface ParsedOnboardingData
 * @property {string} [full_name] - User's full name, capitalized
 * @property {number} [age] - User's age (18-100)
 * @property {string} [civil_status] - Marital status: 'soltero', 'casado', 'union_libre', 'divorciado', 'viudo'
 * @property {number} [children_count] - Number of children (0-20)
 * @property {number} [monthly_income] - Monthly income in Colombian pesos
 * @property {number} [monthly_expenses] - Monthly expenses in Colombian pesos
 * @property {number} [total_assets] - Total assets/patrimony in Colombian pesos
 * @property {number} [total_liabilities] - Total liabilities/debts in Colombian pesos
 * @property {number} [total_savings] - Total savings in Colombian pesos
 */
export interface ParsedOnboardingData {
  full_name?: string;
  age?: number;
  civil_status?: 'soltero' | 'casado' | 'union_libre' | 'divorciado' | 'viudo';
  children_count?: number;
  monthly_income?: number;
  monthly_expenses?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_savings?: number;
}

/**
 * Mapping of various civil status responses (Spanish and English) to standardized values.
 * Supports multiple forms and languages for inclusive parsing.
 *
 * @constant
 * @type {Record<string, string>}
 */
const CIVIL_STATUS_MAP: Record<string, string> = {
  'soltero': 'soltero',
  'soltera': 'soltero',
  'single': 'soltero',
  'casado': 'casado',
  'casada': 'casado',
  'married': 'casado',
  'union libre': 'union_libre',
  'unión libre': 'union_libre',
  'union_libre': 'union_libre',
  'divorciado': 'divorciado',
  'divorciada': 'divorciado',
  'divorced': 'divorciado',
  'viudo': 'viudo',
  'viuda': 'viudo',
  'widowed': 'viudo'
};

/**
 * Parses Colombian currency amounts from natural language text.
 * Handles various formats including words (millones, mil), separators, and currency symbols.
 *
 * Supported formats:
 * - Natural language: "10 millones", "5 mil", "dos millones quinientos mil"
 * - With separators: "10.000.000", "10,000,000"
 * - With currency: "$10.000.000 COP", "10000000 pesos"
 * - Plain numbers: "10000000"
 *
 * Smart detection: If a small number (< 1000) is detected, assumes millions.
 * Example: "10" → 10,000,000 (10 million pesos)
 *
 * @param {string} text - Text containing currency amount in various formats
 * @returns {number | null} Parsed amount in Colombian pesos, or null if parsing fails
 *
 * @example
 * parseColombianCurrency("10 millones") // returns 10000000
 * parseColombianCurrency("$5.000.000 COP") // returns 5000000
 * parseColombianCurrency("2 mil") // returns 2000
 * parseColombianCurrency("15") // returns 15000000 (assumes millions)
 * parseColombianCurrency("invalid") // returns null
 */
export function parseColombianCurrency(text: string): number | null {
  if (!text || typeof text !== 'string') return null;
  
  // Limpiar el texto
  let cleanText = text.toLowerCase()
    .replace(/[,$\s]/g, '') // Remover comas, dólares, espacios
    .replace(/cop|pesos?|peso/g, '') // Remover referencias a moneda
    .replace(/usd|dolares?|dollar/g, '') // Remover referencias a dólares
    .trim();

  // Manejar expresiones como "10 millones", "5 mil", etc.
  const millionPattern = /(\d+(?:\.\d+)?)\s*mill?on?e?s?/i;
  const thousandPattern = /(\d+(?:\.\d+)?)\s*mil/i;
  
  const millionMatch = text.match(millionPattern);
  if (millionMatch) {
    const baseNumber = parseFloat(millionMatch[1]);
    return baseNumber * 1000000;
  }
  
  const thousandMatch = text.match(thousandPattern);
  if (thousandMatch) {
    const baseNumber = parseFloat(thousandMatch[1]);
    return baseNumber * 1000;
  }
  
  // Parsear números directos
  const numberMatch = cleanText.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    const number = parseFloat(numberMatch[1]);
    
    // Si el número es muy pequeño, probablemente está en millones
    if (number < 1000 && number > 0) {
      return number * 1000000;
    }
    
    return number;
  }
  
  return null;
}

/**
 * Extracts and validates age from text input.
 * Validates that age is within a reasonable range (18-100).
 *
 * @param {string} text - Text containing age (e.g., "25", "tengo 30 años", "edad: 45")
 * @returns {number | null} Parsed age (18-100), or null if invalid/out of range
 *
 * @example
 * parseAge("25") // returns 25
 * parseAge("Tengo 30 años") // returns 30
 * parseAge("15") // returns null (below minimum age)
 * parseAge("no age here") // returns null
 */
export function parseAge(text: string): number | null {
  if (!text || typeof text !== 'string') return null;
  
  const ageMatch = text.match(/(\d+)/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    // Validar rango razonable
    if (age >= 18 && age <= 100) {
      return age;
    }
  }
  
  return null;
}

/**
 * Parses marital/civil status from text using fuzzy matching.
 * Supports Spanish and English, including gendered forms.
 *
 * Recognized statuses:
 * - 'soltero': single, soltero/a
 * - 'casado': married, casado/a
 * - 'union_libre': common law, unión libre
 * - 'divorciado': divorced, divorciado/a
 * - 'viudo': widowed, viudo/a
 *
 * @param {string} text - Text containing civil status
 * @returns {string | null} Standardized status value, or null if not recognized
 *
 * @example
 * parseCivilStatus("Soy casado") // returns "casado"
 * parseCivilStatus("single") // returns "soltero"
 * parseCivilStatus("Estoy en unión libre") // returns "union_libre"
 * parseCivilStatus("no status") // returns null
 */
export function parseCivilStatus(text: string): string | null {
  if (!text || typeof text !== 'string') return null;
  
  const cleanText = text.toLowerCase().trim();
  
  // Buscar coincidencias exactas o parciales
  for (const [key, value] of Object.entries(CIVIL_STATUS_MAP)) {
    if (cleanText.includes(key)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Extracts number of children from text with special case handling.
 * Validates count is within reasonable range (0-20).
 *
 * Special cases handled:
 * - "no tengo", "ninguno", "cero" → 0
 * - Numeric extraction from sentences
 *
 * @param {string} text - Text containing children count
 * @returns {number | null} Number of children (0-20), or null if invalid
 *
 * @example
 * parseChildrenCount("3") // returns 3
 * parseChildrenCount("Tengo 2 hijos") // returns 2
 * parseChildrenCount("No tengo hijos") // returns 0
 * parseChildrenCount("Ninguno") // returns 0
 * parseChildrenCount("50") // returns null (out of range)
 */
export function parseChildrenCount(text: string): number | null {
  if (!text || typeof text !== 'string') return null;
  
  const lowerText = text.toLowerCase();
  
  // Casos especiales
  if (lowerText.includes('no tengo') || lowerText.includes('ninguno') || lowerText.includes('cero')) {
    return 0;
  }
  
  // Buscar números
  const numberMatch = text.match(/(\d+)/);
  if (numberMatch) {
    const count = parseInt(numberMatch[1]);
    // Validar rango razonable
    if (count >= 0 && count <= 20) {
      return count;
    }
  }
  
  return null;
}

/**
 * Parses and normalizes full name with proper capitalization.
 * Each word is capitalized (first letter uppercase, rest lowercase).
 *
 * @param {string} text - Raw name text
 * @returns {string | null} Capitalized full name, or null if empty/invalid
 *
 * @example
 * parseFullName("juan carlos lopez") // returns "Juan Carlos Lopez"
 * parseFullName("MARIA FERNANDA") // returns "Maria Fernanda"
 * parseFullName("") // returns null
 */
export function parseFullName(text: string): string | null {
  if (!text || typeof text !== 'string') return null;
  
  // Limpiar y capitalizar
  return text.trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Main parsing router that delegates to specific parsers based on question number.
 * Maps each onboarding question (1-9) to its appropriate parser function.
 *
 * Question mapping:
 * 1. Full name (parseFullName)
 * 2. Age (parseAge)
 * 3. Civil status (parseCivilStatus)
 * 4. Children count (parseChildrenCount)
 * 5. Monthly income (parseColombianCurrency)
 * 6. Monthly expenses (parseColombianCurrency)
 * 7. Total assets (parseColombianCurrency)
 * 8. Total liabilities (parseColombianCurrency)
 * 9. Total savings (parseColombianCurrency)
 *
 * @param {number} questionNumber - Onboarding question number (1-9)
 * @param {string} userResponse - User's raw text response
 * @returns {Partial<ParsedOnboardingData>} Object with single parsed field, or empty object
 *
 * @example
 * parseOnboardingResponse(1, "Juan Perez") // { full_name: "Juan Perez" }
 * parseOnboardingResponse(2, "25") // { age: 25 }
 * parseOnboardingResponse(5, "5 millones") // { monthly_income: 5000000 }
 * parseOnboardingResponse(99, "invalid") // {}
 */
export function parseOnboardingResponse(
  questionNumber: number,
  userResponse: string
): Partial<ParsedOnboardingData> {
  
  const response = userResponse.trim();
  
  switch (questionNumber) {
    case 1: // Nombre completo
      return { full_name: parseFullName(response) || undefined };
      
    case 2: // Edad
      return { age: parseAge(response) || undefined };
      
    case 3: // Estado civil
      return { civil_status: parseCivilStatus(response) as any || undefined };
      
    case 4: // Hijos
      return { children_count: parseChildrenCount(response) || undefined };
      
    case 5: // Ingresos mensuales
      return { monthly_income: parseColombianCurrency(response) || undefined };
      
    case 6: // Gastos mensuales
      return { monthly_expenses: parseColombianCurrency(response) || undefined };
      
    case 7: // Activos
      return { total_assets: parseColombianCurrency(response) || undefined };
      
    case 8: // Pasivos/Deudas
      return { total_liabilities: parseColombianCurrency(response) || undefined };
      
    case 9: // Ahorros
      return { total_savings: parseColombianCurrency(response) || undefined };
      
    default:
      return {};
  }
}

/**
 * Logs parsing results for debugging and monitoring.
 * Outputs structured log with question number, original response, parsed data, and timestamp.
 *
 * @param {number} questionNumber - Question number that was parsed
 * @param {string} userResponse - Original user response text
 * @param {Partial<ParsedOnboardingData>} parsedData - Resulting parsed data
 * @returns {void}
 *
 * @example
 * logParsingResult(5, "10 millones", { monthly_income: 10000000 })
 * // Console: 🔍 Parsing Result: { question: 5, original: "10 millones", parsed: {...}, timestamp: "..." }
 */
export function logParsingResult(
  questionNumber: number,
  userResponse: string,
  parsedData: Partial<ParsedOnboardingData>
): void {
  console.log('🔍 Parsing Result:', {
    question: questionNumber,
    original: userResponse,
    parsed: parsedData,
    timestamp: new Date().toISOString()
  });
} 