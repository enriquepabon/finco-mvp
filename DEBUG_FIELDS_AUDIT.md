# Auditoría de Campos de Debug en API Routes

**Fecha**: 4 de Noviembre, 2025
**Objetivo**: Identificar todos los campos que exponen información de debugging en producción

---

## 🔴 CRÍTICO - Endpoints y Campos que Exponen Debug Info

### 1. `/api/chat` - **2 debug objects**

**Archivo**: `src/app/api/chat/route.ts`

#### Debug Object #1 (Líneas 79-84) - Respuesta de Error
```typescript
debug: {
  questionNumber,
  onboardingCompleted: false,
  error: response.error || 'Error de IA'
}
```
**Expone**:
- ❌ Mensajes de error internos de la IA
- ⚠️ Número de pregunta del onboarding
- ⚠️ Estado del onboarding

#### Debug Object #2 (Líneas 123-130) - Respuesta Exitosa
```typescript
debug: {
  questionNumber,
  parsedData,              // 🔴 CRÍTICO: Datos parseados del usuario
  profileExists: !!profile,
  userMessages,
  totalMessages: chatHistory.length,
  onboardingCompleted: userMessages >= 9
}
```
**Expone**:
- 🔴 **DATOS SENSIBLES**: `parsedData` contiene información financiera del usuario
- ⚠️ Información sobre la estructura interna del chat
- ⚠️ Lógica de negocio (cuándo se completa onboarding)

---

### 2. `/api/debug-log` - **Endpoint completo de debug**

**Archivo**: `src/app/api/debug-log/route.ts`

🔴 **CRÍTICO**: Este endpoint completo es solo para debugging

**Expone**:
- Cualquier dato que el frontend envíe
- Logs arbitrarios en la consola del servidor

**Acción requerida**:
- ✅ Deshabilitar completamente en producción
- ✅ Solo disponible cuando `NODE_ENV === 'development'`

---

### 3. `/api/transactions` - **Error details en 3 lugares**

**Archivo**: `src/app/api/transactions/route.ts`

#### Error Details #1 (Línea 87)
```typescript
{ error: 'Error al crear transacción', details: insertError.message }
```

#### Error Details #2 (Línea 107)
```typescript
{ error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' }
```

#### Error Details #3 (Línea 164)
```typescript
{ error: 'Error al obtener transacciones', details: error.message }
```

**Expone**:
- ❌ Stack traces de errores de base de datos
- ❌ Nombres de tablas y columnas
- ❌ Mensajes de error internos de Supabase

---

### 4. `/api/transactions/[id]` - **Error details en 2 lugares**

**Archivo**: `src/app/api/transactions/[id]/route.ts`

#### Error Details #1 (Línea 70)
```typescript
{ error: 'Error al actualizar transacción', details: updateError.message }
```

#### Error Details #2 (Línea 100)
```typescript
{ error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' }
```

**Expone**:
- ❌ Errores de validación de Supabase
- ❌ Mensajes de error internos

---

### 5. `/api/transactions/voice` - **Error details**

**Archivo**: `src/app/api/transactions/voice/route.ts`

#### Error Details (Línea 91)
```typescript
{
  error: 'Error al procesar transacción por voz',
  details: error instanceof Error ? error.message : 'Unknown error'
}
```

**Expone**:
- ❌ Errores de parsing con Gemini AI
- ❌ Mensajes de error internos

---

### 6. `/api/process-document` - **Error message en línea 90**

**Archivo**: `src/app/api/process-document/route.ts`

#### Error Message (Línea 90)
```typescript
{ error: `Error procesando ${file.name}: ${processingError instanceof Error ? processingError.message : 'Error desconocido'}` }
```

**Expone**:
- ❌ Nombre del archivo del usuario
- ❌ Detalles de errores de procesamiento

---

## ✅ SEGURO - Endpoints sin debug info

Los siguientes endpoints **NO** exponen información de debugging:

- `/api/budget-chat` ✅
- `/api/expense-chat` ✅
- `/api/profile-edit-chat` ✅
- `/api/generate-financial-report` ✅
- `/api/transcribe-audio` ✅

---

## 📋 Resumen de Impacto

### Gravedad por Tipo:

| Tipo | Cantidad | Gravedad | Acción |
|------|----------|----------|--------|
| **Debug objects completos** | 2 | 🔴 CRÍTICO | Remover `parsedData` siempre, otros campos solo en prod |
| **Endpoint de debug** | 1 | 🔴 CRÍTICO | Deshabilitar completamente en producción |
| **Error details** | 7 | ⚠️ MEDIO | Remover en producción, mantener en dev |
| **Error messages con datos** | 1 | ⚠️ MEDIO | Sanitizar mensajes en producción |

### Datos Sensibles Expuestos:

1. 🔴 **Información financiera del usuario** (`parsedData` en `/api/chat`)
2. ❌ **Mensajes de error de base de datos** (estructura interna)
3. ❌ **Stack traces y errores internos**
4. ⚠️ **Lógica de negocio** (números de preguntas, estados internos)
5. ⚠️ **Nombres de archivos del usuario**

---

## 🎯 Plan de Acción (Sub-tasks 1.18-1.20)

### Sub-task 1.18: Agregar condicionales NODE_ENV

Para cada campo identificado arriba:

```typescript
// ANTES
return NextResponse.json({
  message: response.message,
  debug: {
    questionNumber,
    parsedData,  // 🔴 NUNCA exponer
    profileExists: !!profile
  }
});

// DESPUÉS
return NextResponse.json({
  message: response.message,
  ...(process.env.NODE_ENV === 'development' && {
    debug: {
      questionNumber,
      // parsedData NUNCA se expone, ni en dev
      profileExists: !!profile
    }
  })
});
```

### Sub-task 1.19: Probar en modo producción

```bash
NODE_ENV=production npm run build
NODE_ENV=production npm start
# Verificar que NO aparezcan campos debug
```

### Sub-task 1.20: Verificar responses limpias

- ✅ Sin campos `debug`
- ✅ Sin `details` en errores
- ✅ Endpoint `/api/debug-log` devuelve 404
- ✅ Solo mensajes de error genéricos

---

## 📊 Estadísticas

- **Total de archivos analizados**: 11 API routes
- **Archivos con debug info**: 6
- **Campos de debug encontrados**: 11
- **Nivel de riesgo promedio**: MEDIO-ALTO
- **Campos críticos**: 3 (parsedData, debug-log endpoint, error details)

---

**Próximos pasos**: Implementar sub-tasks 1.18-1.20 para proteger información sensible en producción.
