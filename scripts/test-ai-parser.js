// Test del nuevo parser de respuestas de IA
console.log('🧪 Testing AI Response Parser...\n');

// Simulación del parser
function testParseAIResponse(aiResponse) {
  const response = aiResponse.trim();
  
  // Buscar el patrón "ACTUALIZACIÓN DETECTADA:"
  const updatePattern = /ACTUALIZACIÓN DETECTADA:\s*\n?\s*Campo:\s*([^\n]+)\s*\n?\s*Valor_anterior:\s*([^\n]+)\s*\n?\s*Valor_nuevo:\s*([^\n]+)\s*\n?\s*Explicación:\s*([^\n]+)/i;
  
  const match = response.match(updatePattern);
  
  if (match) {
    return {
      hasUpdate: true,
      field: match[1]?.trim(),
      previousValue: match[2]?.trim(),
      newValue: match[3]?.trim(), 
      explanation: match[4]?.trim(),
      rawResponse: response
    };
  }
  
  return {
    hasUpdate: false,
    rawResponse: response
  };
}

const testCases = [
  // Caso 1: Respuesta estructurada correcta
  `ACTUALIZACIÓN DETECTADA:
Campo: total_assets
Valor_anterior: $300.000.000 COP
Valor_nuevo: $400.000.000 COP
Explicación: He actualizado tus activos sumando la casa de 100 millones a tus activos actuales.`,

  // Caso 2: Otra respuesta estructurada
  `ACTUALIZACIÓN DETECTADA:
Campo: age
Valor_anterior: 35 años
Valor_nuevo: 40 años
Explicación: Tu edad ha sido actualizada a 40 años como solicitaste.`,

  // Caso 3: Sin actualización
  `No pude identificar qué campo actualizar. ¿Podrías ser más específico? Por ejemplo: 'Mis activos son 15 millones' o 'Mi edad es 40 años'`,

  // Caso 4: Respuesta con formato incorrecto
  `He actualizado tus activos pero no seguí el formato correcto.`
];

testCases.forEach((testCase, index) => {
  console.log(`--- Test ${index + 1} ---`);
  console.log(`Input: "${testCase.substring(0, 80)}..."`);
  
  const result = testParseAIResponse(testCase);
  
  console.log(`Has Update: ${result.hasUpdate ? '✅' : '❌'}`);
  if (result.hasUpdate) {
    console.log(`Field: ${result.field}`);
    console.log(`Previous: ${result.previousValue}`);
    console.log(`New Value: ${result.newValue}`);
    console.log(`Explanation: ${result.explanation}`);
  }
  console.log('');
});

console.log('✅ AI Parser Test Complete!'); 