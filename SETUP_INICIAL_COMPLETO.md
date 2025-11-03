# 🚀 SETUP INICIAL COMPLETO - FINCO

## 📋 Checklist de Configuración

Este es el orden correcto para configurar FINCO desde cero:

---

## ✅ **PASO 1: Crear Proyecto en Supabase** (5 min)

### 1.1 Crear Cuenta y Proyecto
1. Ve a: https://app.supabase.com/
2. **Sign Up** o **Sign In** con GitHub/Google
3. Clic en **New Project**
4. Llena el formulario:
   - **Name:** `finco-app`
   - **Database Password:** (Crea una segura y guárdala)
   - **Region:** Selecciona la más cercana (ej: South America (São Paulo))
   - **Pricing Plan:** Free
5. Clic en **Create new project**
6. Espera 1-2 minutos mientras se aprovisiona

### 1.2 Obtener Credenciales
1. Una vez creado, ve a: **Settings** (⚙️) → **API**
2. Copia y guarda estos valores:

   📋 **Project URL:**
   ```
   https://xxxxxxxxxxx.supabase.co
   ```
   (Reemplaza xxxxxxxxxxx con tu ID real)

   📋 **anon public (Project API keys):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   (Cadena larga que empieza con eyJ)

   📋 **service_role secret (Project API keys):**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   (Otra cadena larga, NUNCA la compartas)

---

## ✅ **PASO 2: Configurar Variables de Entorno** (2 min)

### 2.1 Actualizar .env.local
1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza con tus valores REALES:

```bash
# 🏦 FINCO - Variables de Entorno

# ===== SUPABASE =====
# Pega aquí tu Project URL real
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co

# Pega aquí tu anon public key real
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Pega aquí tu service_role secret key real
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===== GOOGLE GEMINI AI =====
# Obtén tu key en: https://makersuite.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=AIzaSy...
```

### 2.2 Verificar Configuración
```bash
node scripts/check-env.js
```

Deberías ver todos ✅

---

## ✅ **PASO 3: Crear Tablas en Supabase** (3 min)

### 3.1 Ejecutar SQL Script
1. Ve a Supabase Dashboard
2. Menú lateral: **SQL Editor**
3. Clic en **New query**
4. Copia todo el contenido del archivo: `sql/create_user_profiles_table.sql`
5. Pégalo en el editor
6. Clic en **RUN** (▶️)
7. Deberías ver: "Success. No rows returned"

### 3.2 Verificar Tablas Creadas
1. Menú lateral: **Table Editor**
2. Deberías ver la tabla: `user_profiles`
3. Clic en ella para verificar las columnas

---

## ✅ **PASO 4: Configurar Google Gemini AI** (2 min)

### 4.1 Obtener API Key
1. Ve a: https://makersuite.google.com/app/apikey
2. (O) https://aistudio.google.com/app/apikey
3. Clic en **Create API Key**
4. Selecciona un proyecto de Google Cloud (o crea uno nuevo)
5. Copia la API Key

### 4.2 Agregar a .env.local
```bash
GOOGLE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## ✅ **PASO 5: Configurar OAuth con Google** (10 min)

### 5.1 Google Cloud Console

1. **Crear Proyecto:**
   - Ve a: https://console.cloud.google.com/
   - Clic en el selector de proyectos (arriba izquierda)
   - **NEW PROJECT**
   - Name: `FINCO-App`
   - **CREATE**

2. **Configurar OAuth Consent Screen:**
   - Ve a: **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - **CREATE**
   - App name: `FINCO`
   - User support email: tu email
   - Developer contact: tu email
   - **SAVE AND CONTINUE**
   - Scopes: **SAVE AND CONTINUE** (sin cambios)
   - Test users: **+ ADD USERS** → agrega tu email de Google
   - **SAVE AND CONTINUE**

3. **Crear OAuth Client ID:**
   - Ve a: **APIs & Services** → **Credentials**
   - **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `FINCO Local Dev`
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   ```
   
   **Authorized redirect URIs** (agregar AMBAS):
   ```
   http://localhost:3000/auth/callback
   https://xxxxxxxxxxx.supabase.co/auth/v1/callback
   ```
   ⚠️ Reemplaza `xxxxxxxxxxx` con tu ID real de Supabase
   
   - **CREATE**
   - **COPIA** el Client ID y Client Secret

### 5.2 Supabase Dashboard

1. **Habilitar Google Provider:**
   - Ve a: **Authentication** → **Providers**
   - Busca **Google**
   - Activa el **toggle** (debe ponerse verde)
   - Pega tu **Client ID** de Google
   - Pega tu **Client Secret** de Google
   - **Save**

2. **Configurar URLs:**
   - Ve a: **Authentication** → **URL Configuration**
   - **Site URL:** `http://localhost:3000`
   - **Redirect URLs:**
     ```
     http://localhost:3000/auth/callback
     http://localhost:3000/**
     ```
   - **Save**

---

## ✅ **PASO 6: Probar la Aplicación** (2 min)

### 6.1 Reiniciar Servidor
```bash
# Si el servidor está corriendo, detenerlo con Ctrl+C
npm run dev
```

### 6.2 Verificar Diagnóstico
```bash
node scripts/diagnose-oauth.js
```

Todos deberían estar en ✅

### 6.3 Probar Login
1. Abre: http://localhost:3000/auth/login
2. Clic en **"Iniciar sesión con Google"**
3. Selecciona tu cuenta de Google
4. Acepta permisos
5. Deberías ser redirigido al dashboard o onboarding

---

## 📊 **Verificación Final**

### ✅ **Checklist Completo:**

**Supabase:**
- [ ] Proyecto creado
- [ ] Credenciales copiadas al .env.local
- [ ] Tablas creadas con SQL script
- [ ] Google Provider habilitado
- [ ] URLs configuradas

**Google Cloud Console:**
- [ ] Proyecto creado
- [ ] OAuth consent screen configurado
- [ ] Test users agregados
- [ ] OAuth Client ID creado
- [ ] JavaScript origins configurado
- [ ] Redirect URIs configuradas (ambas)

**Variables de Entorno:**
- [ ] NEXT_PUBLIC_SUPABASE_URL (URL real)
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY (key real)
- [ ] SUPABASE_SERVICE_ROLE_KEY (key real)
- [ ] GOOGLE_GEMINI_API_KEY (key real)

**Aplicación:**
- [ ] Servidor corriendo sin errores
- [ ] Login con Google funciona
- [ ] Redirige correctamente después del login

---

## 🐛 **Troubleshooting Rápido**

### "Invalid Supabase credentials"
→ Verifica que copiaste bien las keys del dashboard de Supabase

### "redirect_uri_mismatch"
→ Verifica que las URLs en Google Cloud Console sean exactas

### "access_denied"
→ Agrega tu email en Test users (Google Cloud Console)

### No pasa nada al hacer clic en "Login con Google"
→ Verifica que el Google Provider esté activado en Supabase

---

## 🎉 **¡Listo!**

Una vez completados todos los pasos, FINCO estará completamente funcional:

- ✅ Autenticación con Google
- ✅ Base de datos configurada
- ✅ IA conversacional lista
- ✅ Dashboard funcional

**Siguiente paso:** Prueba el flujo completo:
1. Login con Google
2. Onboarding con FINCO (chat conversacional)
3. Dashboard con tus datos financieros

---

## 📞 **¿Necesitas ayuda?**

Si tienes problemas en algún paso:

```bash
# Verificar variables de entorno
node scripts/check-env.js

# Diagnosticar OAuth
node scripts/diagnose-oauth.js

# Ver logs del servidor
# (Revisa la terminal donde corre npm run dev)
```

**Documentación adicional:**
- `SOLUCION_RAPIDA_OAUTH.md` - Setup rápido de OAuth
- `CONFIGURACION_OAUTH_GOOGLE.md` - Guía detallada de OAuth
- `README.md` - Documentación general del proyecto

