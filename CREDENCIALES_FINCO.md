# 🔐 CREDENCIALES Y CONFIGURACIÓN - FINCO

## ✅ Proyecto de Supabase Identificado

**Project ID:** `ejvazawcioksdynhmfbo`  
**Project URL:** `https://ejvazawcioksdynhmfbo.supabase.co`

---

## 📋 PASO 1: Actualizar .env.local

Abre tu archivo `.env.local` en la raíz del proyecto y actualízalo con:

```bash
# 🏦 FINCO - Variables de Entorno
# Configuración para desarrollo local

# ===== SUPABASE =====
NEXT_PUBLIC_SUPABASE_URL=https://ejvazawcioksdynhmfbo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdmF6YXdjaW9rc2R5bmhtZmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4ODUwNjcsImV4cCI6MjA2ODQ2MTA2N30.S2bZwYUiQyIBuNyT7f_SR4H5vboE8ESP_ntZ5YY0LgM
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY_AQUI

# ===== GOOGLE GEMINI AI =====
GOOGLE_GEMINI_API_KEY=tu_gemini_api_key_aqui
```

### 🔑 Obtener Service Role Key:
1. Ve a: https://app.supabase.com/project/ejvazawcioksdynhmfbo/settings/api
2. Busca la sección **Project API keys**
3. Copia el valor de **service_role** (es un JWT largo que empieza con `eyJ`)
4. Pégalo en el `.env.local`

⚠️ **IMPORTANTE:** Esta key es secreta, nunca la compartas ni la subas a GitHub.

---

## 📋 PASO 2: Crear Tablas en Supabase

1. Ve a: https://app.supabase.com/project/ejvazawcioksdynhmfbo/editor
2. Clic en **SQL Editor** en el menú lateral
3. Clic en **New query**
4. Copia y pega el contenido de: `sql/create_user_profiles_table.sql`
5. Clic en **RUN** (▶️)

Deberías ver: "Success. No rows returned"

---

## 📋 PASO 3: Configurar OAuth con Google

### 3.1 URLs para Google Cloud Console

Ve a: https://console.cloud.google.com/apis/credentials

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs** (agregar AMBAS):
```
http://localhost:3000/auth/callback
https://ejvazawcioksdynhmfbo.supabase.co/auth/v1/callback
```

### 3.2 Configurar en Supabase

1. Ve a: https://app.supabase.com/project/ejvazawcioksdynhmfbo/auth/providers
2. Busca **Google** en la lista
3. Activa el **toggle** (debe ponerse verde)
4. Pega tu **Client ID** de Google Cloud Console
5. Pega tu **Client Secret** de Google Cloud Console
6. Clic en **Save**

### 3.3 Configurar URLs en Supabase

1. Ve a: https://app.supabase.com/project/ejvazawcioksdynhmfbo/auth/url-configuration
2. **Site URL:** `http://localhost:3000`
3. **Redirect URLs:**
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/**`
4. Clic en **Save**

---

## 📋 PASO 4: Verificar Configuración

Una vez actualizado el `.env.local`:

```bash
# Verificar variables de entorno
node scripts/check-env.js

# Diagnosticar OAuth
node scripts/diagnose-oauth.js

# Reiniciar servidor
# Presiona Ctrl+C en la terminal del servidor
npm run dev
```

---

## 📋 PASO 5: Probar

1. Ve a: http://localhost:3000/auth/login
2. Clic en **"Iniciar sesión con Google"**
3. Selecciona tu cuenta
4. Acepta permisos
5. Deberías ser redirigido al dashboard o onboarding

---

## 🔗 Enlaces Rápidos de tu Proyecto

- **Dashboard:** https://app.supabase.com/project/ejvazawcioksdynhmfbo
- **Settings API:** https://app.supabase.com/project/ejvazawcioksdynhmfbo/settings/api
- **Auth Providers:** https://app.supabase.com/project/ejvazawcioksdynhmfbo/auth/providers
- **URL Config:** https://app.supabase.com/project/ejvazawcioksdynhmfbo/auth/url-configuration
- **SQL Editor:** https://app.supabase.com/project/ejvazawcioksdynhmfbo/sql/new
- **Table Editor:** https://app.supabase.com/project/ejvazawcioksdynhmfbo/editor

---

## ✅ Checklist de Configuración

- [ ] Actualizar `.env.local` con URL y Anon Key
- [ ] Obtener y agregar Service Role Key
- [ ] Crear tablas con SQL script
- [ ] Configurar OAuth en Google Cloud Console
- [ ] Habilitar Google Provider en Supabase
- [ ] Configurar URLs en Supabase
- [ ] Reiniciar servidor
- [ ] Probar login con Google

---

## 🐛 Troubleshooting

Si tienes problemas, ejecuta:

```bash
node scripts/diagnose-oauth.js
```

Este script te mostrará el estado actual de tu configuración.

---

**Fecha de creación:** $(date)  
**Proyecto:** FINCO MVP  
**Supabase Project:** ejvazawcioksdynhmfbo

