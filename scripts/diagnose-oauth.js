#!/usr/bin/env node

/**
 * 🔍 Script de Diagnóstico OAuth para FINCO
 * 
 * Este script verifica la configuración de OAuth con Google
 * y ayuda a identificar problemas comunes.
 */

require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 DIAGNÓSTICO DE OAUTH GOOGLE - FINCO\n');
console.log('='.repeat(70));

// Verificar variables de entorno
console.log('\n📋 1. VERIFICANDO VARIABLES DE ENTORNO...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let allOk = true;

if (supabaseUrl && supabaseUrl !== 'tu_supabase_url_aqui') {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL está configurada');
  console.log(`   ${supabaseUrl}`);
  
  // Extraer el ID del proyecto
  const projectIdMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (projectIdMatch) {
    const projectId = projectIdMatch[1];
    console.log(`   📦 ID del Proyecto: ${projectId}`);
  }
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL no está configurada correctamente');
  allOk = false;
}

if (supabaseKey && supabaseKey !== 'tu_supabase_anon_key_aqui') {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY está configurada');
  console.log(`   ${supabaseKey.substring(0, 30)}...`);
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada correctamente');
  allOk = false;
}

// Calcular URLs necesarias
console.log('\n📍 2. URLS DE REDIRECCIÓN NECESARIAS...\n');

const localCallbackUrl = 'http://localhost:3000/auth/callback';
console.log('📌 URL de Callback Local:');
console.log(`   ${localCallbackUrl}`);

if (supabaseUrl) {
  const supabaseCallbackUrl = `${supabaseUrl}/auth/v1/callback`;
  console.log('\n📌 URL de Callback de Supabase (para Google Cloud Console):');
  console.log(`   ${supabaseCallbackUrl}`);
}

// Instrucciones para Google Cloud Console
console.log('\n⚙️  3. CONFIGURACIÓN EN GOOGLE CLOUD CONSOLE...\n');
console.log('Ve a: https://console.cloud.google.com/apis/credentials');
console.log('\n📝 Authorized JavaScript origins:');
console.log('   http://localhost:3000');
console.log('\n📝 Authorized redirect URIs:');
console.log('   http://localhost:3000/auth/callback');
if (supabaseUrl) {
  console.log(`   ${supabaseUrl}/auth/v1/callback`);
}

// Instrucciones para Supabase
console.log('\n⚙️  4. CONFIGURACIÓN EN SUPABASE DASHBOARD...\n');
console.log('Ve a: https://app.supabase.com/');
console.log('Luego: Authentication → Providers → Google\n');
console.log('✅ Activa el toggle de Google');
console.log('✅ Pega tu Client ID de Google Cloud Console');
console.log('✅ Pega tu Client Secret de Google Cloud Console');
console.log('✅ Guarda los cambios');

console.log('\nLuego: Authentication → URL Configuration\n');
console.log('📝 Site URL:');
console.log('   http://localhost:3000');
console.log('\n📝 Redirect URLs:');
console.log('   http://localhost:3000/auth/callback');
console.log('   http://localhost:3000/**');

// Verificar conectividad con Supabase
console.log('\n🌐 5. VERIFICANDO CONECTIVIDAD CON SUPABASE...\n');

if (supabaseUrl && supabaseKey) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) {
        console.log('⚠️  No hay sesión activa (esto es normal si no has iniciado sesión)');
        console.log(`   ${error.message}`);
      } else {
        console.log('✅ Conexión con Supabase exitosa');
        if (data.session) {
          console.log('✅ Hay una sesión activa');
        } else {
          console.log('ℹ️  No hay sesión activa (normal si no has iniciado sesión)');
        }
      }
      
      finishDiagnosis();
    })
    .catch((err) => {
      console.log('❌ Error al conectar con Supabase:');
      console.log(`   ${err.message}`);
      allOk = false;
      finishDiagnosis();
    });
} else {
  console.log('❌ No se pueden verificar las credenciales de Supabase');
  allOk = false;
  finishDiagnosis();
}

function finishDiagnosis() {
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RESUMEN DEL DIAGNÓSTICO\n');
  
  if (allOk) {
    console.log('✅ Configuración de variables de entorno: OK');
    console.log('✅ URLs calculadas correctamente');
    console.log('\n🎯 PRÓXIMOS PASOS:');
    console.log('   1. Configura OAuth en Google Cloud Console con las URLs mostradas');
    console.log('   2. Habilita Google Provider en Supabase con tus credenciales');
    console.log('   3. Configura las Redirect URLs en Supabase');
    console.log('   4. Reinicia el servidor: npm run dev');
    console.log('   5. Prueba el login en: http://localhost:3000/auth/login');
  } else {
    console.log('❌ Hay problemas con la configuración');
    console.log('\n🛠️  SOLUCIONES:');
    console.log('   1. Verifica que el archivo .env.local existe');
    console.log('   2. Asegúrate de que las variables no tengan valores de ejemplo');
    console.log('   3. Copia las credenciales reales de Supabase Dashboard');
    console.log('   4. Reinicia el servidor después de cambiar el .env.local');
  }
  
  console.log('\n📖 Para más detalles, consulta:');
  console.log('   CONFIGURACION_OAUTH_GOOGLE.md');
  console.log('\n');
}

