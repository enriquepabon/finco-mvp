#!/usr/bin/env node

/**
 * 🔄 VERIFICACIÓN: Corrección del Progreso del Onboarding
 * 
 * Verifica que las correcciones estén aplicadas:
 * ✅ Lógica de progreso corregida (userMessages + 1)
 * ✅ Finalización correcta en pregunta 9
 * ✅ Debug info actualizada
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 FINCO - Verificación de Corrección del Progreso del Onboarding\n');

// Verificar API de chat
const chatApiPath = path.join(__dirname, '../src/app/api/chat/route.ts');
if (fs.existsSync(chatApiPath)) {
  const content = fs.readFileSync(chatApiPath, 'utf8');
  
  console.log('📋 VERIFICANDO CORRECCIONES EN /api/chat:');
  
  const hasCorrectProgression = content.includes('userMessages + 1') && content.includes('filter(msg => msg.role === \'user\')');
  console.log(`  ${hasCorrectProgression ? '✅' : '❌'} Lógica de progreso corregida (userMessages + 1)`);
  
  const hasCorrectCompletion = content.includes('userMessages >= 9');
  console.log(`  ${hasCorrectCompletion ? '✅' : '❌'} Finalización correcta en pregunta 9`);
  
  const hasDebugInfo = content.includes('userMessages') && content.includes('totalMessages');
  console.log(`  ${hasDebugInfo ? '✅' : '❌'} Debug info actualizada`);
  
  const hasCurrentAnswerLogic = content.includes('currentAnswerQuestion = userMessages');
  console.log(`  ${hasCurrentAnswerLogic ? '✅' : '❌'} Lógica de parsing de respuesta actual`);
  
} else {
  console.log('❌ /api/chat/route.ts no encontrado');
}

// Verificar parser de onboarding
const parserPath = path.join(__dirname, '../lib/parsers/onboarding-parser.ts');
if (fs.existsSync(parserPath)) {
  const content = fs.readFileSync(parserPath, 'utf8');
  
  console.log('\n📋 VERIFICANDO PARSER DE ONBOARDING:');
  
  const hasNineQuestions = content.includes('case 9:') && content.includes('total_savings');
  console.log(`  ${hasNineQuestions ? '✅' : '❌'} Parser maneja 9 preguntas correctamente`);
  
  const hasAllFields = content.includes('full_name') && content.includes('age') && 
                       content.includes('civil_status') && content.includes('children_count') &&
                       content.includes('monthly_income') && content.includes('monthly_expenses') &&
                       content.includes('total_assets') && content.includes('total_liabilities') &&
                       content.includes('total_savings');
  console.log(`  ${hasAllFields ? '✅' : '❌'} Todos los campos de las 9 preguntas definidos`);
  
} else {
  console.log('❌ Parser de onboarding no encontrado');
}

// Verificar cliente Gemini
const geminiPath = path.join(__dirname, '../lib/gemini/client.ts');
if (fs.existsSync(geminiPath)) {
  const content = fs.readFileSync(geminiPath, 'utf8');
  
  console.log('\n📋 VERIFICANDO PROMPT DE GEMINI:');
  
  const hasNineQuestionsPrompt = content.includes('EXACTAMENTE 9 PREGUNTAS') && content.includes('pregunta #9');
  console.log(`  ${hasNineQuestionsPrompt ? '✅' : '❌'} Prompt especifica exactamente 9 preguntas`);
  
  const hasOrderInstructions = content.includes('ORDEN ESTRICTO') && content.includes('NO te saltes preguntas');
  console.log(`  ${hasOrderInstructions ? '✅' : '❌'} Instrucciones de orden estricto`);
  
} else {
  console.log('❌ Cliente Gemini no encontrado');
}

console.log('\n🚀 INSTRUCCIONES PARA PROBAR:');
console.log('1. Reinicia el servidor: npm run dev');
console.log('2. Abre http://localhost:3000/onboarding');
console.log('3. Completa todas las 9 preguntas:');
console.log('   - Pregunta 1: Nombre completo');
console.log('   - Pregunta 2: Edad');
console.log('   - Pregunta 3: Estado civil');
console.log('   - Pregunta 4: Cantidad de hijos');
console.log('   - Pregunta 5: Ingresos mensuales');
console.log('   - Pregunta 6: Gastos mensuales');
console.log('   - Pregunta 7: Activos totales');
console.log('   - Pregunta 8: Pasivos/Deudas');
console.log('   - Pregunta 9: Ahorros actuales');
console.log('4. Verifica que después de la pregunta 9 se redireccione al dashboard');

console.log('\n📊 CÓMO VERIFICAR EN LOGS:');
console.log('• Busca "Pregunta #: X" en los logs del servidor');
console.log('• Verifica que avance de 1 a 9 progresivamente');
console.log('• Busca "onboardingCompleted: true" después de la pregunta 9');

console.log('\n✨ VERIFICACIÓN COMPLETADA'); 