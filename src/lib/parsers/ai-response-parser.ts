// Parser para respuestas estructuradas de la IA

export interface AIUpdateDetection {
  hasUpdate: boolean;
  field?: string;
  previousValue?: string;
  newValue?: string;
  explanation?: string;
  rawResponse: string;
}

export function parseAIResponse(response: string): {
  hasUpdate: boolean;
  field?: string;
  oldValue?: string;
  newValue?: string;
  explanation?: string;
  rawResponse: string;
} {
  const cleanResponse = response.trim();
  
  // Buscar el patrón de actualización
  const updateMatch = cleanResponse.match(/ACTUALIZACIÓN DETECTADA:\s*\n\s*Campo:\s*([^\n]+)\s*\n\s*Valor_anterior:\s*([^\n]+)\s*\n\s*Valor_nuevo:\s*([^\n]+)\s*\n\s*Explicación:\s*([^\n]+(?:\n(?!Campo:|Valor_|ACTUALIZACIÓN)[^\n]*)*)/i);
  
  if (updateMatch) {
    return {
      hasUpdate: true,
      field: updateMatch[1].trim(),
      oldValue: updateMatch[2].trim(),
      newValue: updateMatch[3].trim(),
      explanation: updateMatch[4].trim().replace(/\n\s*/g, ' '), // Limpiar saltos de línea extras
      rawResponse: response
    };
  }
  
  return {
    hasUpdate: false,
    rawResponse: response
  };
}

// Mapeo de campos de la IA a campos de base de datos
export const FIELD_MAPPING: Record<string, string> = {
  'full_name': 'full_name',
  'age': 'age', 
  'civil_status': 'civil_status',
  'children_count': 'children_count',
  'monthly_income': 'monthly_income',
  'monthly_expenses': 'monthly_expenses', 
  'total_assets': 'total_assets',
  'total_liabilities': 'total_liabilities',
  'total_savings': 'total_savings'
};

// Función para convertir valores de texto a tipos apropiados
export function convertValueToType(field: string, value: string): string | number | null {
  if (!value || value === 'No especificado' || value === 'No especificada') {
    return null;
  }
  
  switch (field) {
    case 'age':
    case 'children_count':
      const numMatch = value.match(/\d+/);
      return numMatch ? parseInt(numMatch[0]) : null;
      
    case 'monthly_income':
    case 'monthly_expenses':
    case 'total_assets':
    case 'total_liabilities':
    case 'total_savings':
      // Extraer números de montos monetarios
      const cleanValue = value.replace(/[^\d]/g, '');
      return cleanValue ? parseFloat(cleanValue) : null;
      
    case 'civil_status':
      const statusMap: Record<string, string> = {
        'soltero': 'soltero',
        'soltera': 'soltero',
        'casado': 'casado',
        'casada': 'casado',
        'union libre': 'union_libre',
        'unión libre': 'union_libre',
        'divorciado': 'divorciado',
        'divorciada': 'divorciado',
        'viudo': 'viudo',
        'viuda': 'viudo'
      };
      return statusMap[value.toLowerCase()] || value;
      
    case 'full_name':
    default:
      return value;
  }
}

// Función para validar que el campo existe
export function isValidField(field: string): boolean {
  return field in FIELD_MAPPING;
}

// Función principal para procesar la respuesta de la IA
export function processAIUpdate(aiResponse: string): {
  success: boolean;
  updateData?: Record<string, any>;
  explanation?: string;
  error?: string;
} {
  const parsed = parseAIResponse(aiResponse);
  
  if (!parsed.hasUpdate) {
    return {
      success: false,
      error: 'No se detectó actualización en la respuesta'
    };
  }
  
  if (!parsed.field || !isValidField(parsed.field)) {
    return {
      success: false,
      error: `Campo no válido: ${parsed.field}`
    };
  }
  
  if (!parsed.newValue) {
    return {
      success: false,
      error: 'No se encontró valor nuevo'
    };
  }
  
  const dbField = FIELD_MAPPING[parsed.field];
  const convertedValue = convertValueToType(parsed.field, parsed.newValue);
  
  return {
    success: true,
    updateData: {
      [dbField]: convertedValue
    },
    explanation: parsed.explanation
  };
} 