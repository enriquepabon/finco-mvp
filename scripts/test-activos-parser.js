// Test específico para activos parser
console.log('🧪 Testing Assets Parser - Casos específicos...\n');

// Simulación del parser para activos
function testParseAssets(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Patrones para activos
  const assetPatterns = [
    /(?:activos?|patrimonio|bienes)\s+(?:son?|es|ahora es|cambiar a|actualizar a)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
    /(?:tengo|poseo)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)\s+(?:en activos?|de patrimonio|en bienes)/i,
    /(?:cambiar|actualizar|modificar)\s+(?:mis )?activos?\s+(?:a|por)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
    /(?:nuevos activos|activos adicionales)\s+(?:por|de)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
    /(?:sumarle?|añadir|agregar)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)\s+(?:a|en)\s+(?:mis )?activos?/i,
    /(?:mis )?activos?\s+(?:son?|ahora son?|cambiar a|actualizar a)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
    /(?:quiero|necesito)\s+(?:actualizar|cambiar)\s+(?:mis )?activos?\s+(?:a|por)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i,
    /activos?\s+(?:por|de)\s+([0-9.,\s]*(?:millones?|mill?|m|k|mil)?\s*(?:pesos?|cop)?)/i
  ];
  
  for (const pattern of assetPatterns) {
    const match = lowerMessage.match(pattern);
    if (match && match[1]) {
      return {
        field: 'total_assets',
        value: match[1].trim(),
        confidence: 'high',
        matched: true
      };
    }
  }
  
  // Si contiene "activos" pero no matchea patrones específicos
  if (lowerMessage.includes('activos') || lowerMessage.includes('patrimonio')) {
    return {
      field: 'general_update',
      value: true,
      confidence: 'medium',
      matched: false
    };
  }
  
  return {
    field: 'none',
    value: undefined,
    confidence: 'low',
    matched: false
  };
}

const testCases = [
  'quiero actualizar mis activos, tengo un nuevo activo, carro de 100 millones',
  'sumarle 100 millones a mis activos actuales',
  'añadir 100 millones a mis activos',
  'mis activos ahora son 500 millones',
  'actualizar activos a 300 millones',
  'tengo 200 millones en activos',
  'cambiar mis activos por 150 millones',
  'activos por 100 millones',
  'nuevos activos de 50 millones'
];

testCases.forEach((testCase, index) => {
  console.log(`--- Test ${index + 1} ---`);
  console.log(`Input: "${testCase}"`);
  
  const result = testParseAssets(testCase);
  
  console.log(`Field: ${result.field}`);
  console.log(`Value: ${result.value}`);
  console.log(`Confidence: ${result.confidence}`);
  console.log(`Matched: ${result.matched ? '✅' : '❌'}`);
  console.log('');
});

console.log('✅ Assets Test Complete!'); 