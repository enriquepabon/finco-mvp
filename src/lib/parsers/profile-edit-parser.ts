// Parser especializado para edición de perfil financiero
export interface ProfileEditResult {
  field?: string;
  value?: string | number | boolean;
  originalText: string;
  confidence: 'high' | 'medium' | 'low';
}

export function parseProfileEditMessage(message: string): ProfileEditResult {
  const lowerMessage = message.toLowerCase().trim();
  
  // Patrones para identificar qué campo se quiere actualizar
  const patterns = {
    // Información personal
    full_name: [
      /(?:nombre|llamar|llamo)\s+(?:es|soy|me llamo|ahora es|cambiar a|actualizar a)\s+([a-záéíóúñ\s]+)/i,
      /(?:mi nombre|nombre completo)\s+(?:es|ahora es|cambiar|actualizar)\s+([a-záéíóúñ\s]+)/i,
      /(?:cambiar|actualizar|modificar)\s+(?:mi )?nombre\s+(?:a|por)\s+([a-záéíóúñ\s]+)/i
    ],
    
    age: [
      /(?:edad|años?)\s+(?:es|son|ahora es|cambiar a|actualizar a)\s+(\d+)/i,
      /(?:tengo|cumplí|ahora tengo)\s+(\d+)\s+años?/i,
      /(?:cambiar|actualizar|modificar)\s+(?:mi )?edad\s+(?:a|por)\s+(\d+)/i,
      /(\d+)\s+años?\s+(?:de edad|ahora|actual)/i
    ],
    
    civil_status: [
      /(?:estado civil|situación)\s+(?:es|ahora es|cambiar a|actualizar a)\s+(soltero|casado|union libre|divorciado|viudo)/i,
      /(?:soy|estoy|ahora soy)\s+(soltero|casado|en union libre|divorciado|viudo)/i,
      /(?:cambiar|actualizar|modificar)\s+(?:mi )?estado civil\s+(?:a|por)\s+(soltero|casado|union libre|divorciado|viudo)/i,
      /(?:actualiza|actualizar|cambiar|modificar)\s+(?:mi )?estado civil\s+(?:a|por|es|ahora es)\s+(soltero|casado|union libre|divorciado|viudo)/i,
      /(?:mi )?estado civil\s+(?:es|ahora es|cambiar a|actualizar a)\s+(soltero|casado|union libre|divorciado|viudo)/i
    ],
    
    children_count: [
      /(?:hijos|niños)\s+(?:son|tengo|ahora tengo|cambiar a|actualizar a)\s+(\d+)/i,
      /(?:tengo|ahora tengo)\s+(\d+)\s+(?:hijos?|niños?)/i,
      /(?:cambiar|actualizar|modificar)\s+(?:mis )?hijos\s+(?:a|por)\s+(\d+)/i,
      /(\d+)\s+(?:hijos?|niños?)\s+(?:ahora|actual)/i
    ],
    
    // Información financiera
    monthly_income: [
      /(?:ingresos?|salario|sueldo|gano)\s+(?:son?|es|ahora es|cambiar a|actualizar a|por)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /(?:gano|recibo|ingreso)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)\s+(?:al mes|mensual|por mes)/i,
      /(?:cambiar|actualizar|modificar)\s+(?:mis )?ingresos?\s+(?:a|por)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)\s+(?:de ingresos?|mensual|al mes)/i
    ],
    
    monthly_expenses: [
      /(?:gastos?|gasto)\s+(?:son?|es|ahora es|cambiar a|actualizar a|por)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /(?:gasto|gasto mensual)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)\s+(?:al mes|mensual|por mes)/i,
      /(?:cambiar|actualizar|modificar)\s+(?:mis )?gastos?\s+(?:a|por)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)\s+(?:de gastos?|en gastos?)/i
    ],
    
    total_assets: [
      /(?:activos?|patrimonio|bienes)\s+(?:son?|es|ahora es|cambiar a|actualizar a)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /(?:tengo|poseo)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)\s+(?:en activos?|de patrimonio|en bienes)/i,
      /(?:cambiar|actualizar|modificar)\s+(?:mis )?activos?\s+(?:a|por)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /(?:nuevos activos|activos adicionales)\s+(?:por|de)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /(?:sumarle?|añadir|agregar)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)\s+(?:a|en)\s+(?:mis )?activos?/i,
      /(?:mis )?activos?\s+(?:son?|ahora son?|cambiar a|actualizar a)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /(?:quiero|necesito)\s+(?:actualizar|cambiar)\s+(?:mis )?activos?\s+(?:a|por)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /activos?\s+(?:por|de)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /(?:tengo|poseo)\s+(?:un|una)?\s*(?:nuevo|nueva)?\s*(?:activo|bien|propiedad|carro|casa|apartamento).*?(?:de|por|vale)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /(?:nuevo|nueva)\s+(?:activo|bien|propiedad|carro|casa|apartamento).*?(?:de|por|vale)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i
    ],
    
    total_liabilities: [
      /(?:deudas?|pasivos?|debe)\s+(?:son?|es|ahora es|cambiar a|actualizar a|por)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /(?:debo|tengo deudas por)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /(?:cambiar|actualizar|modificar)\s+(?:mis )?deudas?\s+(?:a|por)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)\s+(?:de deuda|en deudas?)/i
    ],
    
    total_savings: [
      /(?:ahorros?|ahorrado|tengo ahorrado)\s+(?:son?|es|ahora es|cambiar a|actualizar a|por)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /(?:tengo|ahorro)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)\s+(?:ahorrados?|de ahorros?)/i,
      /(?:cambiar|actualizar|modificar)\s+(?:mis )?ahorros?\s+(?:a|por)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
      /([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)\s+(?:ahorrados?|en ahorros?)/i
    ]
  };
  
  // Buscar coincidencias
  for (const [field, fieldPatterns] of Object.entries(patterns)) {
    for (const pattern of fieldPatterns) {
      const match = lowerMessage.match(pattern);
      if (match && match[1]) {
        let value: string | number | boolean = match[1].trim();
        let confidence: 'high' | 'medium' | 'low' = 'high';
        
        // Procesar según el tipo de campo
        if (field === 'age' || field === 'children_count') {
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            // Validaciones específicas
            if (field === 'age' && (numValue < 18 || numValue > 100)) {
              confidence = 'low';
            }
            if (field === 'children_count' && (numValue < 0 || numValue > 20)) {
              confidence = 'low';
            }
            value = numValue;
          } else {
            confidence = 'low';
          }
        } else if (field === 'civil_status') {
          // Normalizar estado civil
          const statusMap: Record<string, string> = {
            'soltero': 'soltero',
            'casado': 'casado',
            'union libre': 'union_libre',
            'en union libre': 'union_libre',
            'divorciado': 'divorciado',
            'viudo': 'viudo'
          };
          value = statusMap[value] || value;
        } else if (field === 'full_name') {
          // Limpiar y capitalizar nombre
          value = value.replace(/[^a-záéíóúñ\s]/gi, '').trim();
          value = value.split(' ').map((word: string) => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
          
          if (value.length < 2 || value.length > 50) {
            confidence = 'low';
          }
        } else {
          // Campos monetarios
          const monetaryValue = parseMonetaryValue(value);
          if (monetaryValue === null) {
            confidence = 'low';
          } else {
            value = monetaryValue;
          }
        }
        
        return {
          field,
          value,
          originalText: message,
          confidence
        };
      }
    }
  }
  
  // Si no se encontró coincidencia específica, intentar detectar intención general
  const generalPatterns = [
    /(?:actualizar|cambiar|modificar|editar)\s+(?:todo|todos?\s+mis\s+datos|mi\s+perfil)/i,
    /(?:quiero|necesito|puedo)\s+(?:actualizar|cambiar|modificar|editar)/i,
    /(?:revisar|repasar)\s+(?:mis\s+datos|mi\s+información|mi\s+perfil)/i
  ];
  
  for (const pattern of generalPatterns) {
    if (lowerMessage.match(pattern)) {
      return {
        field: 'general_update',
        value: true,
        originalText: message,
        confidence: 'medium'
      };
    }
  }
  
  return {
    originalText: message,
    confidence: 'low'
  };
}

function parseMonetaryValue(text: string): number | null {
  // Limpiar el texto
  let cleanText = text.toLowerCase()
    .replace(/[^\d.,\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Detectar unidades
  const originalText = text.toLowerCase();
  let multiplier = 1;
  
  if (originalText.includes('millones') || originalText.includes('mill') || originalText.includes(' m ') || originalText.endsWith(' m')) {
    multiplier = 1000000;
  } else if (originalText.includes('mil') || originalText.includes(' k ') || originalText.endsWith(' k')) {
    multiplier = 1000;
  }
  
  // Extraer número
  const numberMatch = cleanText.match(/(\d+(?:[.,]\d+)?)/);
  if (!numberMatch) return null;
  
  const numberStr = numberMatch[1].replace(',', '.');
  const number = parseFloat(numberStr);
  
  if (isNaN(number)) return null;
  
  return Math.round(number * multiplier);
}

export function logProfileEditResult(message: string, result: ProfileEditResult) {
  console.log('🔍 Profile Edit Parsing Result:', {
    original: message,
    field: result.field || 'none',
    value: result.value,
    confidence: result.confidence,
    timestamp: new Date().toISOString()
  });
} 