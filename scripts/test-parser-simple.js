// Test simple para el parser de edición de perfil
console.log('🧪 Testing Profile Edit Parser...\n');

// Simulación básica del parser
function testParseMessage(message) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Patrón para estado civil
  const civilStatusPatterns = [
    /(?:estado civil|situación)\s+(?:es|ahora es|cambiar a|actualizar a)\s+(soltero|casado|union libre|divorciado|viudo)/i,
    /(?:soy|estoy|ahora soy)\s+(soltero|casado|en union libre|divorciado|viudo)/i,
    /(?:cambiar|actualizar|modificar)\s+(?:mi )?estado civil\s+(?:a|por)\s+(soltero|casado|union libre|divorciado|viudo)/i,
    /(?:actualiza|actualizar|cambiar|modificar)\s+(?:mi )?estado civil\s+(?:a|por|es|ahora es)\s+(soltero|casado|union libre|divorciado|viudo)/i,
    /(?:mi )?estado civil\s+(?:es|ahora es|cambiar a|actualizar a)\s+(soltero|casado|union libre|divorciado|viudo)/i
  ];
  
  for (const pattern of civilStatusPatterns) {
    const match = lowerMessage.match(pattern);
    if (match && match[1]) {
      return {
        field: 'civil_status',
        value: match[1],
        confidence: 'high',
        matched: true
      };
    }
  }
  
  return {
    field: 'none',
    value: undefined,
    confidence: 'low',
    matched: false
  };
}

const testCases = [
  'actualiza mi estado civil a casado',
  'cambiar mi estado civil a soltero',
  'mi estado civil es divorciado',
  'estoy casado',
  'soy soltero',
  'actualizar estado civil por union libre'
];

testCases.forEach((testCase, index) => {
  console.log(`--- Test ${index + 1} ---`);
  console.log(`Input: "${testCase}"`);
  
  const result = testParseMessage(testCase);
  console.log(`Field: ${result.field}`);
  console.log(`Value: ${result.value || 'none'}`);
  console.log(`Confidence: ${result.confidence}`);
  console.log(`Matched: ${result.matched ? '✅' : '❌'}`);
  console.log('');
});

console.log('✅ Test Complete!'); 