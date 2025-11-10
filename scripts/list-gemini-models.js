/**
 * Script para listar todos los modelos disponibles en tu cuenta de Gemini
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function listAvailableModels() {
  console.log('🔍 Listando modelos disponibles en tu cuenta de Gemini...\n');

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ERROR: GOOGLE_GEMINI_API_KEY no está configurada');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Intentar listar modelos
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Modelos disponibles:\n');
    
    if (data.models && data.models.length > 0) {
      data.models.forEach((model) => {
        console.log(`📦 ${model.name}`);
        console.log(`   Display Name: ${model.displayName}`);
        console.log(`   Description: ${model.description || 'N/A'}`);
        
        if (model.supportedGenerationMethods) {
          console.log(`   Métodos: ${model.supportedGenerationMethods.join(', ')}`);
        }
        console.log('');
      });

      console.log('\n💡 Usa el nombre del modelo SIN el prefijo "models/"');
      console.log('   Por ejemplo: si ves "models/gemini-pro", usa solo "gemini-pro"');
      
    } else {
      console.log('⚠️ No se encontraron modelos disponibles');
      console.log('   Verifica que tu API Key tenga acceso a la API de Gemini');
    }

  } catch (error) {
    console.error('❌ Error listando modelos:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Regenera tu API Key en: https://aistudio.google.com/app/apikey');
    console.log('2. Asegúrate de que tu cuenta tenga acceso a Gemini API');
    console.log('3. Verifica que no haya restricciones de región');
  }
}

listAvailableModels().catch(console.error);

