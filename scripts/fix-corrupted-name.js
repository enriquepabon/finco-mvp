#!/usr/bin/env node

/**
 * 🔧 SCRIPT DE CORRECCIÓN: Nombre Corrupto en Base de Datos
 */

console.log('🔧 FINCO - Corrección de Nombre Corrupto\n');

console.log('🔍 PROBLEMA IDENTIFICADO:');
console.log('• El nombre en la base de datos está corrupto: "39 Años archivos Adjuntos: [voice: Archivo] 39 Años"');
console.log('• Esto causa que el chat de edición no funcione correctamente');
console.log('• Cuando dice "mis ingresos son 23 millones" detecta que quiere cambiar el nombre');

console.log('\n📊 DATOS CORRUPTOS ACTUALES:');
console.log('full_name: "39 Años\\n\\narchivos Adjuntos:\\n[voice: Archivo] 39 Años"');
console.log('children_count: 1 (debería ser 0)');
console.log('monthly_income: 1000000 (debería ser 23000000)');

console.log('\n✅ SOLUCIÓN PROPUESTA:');
console.log('1. 🔄 Limpiar el nombre corrupto → "Enrique Pabon"');
console.log('2. 🔄 Corregir children_count → 0');
console.log('3. 🔄 Corregir monthly_income → 23000000');
console.log('4. 🔄 Mejorar el prompt para detectar nombres corruptos');

console.log('\n🛠️ CORRECCIÓN MANUAL EN SUPABASE:');
console.log('1. 🌐 Ve a https://supabase.com → Tu proyecto → Table Editor');
console.log('2. 📋 Abre la tabla "user_profiles"');
console.log('3. 🔍 Busca el registro con user_id: "13bc08d6-280e-43f3-913b-62f19f86a491"');
console.log('4. ✏️ Edita los campos:');
console.log('   • full_name: "Enrique Pabon"');
console.log('   • children_count: 0');
console.log('   • monthly_income: 23000000');
console.log('5. 💾 Guarda los cambios');

console.log('\n🧪 PRUEBA DESPUÉS DE LA CORRECCIÓN:');
console.log('1. 🌐 Ve al dashboard');
console.log('2. 💬 Usa el chat para decir: "mis ingresos son 25 millones"');
console.log('3. ✅ Debería detectar correctamente que quieres actualizar monthly_income');

console.log('\n📊 RESPUESTA ESPERADA CORRECTA:');
console.log('ACTUALIZACIÓN DETECTADA:');
console.log('Campo: monthly_income');
console.log('Valor_anterior: 23000000');
console.log('Valor_nuevo: 25000000');
console.log('Explicación: ¡Entendido Enrique! Con gusto actualizo tus ingresos mensuales');

console.log('\n⚠️ PREVENCIÓN FUTURA:');
console.log('• El parser de onboarding ya fue corregido para evitar nombres corruptos');
console.log('• Los nuevos usuarios no tendrán este problema');

console.log('\n✨ ¡CORRIGE MANUALMENTE EN SUPABASE Y PRUEBA DE NUEVO!'); 