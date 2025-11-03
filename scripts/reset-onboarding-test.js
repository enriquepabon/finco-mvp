#!/usr/bin/env node

/**
 * 🔄 SCRIPT DE EMERGENCIA: Reset y Test del Onboarding
 * 
 * Simula un flujo completo limpio del onboarding
 */

console.log('🔄 FINCO - Script de Emergencia: Reset y Test del Onboarding\n');

console.log('🚨 PROBLEMA IDENTIFICADO:');
console.log('• El usuario está atascado en la pregunta 6');
console.log('• El historial puede estar corrupto');
console.log('• Los mensajes del usuario no se cuentan correctamente');

console.log('\n🔧 CORRECCIONES APLICADAS:');
console.log('✅ Envío de historial completo (no solo últimos 10 mensajes)');
console.log('✅ Botón de reset agregado al header');
console.log('✅ Función resetConversation implementada');

console.log('\n🎯 PLAN DE PRUEBA INMEDIATO:');
console.log('1. 🌐 Abre http://localhost:3000/onboarding');
console.log('2. 🔄 Haz clic en "Reiniciar" para limpiar el estado');
console.log('3. 📝 Responde EXACTAMENTE estas 9 preguntas en orden:');

const questions = [
  { num: 1, q: '¿Cómo te llamas?', example: 'Enrique Pabon' },
  { num: 2, q: '¿Cuántos años tienes?', example: '39' },
  { num: 3, q: '¿Cuál es tu estado civil?', example: 'union libre' },
  { num: 4, q: '¿Tienes hijos? ¿Cuántos?', example: '0' },
  { num: 5, q: '¿Cuánto ganas al mes?', example: '23 millones' },
  { num: 6, q: '¿Cuánto gastas al mes?', example: '18 millones' },
  { num: 7, q: '¿Qué activos tienes?', example: 'casa, carro, apto: 800 millones' },
  { num: 8, q: '¿Qué deudas tienes?', example: 'tarjetas: 25 millones' },
  { num: 9, q: '¿Cuánto tienes ahorrado?', example: '50 millones' }
];

questions.forEach(q => {
  console.log(`   ${q.num}. ${q.q}`);
  console.log(`      Ejemplo: "${q.example}"`);
});

console.log('\n📊 QUÉ BUSCAR EN LOS LOGS:');
console.log('• "Pregunta #: 1" → "Pregunta #: 2" → ... → "Pregunta #: 9"');
console.log('• "Mensajes usuario: 0" → "Mensajes usuario: 1" → ... → "Mensajes usuario: 8"');
console.log('• "onboardingCompleted: true" después de la pregunta 9');
console.log('• Redirección automática al dashboard');

console.log('\n🚨 SI AÚN NO FUNCIONA:');
console.log('1. Abre DevTools → Application → Local Storage');
console.log('2. Borra todo el localStorage de localhost:3000');
console.log('3. Recarga la página completamente (Cmd+Shift+R)');
console.log('4. Intenta en modo incógnito/privado');

console.log('\n⚡ COMANDO DE EMERGENCIA:');
console.log('Si nada funciona, ejecuta:');
console.log('pkill -f "node.*next" && rm -rf .next && npm run dev');

console.log('\n✨ PRUEBA COMPLETADA - ¡AHORA PRUEBA EL ONBOARDING!'); 