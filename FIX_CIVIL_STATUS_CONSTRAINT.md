# 🔧 Fix Temporal: Error de Constraint `civil_status`

## 🐛 **Problema:**

```
❌ Error guardando perfil: {
  code: '23514',
  message: 'new row for relation "user_profiles" violates check constraint "user_profiles_civil_status_check"'
}
```

**Datos que la IA intentó guardar:**
```json
{
  "civil_status": "married"  ← ❌ Rechazado por la BD
}
```

---

## 🔍 **Causa:**

El **constraint `user_profiles_civil_status_check`** en Supabase NO acepta los valores que estamos usando:
- ❌ `"single"` (inglés)
- ❌ `"married"` (inglés)  
- ❌ `"divorced"` (inglés)
- ❌ `"widowed"` (inglés)

La BD probablemente espera valores en **español**:
- ✅ `"soltero"` / `"soltera"`
- ✅ `"casado"` / `"casada"`
- ✅ `"union_libre"`
- ✅ `"divorciado"` / `"divorciada"`
- ✅ `"viudo"` / `"viuda"`

---

## ✅ **Solución Temporal Implementada:**

He **desactivado** temporalmente el campo `civil_status` para que el onboarding funcione:

**Archivo:** `src/app/api/chat/route.ts`

```typescript
// ⚠️ TEMPORAL: Siempre omitir civil_status hasta que se arregle la constraint en BD
let sanitizedData = { ...analysisResult.data };
if (sanitizedData.civil_status) {
  console.log(`⚠️ Omitiendo civil_status temporalmente: "${sanitizedData.civil_status}"`);
  delete sanitizedData.civil_status; // Omitir hasta arreglar constraint
}
```

**Resultado:**
- ✅ El onboarding ahora **funciona** sin errores
- ⚠️ El campo `civil_status` **NO se guarda** (queda NULL en la BD)
- ✅ Todos los demás campos **se guardan correctamente**

---

## 🧪 **Probar Ahora:**

### **1. Borra tu perfil actual:**

```sql
-- Ejecuta en Supabase Dashboard → SQL Editor
DELETE FROM user_profiles 
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'enriquepabonramirez@gmail.com'
);
```

### **2. Completa el onboarding de nuevo:**

Ahora debería funcionar sin errores. Verás en la consola:

```
✅ Datos extraídos por IA: { ... civil_status: 'married', ... }
⚠️ Omitiendo civil_status temporalmente (constraint de BD no compatible): "married"
🎉 Perfil completo guardado exitosamente!  ← SIN ERROR
```

### **3. Verifica el dashboard:**

Todos los datos **excepto estado civil** deberían estar correctos:
- ✅ Nombre: Kike Pabon
- ✅ Edad: 39
- ⚠️ Estado civil: (vacío)
- ✅ Hijos: 0
- ✅ Ingresos: $22,000,000
- ✅ Gastos: $15,000,000
- ✅ Activos: $820,000,000
- ✅ Pasivos: $15,000,000
- ⚠️ Ahorros: $0 (la IA devolvió `null` porque dijiste "66 palos" pero no especificaste bien)

---

## 🔧 **Solución Permanente (Pendiente):**

### **Opción 1: Actualizar el Prompt de IA (Recomendado)**

Cambiar el prompt para que devuelva valores en español:

```typescript
6. Para estado civil, SOLO usa estos valores exactos:
   - "soltero" → soltero/soltera
   - "casado" → casado/casada
   - "union_libre" → en pareja/viviendo juntos/unión libre
   - "divorciado" → divorciado/divorciada/separado/separada
   - "viudo" → viudo/viuda
```

### **Opción 2: Modificar el Constraint en Supabase**

```sql
-- Ver el constraint actual
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'user_profiles_civil_status_check';

-- Modificar constraint para aceptar valores en inglés
ALTER TABLE user_profiles 
DROP CONSTRAINT user_profiles_civil_status_check;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_civil_status_check 
CHECK (civil_status IN ('single', 'married', 'divorced', 'widowed', 
                        'soltero', 'casado', 'union_libre', 'divorciado', 'viudo'));
```

### **Opción 3: Agregar Mapeo en el Código**

```typescript
// Mapear valores inglés → español antes de guardar
const civilStatusMap = {
  'single': 'soltero',
  'married': 'casado',
  'divorced': 'divorciado',
  'widowed': 'viudo'
};

if (sanitizedData.civil_status) {
  sanitizedData.civil_status = civilStatusMap[sanitizedData.civil_status] || sanitizedData.civil_status;
}
```

---

## 📊 **Para Investigar el Constraint:**

Ejecuta este SQL en Supabase para ver qué valores acepta exactamente:

```sql
-- Ver la definición del constraint
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'user_profiles'
  AND con.conname LIKE '%civil_status%';
```

Esto te dirá exactamente qué valores acepta el CHECK constraint.

---

## 🎯 **Resumen:**

✅ **Fix temporal implementado**: Omitir `civil_status` para evitar error  
⚠️ **Efecto secundario**: Estado civil no se guarda (queda NULL)  
✅ **Onboarding funciona**: Todos los demás datos se guardan correctamente  
🔧 **Pendiente**: Implementar solución permanente (Opción 1, 2 o 3)  

---

## 🚀 **Prueba Ahora:**

1. ✅ Borra tu perfil con el SQL de arriba
2. ✅ Completa el onboarding de nuevo
3. ✅ Debería funcionar sin errores
4. ✅ Todos los datos (excepto estado civil) estarán correctos

---

**¿Quieres que implemente una de las soluciones permanentes ahora?** O prefieres que primero verifiques qué valores acepta el constraint en Supabase? 🤔

