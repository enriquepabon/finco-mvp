# ⚡ SOLUCIÓN RÁPIDA - OAuth Google no funciona

## 🎯 El Problema

Al hacer clic en "Iniciar sesión con Google", no pasa nada o aparece un error.

## ✅ La Solución (3 pasos simples)

---

### **PASO 1: Supabase - Habilitar Google OAuth** ⏱️ 2 minutos

1. Ve a **[Supabase Dashboard](https://app.supabase.com/)**
2. Abre tu proyecto de FINCO
3. En el menú lateral: **Authentication** → **Providers**
4. Busca **Google** en la lista
5. Activa el **toggle** (debe ponerse verde)

**📝 IMPORTANTE:** Necesitarás un **Client ID** y **Client Secret** de Google (lo haremos en el Paso 2).

Por ahora, deja esta pestaña abierta.

---

### **PASO 2: Google Cloud Console - Crear Credenciales** ⏱️ 5 minutos

#### 2.1 Crear Proyecto (si no tienes uno)
1. Ve a **[Google Cloud Console](https://console.cloud.google.com/)**
2. Clic en el menú de proyectos (arriba izquierda)
3. **NEW PROJECT**
4. Nombre: `FINCO-App`
5. Clic en **CREATE**

#### 2.2 Configurar OAuth Consent Screen
1. Ve a **APIs & Services** → **OAuth consent screen**
2. Selecciona **External**
3. Clic en **CREATE**
4. Llena el formulario:
   - **App name:** FINCO
   - **User support email:** tu email
   - **Developer contact:** tu email
5. Clic en **SAVE AND CONTINUE**
6. En Scopes, clic en **SAVE AND CONTINUE** (sin agregar nada)
7. En Test users:
   - Clic en **+ ADD USERS**
   - Agrega tu email de Google
   - Clic en **ADD**
8. Clic en **SAVE AND CONTINUE**

#### 2.3 Crear OAuth Client ID
1. Ve a **APIs & Services** → **Credentials**
2. Clic en **+ CREATE CREDENTIALS**
3. Selecciona **OAuth client ID**
4. Application type: **Web application**
5. Name: `FINCO Local Dev`

6. **Authorized JavaScript origins:**
   - Clic en **+ ADD URI**
   - Pega: `http://localhost:3000`

7. **Authorized redirect URIs:**
   - Clic en **+ ADD URI**
   - Pega: `http://localhost:3000/auth/callback`
   - Clic en **+ ADD URI** otra vez
   - Pega: `https://[TU-PROYECTO-ID].supabase.co/auth/v1/callback`
   
   ⚠️ **IMPORTANTE:** Reemplaza `[TU-PROYECTO-ID]` con tu ID real.
   
   **¿Cómo encontrar tu ID?**
   - Ve a tu Supabase Dashboard
   - La URL es algo como: `https://app.supabase.com/project/abcd1234`
   - Tu ID de proyecto es `abcd1234`
   - La URL completa sería: `https://abcd1234.supabase.co/auth/v1/callback`

8. Clic en **CREATE**

9. **¡COPIA LAS CREDENCIALES!** Verás un popup con:
   - **Client ID**: `123456-abc.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-abc123...`
   
   📋 Cópialos en un lugar seguro (los necesitas ahora).

---

### **PASO 3: Supabase - Configurar Credenciales** ⏱️ 2 minutos

#### 3.1 Agregar Client ID y Secret
1. Vuelve a tu **Supabase Dashboard**
2. **Authentication** → **Providers** → **Google**
3. Pega el **Client ID** de Google
4. Pega el **Client Secret** de Google
5. Clic en **Save**

#### 3.2 Configurar URLs de Redirección
1. Ve a **Authentication** → **URL Configuration**
2. **Site URL:**
   - Cambia a: `http://localhost:3000`
   - Clic en **Save**

3. **Redirect URLs:**
   - Verifica que aparezca: `http://localhost:3000/**`
   - Si no está, agrégala manualmente
   - Clic en **Save**

---

## 🧪 PASO 4: Probar

1. **Reinicia el servidor de desarrollo:**
   ```bash
   # En la terminal donde corre FINCO
   # Presiona Ctrl+C para detener
   npm run dev
   ```

2. **Abre el navegador:**
   - Ve a: `http://localhost:3000/auth/login`
   - Clic en **"Iniciar sesión con Google"**

3. **Resultado esperado:**
   - ✅ Se abre popup/ventana de Google
   - ✅ Seleccionas tu cuenta
   - ✅ Aceptas permisos
   - ✅ Redirige de vuelta a FINCO
   - ✅ Entras al dashboard

---

## 🐛 Si Todavía No Funciona

### Error: "redirect_uri_mismatch"

**Causa:** Las URLs no coinciden exactamente.

**Solución:**
1. Ve a Google Cloud Console → Credentials
2. Edita tu OAuth Client ID
3. Verifica que las URIs sean EXACTAS (sin espacios, sin / al final):
   ```
   http://localhost:3000/auth/callback
   https://[TU-ID].supabase.co/auth/v1/callback
   ```
4. Guarda y **espera 2-3 minutos** para que se propague

### No pasa nada al hacer clic

**Solución:**
1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Busca errores en rojo
4. Si ves algo como "Invalid client_id":
   - Verifica que copiaste bien el Client ID en Supabase
   - Asegúrate de no tener espacios extras

### El popup se abre pero vuelve con error

**Solución:**
1. Revisa los logs del servidor (terminal)
2. Busca mensajes con 🔍 o ❌
3. Probablemente el **Client Secret** esté mal
4. Cópialo nuevamente de Google Cloud Console
5. Pégalo en Supabase → Save
6. Reinicia el servidor

---

## 📊 Checklist Final

Antes de probar, verifica:

**Google Cloud Console:**
- [x] OAuth consent screen configurado
- [x] Test users agregados (tu email)
- [x] OAuth Client ID creado
- [x] JavaScript origins: `http://localhost:3000`
- [x] Redirect URIs: las dos URLs correctas

**Supabase:**
- [x] Google Provider habilitado (toggle verde)
- [x] Client ID pegado
- [x] Client Secret pegado
- [x] Save clickeado
- [x] Site URL: `http://localhost:3000`
- [x] Redirect URLs configuradas

**Servidor:**
- [x] Reiniciado después de los cambios

---

## 🎉 ¡Listo!

Una vez configurado, el OAuth con Google funcionará perfectamente.

**Cualquier duda, ejecuta:**
```bash
node scripts/diagnose-oauth.js
```

Este script te mostrará exactamente qué URLs usar.

