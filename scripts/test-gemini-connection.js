/**
 * Script de diagnóstico para verificar la conexión con Gemini API
 * 
 * Uso: node scripts/test-gemini-connection.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testGeminiConnection() {
  console.log('🔍 Iniciando diagnóstico de Gemini API...\n');

  // Verificar API Key
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ERROR: GOOGLE_GEMINI_API_KEY no está configurada en .env.local');
    process.exit(1);
  }

  console.log('✅ API Key encontrada');
  console.log(`   Primeros caracteres: ${apiKey.substring(0, 10)}...`);
  console.log(`   Longitud: ${apiKey.length} caracteres\n`);

  // Inicializar cliente
  const genAI = new GoogleGenerativeAI(apiKey);

  // Probar diferentes modelos
  const modelsToTest = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.0-pro'
  ];

  console.log('🧪 Probando modelos disponibles...\n');

  for (const modelName of modelsToTest) {
    try {
      console.log(`📝 Probando: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Responde solo: OK');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName}: FUNCIONA`);
      console.log(`   Respuesta: ${text.substring(0, 50)}\n`);
      
    } catch (error) {
      console.log(`❌ ${modelName}: ERROR`);
      console.log(`   ${error.message}\n`);
    }
  }

  console.log('\n📊 Diagnóstico completado');
  console.log('\n💡 Recomendaciones:');
  console.log('1. Si todos fallan, verifica que tu API Key sea válida en: https://makersuite.google.com/app/apikey');
  console.log('2. Si algunos funcionan, actualiza el código para usar ese modelo');
  console.log('3. Si ninguno funciona, regenera tu API Key');
}

testGeminiConnection().catch(console.error);

