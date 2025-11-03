#!/usr/bin/env node

/**
 * 🔍 Script para verificar variables de entorno de FINCO
 */

require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 Verificando Variables de Entorno de FINCO...\n');

const requiredVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'GOOGLE_GEMINI_API_KEY': process.env.GOOGLE_GEMINI_API_KEY
};

let allValid = true;

Object.entries(requiredVars).forEach(([key, value]) => {
  const exists = !!value && value !== 'tu_' + key.toLowerCase().replace(/next_public_|supabase_|google_|_key|_url/g, '');
  const status = exists ? '✅' : '❌';
  const preview = exists ? (value.substring(0, 20) + '...') : 'FALTA CONFIGURAR';
  
  console.log(`${status} ${key}: ${preview}`);
  
  if (!exists) {
    allValid = false;
  }
});

console.log('\n' + '='.repeat(60));

if (allValid) {
  console.log('✅ Todas las variables de entorno están configuradas correctamente\n');
  process.exit(0);
} else {
  console.log('❌ Faltan variables de entorno por configurar');
  console.log('\n📝 Instrucciones:');
  console.log('1. Crea el archivo .env.local en la raíz del proyecto');
  console.log('2. Agrega las variables faltantes siguiendo el formato:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_real');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_real');
  console.log('   GOOGLE_GEMINI_API_KEY=tu_gemini_api_key_real\n');
  process.exit(1);
}

