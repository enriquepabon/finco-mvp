#!/usr/bin/env node

/**
 * 🔍 Script para verificar si la URL de Supabase es real o placeholder
 */

require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 VERIFICACIÓN DE URL DE SUPABASE\n');
console.log('='.repeat(70));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

console.log('\n📋 URL Actual en .env.local:');
console.log(`   ${supabaseUrl}\n`);

// Verificar si es placeholder
const isPlaceholder = 
  !supabaseUrl || 
  supabaseUrl.includes('tu-proyecto') || 
  supabaseUrl.includes('tu_') ||
  supabaseUrl.includes('your-project') ||
  supabaseUrl.includes('example');

if (isPlaceholder) {
  console.log('❌ ATENCIÓN: Esta parece ser una URL de EJEMPLO\n');
  console.log('🔧 SOLUCIÓN:\n');
  console.log('1. Ve a: https://app.supabase.com/');
  console.log('2. Selecciona tu proyecto (o crea uno nuevo)');
  console.log('3. Ve a: Settings → API');
  console.log('4. Copia la "Project URL"');
  console.log('   Ejemplo: https://abcdefghijk.supabase.co');
  console.log('5. Reemplázala en tu archivo .env.local');
  console.log('\n📝 También necesitarás copiar:');
  console.log('   - Project API keys → anon public');
  console.log('   - Project API keys → service_role (mantenla secreta)');
  console.log('\n');
} else {
  console.log('✅ La URL parece ser válida\n');
  
  // Extraer el ID del proyecto
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (match) {
    const projectId = match[1];
    console.log(`📦 ID del Proyecto: ${projectId}`);
    console.log(`\n🔗 URLs importantes:\n`);
    console.log(`   Dashboard: https://app.supabase.com/project/${projectId}`);
    console.log(`   Callback OAuth: ${supabaseUrl}/auth/v1/callback`);
    console.log('\n✅ Usa esta URL de callback en Google Cloud Console');
  }
  
  console.log('\n🎯 SIGUIENTE PASO: Configurar OAuth en Google Cloud Console');
  console.log('   Ejecuta: cat SOLUCION_RAPIDA_OAUTH.md\n');
}

console.log('='.repeat(70) + '\n');

