// ============================================================================
// SCRIPT DE PRUEBA PARA API DE PRESUPUESTO - FINCO
// Ejecutar con: node scripts/test-budget-api.js
// ============================================================================

console.log('🧪 Testing Budget API...');

// Simular datos de prueba
const testData = {
  message: "Hola, estoy listo para crear mi presupuesto",
  questionNumber: 1,
  period: {
    month: 2,
    year: 2025
  }
};

console.log('📋 Test Data:', JSON.stringify(testData, null, 2));

// Test del parser
try {
  const { parseBudgetResponse } = require('../lib/parsers/budget-parser');
  
  console.log('\n🔍 Testing Parser...');
  const parseResult = parseBudgetResponse(1, testData.message);
  console.log('✅ Parser Result:', JSON.stringify(parseResult, null, 2));
  
} catch (error) {
  console.error('❌ Parser Error:', error.message);
  console.error('Stack:', error.stack);
}

// Test del cliente Gemini
try {
  console.log('\n🤖 Testing Gemini Client...');
  
  // Verificar variables de entorno
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    throw new Error('GOOGLE_GEMINI_API_KEY no está configurada');
  }
  
  console.log('✅ Gemini API Key found');
  
} catch (error) {
  console.error('❌ Gemini Client Error:', error.message);
}

// Test de variables de entorno
console.log('\n🔧 Environment Variables Check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
console.log('GOOGLE_GEMINI_API_KEY:', process.env.GOOGLE_GEMINI_API_KEY ? '✅ Set' : '❌ Missing');

console.log('\n�� Test completed!'); 