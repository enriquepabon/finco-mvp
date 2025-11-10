/**
 * Script para verificar configuración de OpenAI
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verificando configuración de OpenAI...\n');

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ ERROR: OPENAI_API_KEY no está configurada en .env.local\n');
  console.log('📝 Para configurarla:');
  console.log('1. Ve a: https://platform.openai.com/api-keys');
  console.log('2. Crea una nueva API Key');
  console.log('3. Agrégala a tu .env.local:\n');
  console.log('   OPENAI_API_KEY=sk-proj-tu-key-aqui\n');
  process.exit(1);
}

console.log('✅ OPENAI_API_KEY encontrada');
console.log(`   Primeros caracteres: ${apiKey.substring(0, 10)}...`);
console.log(`   Longitud: ${apiKey.length} caracteres`);

if (apiKey.startsWith('sk-proj-') || apiKey.startsWith('sk-')) {
  console.log('✅ Formato correcto\n');
} else {
  console.log('⚠️  La key no tiene el formato esperado (debería empezar con sk-)\n');
}

console.log('🧪 Probando conexión con OpenAI...\n');

const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey });

(async () => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Responde solo: OK' }],
      max_tokens: 10,
    });

    const response = completion.choices[0]?.message?.content;
    
    console.log('✅ Conexión exitosa con OpenAI');
    console.log(`   Respuesta: ${response}\n`);
    console.log('🎉 ¡Todo está configurado correctamente!\n');
    console.log('💡 Ya puedes usar la aplicación con OpenAI');
    
  } catch (error) {
    console.error('❌ Error conectando con OpenAI:', error.message);
    
    if (error.message.includes('Incorrect API key')) {
      console.log('\n🔧 Solución: Tu API Key es inválida');
      console.log('   1. Ve a: https://platform.openai.com/api-keys');
      console.log('   2. Genera una nueva key');
      console.log('   3. Actualiza .env.local\n');
    } else if (error.message.includes('insufficient_quota')) {
      console.log('\n💰 Solución: No tienes créditos en tu cuenta');
      console.log('   1. Ve a: https://platform.openai.com/account/billing');
      console.log('   2. Agrega un método de pago');
      console.log('   3. Compra $5-10 USD de créditos\n');
    } else {
      console.log('\n🔧 Error desconocido. Verifica:');
      console.log('   1. Tu conexión a internet');
      console.log('   2. Que tu cuenta de OpenAI esté activa');
      console.log('   3. Los logs completos arriba\n');
    }
  }
})();

