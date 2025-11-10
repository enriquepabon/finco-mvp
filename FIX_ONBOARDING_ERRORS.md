# 🔧 Fix: Errores en Onboarding Conversacional

## 🐛 **Problemas Identificados y Corregidos:**

### **1. Error de Constraint: `civil_status`** ❌→✅

**Problema:**
```
❌ Error: 'new row for relation "user_profiles" violates check constraint "user_profiles_civil_status_check"'
```

**Causa:**
La IA estaba devolviendo `"other"` como valor de `civil_status`, pero la base de datos solo acepta: `"single"`, `"married"`, `"divorced"`, `"widowed"`.

**Solución:**
1. ✅ Actualizado el prompt de análisis para **SOLO** usar los 4 valores válidos
2. ✅ Agregada validación en el código que **sanitiza** `civil_status` antes de guardar
3. ✅ Si el valor no es válido, se omite el campo (mejor que fallar)

---

### **2. Dato Faltante: `total_savings`** ❌→✅

**Problema:**
- Usuario dijo: **"unos 60 millones"** (ahorros)
- IA extrajo: `total_savings: undefined` ❌

**Causa:**
El prompt no especificaba cómo identificar los ahorros en la conversación.

**Solución:**
✅ Agregada regla #11 al prompt:
```
11. Para ahorros (total_savings), busca menciones como: 
    "tengo X ahorrados", "ahorros de X", "guardado X"
```

---

## 📊 **Resultado de Tu Conversación:**

### **Datos Que Dijiste:**
```
- Nombre: "Kike Pabon"
- Edad: 39
- Estado civil: "viviendo en pecado" (unión libre)
- Hijos: 0 (próximo año planeas tener)
- Ingresos: "22 palos" = 22,000,000
- Gastos: "15 millones" = 15,000,000
- Activos: "apto 420M + casa 400M + carro 100M" = 920,000,000
- Deudas: "15 millones en tarjetas" = 15,000,000
- Ahorros: "60 millones" = 60,000,000
```

### **Datos Extraídos por IA (ANTES):**
```json
{
  "full_name": "Kike Pabon",         ✅ Correcto
  "age": 39,                         ✅ Correcto
  "civil_status": "other",           ❌ Inválido → causó error
  "children_count": 0,               ✅ Correcto
  "monthly_income": 22000000,        ✅ Correcto
  "monthly_expenses": 15000000,      ✅ Correcto
  "total_assets": 920000000,         ✅ Correcto
  "total_liabilities": 15000000,     ✅ Correcto
  "total_savings": undefined         ❌ Faltante
}
```

### **Datos Extraídos por IA (AHORA - Esperado):**
```json
{
  "full_name": "Kike Pabon",         ✅ Correcto
  "age": 39,                         ✅ Correcto
  "civil_status": "married",         ✅ Ahora infiere "married" (unión libre)
  "children_count": 0,               ✅ Correcto
  "monthly_income": 22000000,        ✅ Correcto
  "monthly_expenses": 15000000,      ✅ Correcto
  "total_assets": 920000000,         ✅ Correcto
  "total_liabilities": 15000000,     ✅ Correcto
  "total_savings": 60000000          ✅ Ahora captura los ahorros
}
```

---

## 🔧 **Cambios Realizados:**

### **1. Archivo: `src/lib/openai/client.ts`**

**Prompt actualizado (Regla #6):**
```typescript
6. Para estado civil, SOLO usa estos valores exactos:
   - "single" → soltero/soltera
   - "married" → casado/casada/en pareja/viviendo juntos/unión libre
   - "divorced" → divorciado/divorciada/separado/separada
   - "widowed" → viudo/viuda
   - Si no está claro o no mencionó, NO incluyas el campo
```

**Nueva Regla #11:**
```typescript
11. Para ahorros (total_savings), busca menciones como: 
    "tengo X ahorrados", "ahorros de X", "guardado X"
```

---

### **2. Archivo: `src/app/api/chat/route.ts`**

**Sanitización de `civil_status`:**
```typescript
// Sanitizar civil_status para evitar errores de constraint
let sanitizedData = { ...analysisResult.data };
if (sanitizedData.civil_status) {
  const validStatuses = ['single', 'married', 'divorced', 'widowed'];
  if (!validStatuses.includes(sanitizedData.civil_status)) {
    console.log(`⚠️ civil_status inválido: "${sanitizedData.civil_status}", omitiendo campo`);
    delete sanitizedData.civil_status; // Omitir si no es válido
  }
}

finalProfileData = sanitizedData;
```

**Beneficios:**
- ✅ Si la IA devuelve un valor inválido, se omite en lugar de fallar
- ✅ El onboarding no se rompe por un campo
- ✅ Logs claros para debugging

---

## 🧪 **Para Probar las Correcciones:**

### **1. Reinicia el servidor:**
```bash
npm run dev
```

### **2. Crea un nuevo onboarding:**
1. Cierra sesión o usa otra cuenta
2. Completa el onboarding conversacionalmente
3. Usa frases como:
   - "Estoy casado" / "En unión libre" / "Viviendo juntos"
   - "Tengo 5M ahorrados" / "Guardé 2 millones"

### **3. Verifica en la consola:**

**✅ ESPERADO (Sin errores):**
```
✅ Onboarding completado - Analizando con IA...
🤖 Analizando conversación de onboarding con GPT-4o-mini...
📊 Respuesta del análisis: {
  "full_name": "...",
  "age": ...,
  "civil_status": "married",  ← Ahora válido
  "total_savings": 60000000   ← Ahora captura ahorros
}
✅ Datos extraídos por IA: { ... }
🎉 Perfil completo guardado exitosamente!  ← SIN ERROR
POST /api/chat 200 in 5169ms
```

**❌ ANTES (Con error):**
```
❌ Error guardando perfil: {
  code: '23514',
  message: 'violates check constraint "user_profiles_civil_status_check"'
}
```

---

## 📊 **Tabla de Correcciones:**

| Campo | Antes | Ahora |
|-------|-------|-------|
| `civil_status` | ❌ "other" (inválido) | ✅ "married" o se omite |
| `total_savings` | ❌ undefined (no capturaba) | ✅ 60000000 (captura) |
| Error de guardado | ❌ Constraint violation | ✅ Guardado exitoso |

---

## 🎯 **Resumen:**

✅ **Prompt actualizado** para usar solo valores válidos de `civil_status`  
✅ **Sanitización agregada** para prevenir errores de constraint  
✅ **Regla nueva** para capturar ahorros correctamente  
✅ **Fallback seguro**: Omite campos inválidos sin romper el onboarding  

---

## 🚀 **Próxima Prueba:**

Haz un nuevo onboarding y verifica que:
1. ✅ Se capture el estado civil correctamente ("married" para unión libre)
2. ✅ Se capture `total_savings` cuando digas "tengo X ahorrados"
3. ✅ NO haya error `23514` al guardar el perfil
4. ✅ Redirija al dashboard sin problemas

---

**¿Listo para probarlo de nuevo?** Reinicia el servidor y completa un onboarding nuevo. Ahora debería funcionar perfectamente. 🎉

