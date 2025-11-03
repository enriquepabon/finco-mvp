# 🔐 Configuración de OAuth con Google - FINCO

## 🎯 Guía Completa para Configurar Google OAuth

### **Problema Común:**
Si al hacer clic en "Iniciar sesión con Google" no pasa nada o aparece un error, es porque falta configurar correctamente el OAuth en Supabase y Google Cloud Console.

---

## 📋 **PASO 1: Configurar Google Cloud Console**

### **1.1 Crear/Seleccionar Proyecto**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre sugerido: "FINCO-App"

### **1.2 Habilitar Google+ API**
1. Ve a: **APIs & Services → Library**
2. Busca: "Google+ API"
3. Clic en **Enable** (Habilitar)

### **1.3 Crear Credenciales OAuth 2.0**
1. Ve a: **APIs & Services → Credentials**
2. Clic en **+ CREATE CREDENTIALS**
3. Selecciona: **OAuth client ID**
4. Si es tu primera vez, configura la "OAuth consent screen":
   - User Type: **External**
   - App name: **FINCO**
   - User support email: tu email
   - Developer contact: tu email
   - Scopes: Solo los básicos (email, profile)
   - Test users: Agrega tu email de Google

### **1.4 Configurar OAuth Client ID**

**Application type:** Web application  
**Name:** FINCO Local Development

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/auth/callback
https://[TU-PROYECTO-ID].supabase.co/auth/v1/callback
```

⚠️ **MUY IMPORTANTE:** Reemplaza `[TU-PROYECTO-ID]` con tu ID real de Supabase.

**Ejemplo:**
```
https://abcdefghijk.supabase.co/auth/v1/callback
```

### **1.5 Copiar Credenciales**
Después de crear, verás:
- **Client ID**: algo como `123456789-abc.apps.googleusercontent.com`
- **Client Secret**: algo como `GOCSPX-abc123...`

**¡Guárdalos! Los necesitarás en el siguiente paso.**

---

## 🗄️ **PASO 2: Configurar Supabase**

### **2.1 Habilitar Google Provider**
1. Ve a tu [Supabase Dashboard](https://app.supabase.com/)
2. Selecciona tu proyecto
3. Ve a: **Authentication → Providers**
4. Busca **Google** y activa el toggle
5. Pega las credenciales:
   - **Client ID** (de Google Cloud Console)
   - **Client Secret** (de Google Cloud Console)
6. Clic en **Save**

### **2.2 Configurar URLs de Redirección**
1. Ve a: **Authentication → URL Configuration**
2. Configura:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:** (Agrega estas dos)
```
http://localhost:3000/auth/callback
http://localhost:3000/**
```

El comodín `**` permite cualquier ruta durante desarrollo.

3. Clic en **Save**

### **2.3 Obtener la URL de Callback de Supabase**
1. Ve a: **Settings → API**
2. Busca la sección **Config**
3. Copia tu **Project URL**: `https://[TU-PROYECTO-ID].supabase.co`
4. La URL de callback es: `https://[TU-PROYECTO-ID].supabase.co/auth/v1/callback`
5. **Asegúrate de haberla agregado en Google Cloud Console (Paso 1.4)**

---

## 🔍 **PASO 3: Verificar Configuración**

### **Checklist Final:**

#### ✅ **Google Cloud Console:**
- [ ] OAuth consent screen configurado
- [ ] Client ID creado
- [ ] JavaScript origins incluye `http://localhost:3000`
- [ ] Redirect URIs incluye:
  - [ ] `http://localhost:3000/auth/callback`
  - [ ] `https://[TU-PROYECTO].supabase.co/auth/v1/callback`

#### ✅ **Supabase:**
- [ ] Google Provider habilitado
- [ ] Client ID pegado correctamente
- [ ] Client Secret pegado correctamente
- [ ] Site URL: `http://localhost:3000`
- [ ] Redirect URLs configuradas

#### ✅ **Variables de Entorno (.env.local):**
- [ ] NEXT_PUBLIC_SUPABASE_URL con la URL correcta
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY con la key correcta
- [ ] SUPABASE_SERVICE_ROLE_KEY configurado
- [ ] GOOGLE_GEMINI_API_KEY configurado

---

## 🧪 **PASO 4: Probar la Configuración**

### **4.1 Reiniciar el Servidor**
```bash
# Detener el servidor actual (Ctrl+C si está corriendo)
npm run dev
```

### **4.2 Probar Login**
1. Ve a `http://localhost:3000/auth/login`
2. Clic en **"Iniciar sesión con Google"**
3. Deberías ver:
   - Popup o redirección a Google
   - Pantalla de selección de cuenta
   - Redirección de vuelta a FINCO
   - Dashboard o página de onboarding

### **4.3 Revisar Consola del Navegador**
Abre DevTools (F12) y ve a la pestaña **Console**.

**Logs esperados:**
```
🔍 Callback called with: { code: 'present', ... }
🔄 Attempting to exchange code for session...
✅ Session created successfully via code exchange
```

---

## 🐛 **Troubleshooting (Solución de Problemas)**

### **Error: "redirect_uri_mismatch"**
**Causa:** La URL de redirección no coincide.

**Solución:**
1. Ve a Google Cloud Console → Credentials
2. Verifica que las URIs sean EXACTAMENTE:
   ```
   http://localhost:3000/auth/callback
   https://[TU-PROYECTO].supabase.co/auth/v1/callback
   ```
3. Sin espacios, sin barras extras al final
4. Guarda cambios y espera 1-2 minutos para que se propague

### **Error: "access_denied"**
**Causa:** El usuario canceló el login o no está en los test users.

**Solución:**
1. Ve a Google Cloud Console → OAuth consent screen
2. Agrega tu email en **Test users**
3. Intenta de nuevo

### **Error: No pasa nada al hacer clic**
**Causa:** Variables de entorno incorrectas.

**Solución:**
```bash
# Verifica las variables
node scripts/check-env.js

# Revisa el archivo .env.local
cat .env.local
```

### **Error: "Invalid client_id"**
**Causa:** Client ID incorrecto en Supabase.

**Solución:**
1. Copia nuevamente el Client ID de Google Cloud Console
2. Pégalo en Supabase → Authentication → Providers → Google
3. Guarda y espera 1 minuto

### **Error en el Callback**
**Causa:** Problema al intercambiar el código por sesión.

**Solución:**
1. Revisa los logs del servidor (terminal donde corre `npm run dev`)
2. Busca mensajes con ❌
3. Verifica que el Client Secret en Supabase sea correcto

---

## 📱 **Para Producción (Vercel/Deploy)**

Cuando despliegues a producción, repite el proceso pero con:

**Google Cloud Console:**
```
Authorized JavaScript origins:
- https://tu-dominio.com

Authorized redirect URIs:
- https://tu-dominio.com/auth/callback
- https://[TU-PROYECTO].supabase.co/auth/v1/callback
```

**Supabase:**
```
Site URL:
- https://tu-dominio.com

Redirect URLs:
- https://tu-dominio.com/auth/callback
- https://tu-dominio.com/**
```

---

## 🎯 **Resumen Visual del Flujo**

```
Usuario                    FINCO                 Google              Supabase
  |                          |                      |                    |
  |-- Clic "Login Google" -->|                      |                    |
  |                          |-- Redirige -------->|                    |
  |                          |                      |                    |
  |<-------- Popup Google OAuth -------------------|                    |
  |-- Selecciona cuenta ---->|                      |                    |
  |                          |                      |-- Retorna code --> |
  |                          |<- /auth/callback?code=xxx --------------|
  |                          |                      |                    |
  |                          |-- Exchange code ---------------------------->|
  |                          |<- Session token ----------------------------|
  |                          |                      |                    |
  |<- Redirige a /dashboard -|                      |                    |
```

---

## 📞 **¿Todavía no funciona?**

Si después de seguir todos estos pasos aún tienes problemas:

1. **Revisa los logs del servidor:**
   ```bash
   # En la terminal donde corre npm run dev
   # Busca mensajes con 🔍 ❌ o ✅
   ```

2. **Revisa la consola del navegador:**
   - Abre DevTools (F12)
   - Ve a Console
   - Busca errores en rojo

3. **Verifica las variables de entorno:**
   ```bash
   node scripts/check-env.js
   ```

4. **Limpia la caché:**
   ```bash
   # Detén el servidor (Ctrl+C)
   rm -rf .next
   npm run dev
   ```

---

**✅ Una vez configurado correctamente, el OAuth con Google funcionará perfectamente en FINCO.**

