// Tipos para los datos parseados del onboarding
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

// Mapeo de respuestas de estado civil a valores estándar
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
 * Parsea números de moneda colombiana de texto
 * Ejemplos: "10 millones", "10.000.000", "10,000,000", "$10.000.000 COP"
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
 * Parsea la edad de texto
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
 * Parsea el estado civil
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
 * Parsea la cantidad de hijos
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
 * Parsea el nombre completo
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
 * Función principal para parsear respuesta según el tipo de pregunta
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
 * Función para logging de parsing (para debugging)
 */
export function logParsingResult(
  questionNumber: number, 
  userResponse: string, 
  parsedData: Partial<ParsedOnboardingData>
) {
  console.log('🔍 Parsing Result:', {
    question: questionNumber,
    original: userResponse,
    parsed: parsedData,
    timestamp: new Date().toISOString()
  });
} 