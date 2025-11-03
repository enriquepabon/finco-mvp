// Script para probar el parser de edición de perfil
const { parseProfileEditMessage, logProfileEditResult } = require('../lib/parsers/profile-edit-parser.ts');

console.log('🧪 Testing Profile Edit Parser...\n');

const testCases = [
  // Casos de información personal
  'Quiero actualizar mis ingresos a 25 millones',
  'Cambiar mi edad a 40 años',
  'Mi nombre ahora es Juan Carlos',
  'Estoy casado ahora',
  'Tengo 2 hijos',
  
  // Casos de información financiera
  'Mis gastos son 18 millones',
  'Tengo nuevos activos por 10 millones',
  'Debo 5 millones en tarjetas de crédito',
  'Ahorro 60 millones',
  
  // Casos con diferentes formatos
  'Ingresos 30 mill',
  'Gastos: 20m',
  'Activos 15.5 millones',
  'Deudas por 3 mil',
  
  // Casos generales
  'Quiero actualizar todo mi perfil',
  'Revisar mis datos',
  'Editar mi información',
  
  // Casos ambiguos
  'Hola, ¿cómo estás?',
  'Tengo dudas sobre mis finanzas',
  'No sé qué hacer',
];

testCases.forEach((testCase, index) => {
  console.log(`\n--- Test ${index + 1} ---`);
  console.log(`Input: "${testCase}"`);
  
  try {
    const result = parseProfileEditMessage(testCase);
    console.log(`Field: ${result.field || 'none'}`);
    console.log(`Value: ${result.value || 'none'}`);
    console.log(`Confidence: ${result.confidence}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
});

console.log('\n✅ Profile Edit Parser Test Complete!'); 