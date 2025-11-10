# 🐛 FIX CRÍTICO: Progreso Estancado en Onboarding

## 🚨 Problema Reportado

**Síntomas:**
- ✅ Auto-focus funciona correctamente
- ❌ **Progreso se queda en 11% durante toda la conversación**
- ❌ **Nunca redirige al dashboard después de 9 preguntas**
- ❌ Usuario responde todas las preguntas pero se queda en bucle

**Transcripción del problema:**
```
Usuario: kike p
MentorIA: ¡Gracias, Kike! ¿Cuántos años tienes?
Usuario: 39
... (9 preguntas completas)
MentorIA: [Resumen final + recomendaciones]
Usuario: Esta bien
Usuario: Ok
Usuario: Ok
❌ Nunca redirige al /dashboard
📊 Progreso: 11% (no cambia)
```

---

## 🔍 Diagnóstico

### Logs en Consola del Frontend
Con los logs agregados en el commit anterior, el usuario debería ver:

```javascript
📊 Respuesta de API: { 
  chatType: 'onboarding', 
  questionNumber: undefined,  // ❌ undefined en producción!
  onboardingCompleted: undefined,
  message: "¡Gracias, Kike! ¿Cuántos años tienes?"
}
📊 Actualizando progreso: { currentProgress: undefined, MAX_QUESTIONS: 9 }
```

**El problema:** `questionNumber` y `onboardingCompleted` son `undefined` porque el backend **NO los está retornando en producción**.

---

## 🐛 Causa Raíz

### Código del Backend (antes del fix)

```typescript:src/app/api/chat/route.ts
return NextResponse.json(
  {
    message: response.message,
    success: true,
    // ❌ PROBLEMA: Solo en desarrollo
    ...(env.NODE_ENV === 'development' && {
      debug: {
        questionNumber,
        profileExists: !!profile,
        userMessages,
        totalMessages: chatHistory.length,
        onboardingCompleted,
        analyzedWithAI: userMessages >= 8
      }
    })
  },
  {
    headers: rateLimitHeaders,
  }
);
```

**Explicación:**
1. El backend **SÍ calcula** `questionNumber` correctamente (línea 146):
   ```typescript
   const questionNumber = userMessages + 1;
   ```

2. Pero solo lo retorna si `env.NODE_ENV === 'development'`

3. En **producción** (Vercel):
   ```javascript
   {
     message: "...",
     success: true
     // ❌ Sin campo debug
   }
   ```

4. El frontend busca `responseData.debug.questionNumber`:
   ```typescript
   const currentProgress = chatType === 'onboarding' 
     ? responseData.debug.questionNumber  // ❌ undefined!
     : responseData.questionNumber;
   ```

5. Como `currentProgress` es `undefined`, nunca se actualiza:
   ```typescript
   setProgress(currentProgress); // ❌ setProgress(undefined)
   ```

6. La verificación de completado también falla:
   ```typescript
   const checkCompleted = chatType === 'onboarding' 
     ? (currentProgress >= MAX_QUESTIONS || responseData.debug?.onboardingCompleted === true)
     // ❌ undefined >= 9 = false
   ```

---

## ✅ Solución Implementada

### Código Corregido

```typescript:src/app/api/chat/route.ts
return NextResponse.json(
  {
    message: response.message,
    success: true,
    // ✅ SOLUCIÓN: Siempre retornar questionNumber y onboardingCompleted
    debug: {
      questionNumber,           // ✅ Necesario para progreso
      onboardingCompleted,      // ✅ Necesario para redirección
      // Info adicional solo en desarrollo
      ...(env.NODE_ENV === 'development' && {
        profileExists: !!profile,
        userMessages,
        totalMessages: chatHistory.length,
        analyzedWithAI: userMessages >= 8
      })
    }
  },
  {
    headers: rateLimitHeaders,
  }
);
```

**Cambios:**
1. ✅ El campo `debug` **siempre** se retorna (no solo en dev)
2. ✅ `questionNumber` y `onboardingCompleted` **siempre** están disponibles
3. ✅ Información sensible (`userMessages`, `analyzedWithAI`) solo en dev
4. ✅ Compatible con el frontend existente

---

## 📊 Respuesta de la API

### Antes (Producción)
```json
{
  "message": "¡Gracias, Kike! ¿Cuántos años tienes?",
  "success": true
}
```
❌ **Sin progreso disponible**

### Después (Producción)
```json
{
  "message": "¡Gracias, Kike! ¿Cuántos años tienes?",
  "success": true,
  "debug": {
    "questionNumber": 2,
    "onboardingCompleted": false
  }
}
```
✅ **Progreso disponible**

### Desarrollo (adicional)
```json
{
  "message": "¡Gracias, Kike! ¿Cuántos años tienes?",
  "success": true,
  "debug": {
    "questionNumber": 2,
    "onboardingCompleted": false,
    "profileExists": true,
    "userMessages": 1,
    "totalMessages": 3,
    "analyzedWithAI": false
  }
}
```
✅ **Info completa para debugging**

---

## 🧪 Flujo Corregido

### Pregunta 1-8
```javascript
// Backend
questionNumber = 1, 2, 3... 8
onboardingCompleted = false

// Frontend recibe
📊 Respuesta de API: { questionNumber: 2, onboardingCompleted: false }
📊 Actualizando progreso: { currentProgress: 2, MAX_QUESTIONS: 9 }
✅ Verificando completado: { checkCompleted: false, currentProgress: 2, MAX_QUESTIONS: 9 }

// UI actualiza
Progreso: 22% (2/9)
```

### Pregunta 9 (última)
```javascript
// Backend (después de analizar con IA)
questionNumber = 9
onboardingCompleted = true  // ✅ Guardado en DB

// Frontend recibe
📊 Respuesta de API: { questionNumber: 9, onboardingCompleted: true }
📊 Actualizando progreso: { currentProgress: 9, MAX_QUESTIONS: 9 }
✅ Verificando completado: { checkCompleted: true, currentProgress: 9, MAX_QUESTIONS: 9 }
🎉 Chat completado! Redirigiendo en 3 segundos...
🔄 Redirigiendo a dashboard principal

// UI actualiza
Progreso: 100% (9/9)
⏳ Espera 3 segundos
🚀 router.push('/dashboard')
```

---

## 🎯 Validación

### Checklist de Prueba

1. **Abre el onboarding:** https://onzaai.com/onboarding
2. **Abre la consola del navegador** (F12)
3. **Responde las 9 preguntas**
4. **Verifica en consola:**
   ```javascript
   📊 Respuesta de API: { questionNumber: 1, onboardingCompleted: false }
   📊 Actualizando progreso: { currentProgress: 1, MAX_QUESTIONS: 9 }
   // ...
   📊 Respuesta de API: { questionNumber: 9, onboardingCompleted: true }
   🎉 Chat completado! Redirigiendo en 3 segundos...
   🔄 Redirigiendo a dashboard principal
   ```

5. **Verifica en UI:**
   - ✅ Progreso empieza en **11%** (1/9)
   - ✅ Progreso aumenta: 22%, 33%, 44%... **100%**
   - ✅ Después de 3 segundos → redirige a `/dashboard`

---

## 📝 Notas Técnicas

### ¿Por qué usar `debug` para datos esenciales?

**Respuesta:** Es un nombre subóptimo que quedó de desarrollo. Idealmente debería ser:

```typescript
{
  message: "...",
  success: true,
  progress: {  // ✅ Mejor nombre
    questionNumber: 2,
    onboardingCompleted: false
  }
}
```

Pero cambiarlo ahora requeriría actualizar el frontend, así que mantuvimos `debug` por compatibilidad.

### ¿Es seguro exponer `questionNumber`?

**Sí.** No contiene información sensible:
- ✅ `questionNumber`: Solo indica el progreso (1-9)
- ✅ `onboardingCompleted`: Boolean para redirección
- ❌ `userMessages`, `analyzedWithAI`: Solo en desarrollo

### ¿Por qué `userMessages >= 8` en lugar de `>= 9`?

El análisis de IA se ejecuta **después** del 8vo mensaje del usuario (pregunta 9) porque:
```typescript
const userMessages = chatHistory.filter((msg) => msg.role === 'user').length;
const questionNumber = userMessages + 1;

// Usuario responde pregunta 9
userMessages = 8  // Ya respondió 8 preguntas
questionNumber = 9  // Está en la pregunta 9

// Se ejecuta análisis
if (userMessages >= 8) {
  // ✅ Analizar toda la conversación
  onboardingCompleted = true;
}
```

---

## 🚀 Resultado Esperado

**Antes del fix:**
- ❌ Progreso: 11% (estancado)
- ❌ Redirección: Nunca
- ❌ Usuario atrapado en bucle

**Después del fix:**
- ✅ Progreso: 11% → 22% → 33% → ... → 100%
- ✅ Redirección: Automática después de 3 segundos
- ✅ Usuario llega al dashboard

---

**Estado:** ✅ **DESPLEGADO EN PRODUCCIÓN**  
**Fecha:** 2025-11-10  
**Commit:** `671ee3e`

---

## 📚 Archivos Modificados

- `src/app/api/chat/route.ts` (líneas 280-300)

## 🔗 Commits Relacionados

1. `ab75f43` - Mejoras iniciales de UX (auto-focus + logs)
2. `671ee3e` - **FIX CRÍTICO: Retornar questionNumber en producción**

