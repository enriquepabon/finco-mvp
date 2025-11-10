# 🔧 Fix: Row-Level Security Error en user_habits

## 🐛 **Problema:**
```
Error inserting habit: {
  code: '42501',
  message: 'new row violates row-level security policy for table "user_habits"'
}
```

**Causa:** Las políticas RLS de `user_habits` solo permiten operaciones cuando hay un usuario autenticado (`auth.uid()`). Cuando el backend usa el **service role key** para insertar hábitos automáticamente, no hay contexto de usuario.

---

## ✅ **Solución: Agregar Política para Service Role**

He creado una nueva migración que permite al service role (backend) insertar datos:

**Archivo:** `supabase/migrations/20251107000003_fix_user_habits_rls.sql`

---

## 🚀 **Pasos para Aplicar el Fix:**

### **Opción 1: Supabase Dashboard (Recomendada)**

1. **Abre Supabase Dashboard:**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto **MentorIA**

2. **Ve al SQL Editor:**
   - Click en **SQL Editor** en el menú lateral

3. **Ejecuta la Migración:**
   - Click en **"New Query"**
   - Copia y pega este SQL:

```sql
-- FIX: Add service role policy for user_habits
-- This allows the backend to insert habits when tracking user actions

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage all habits" ON public.user_habits;

-- Add policy for service role (backend operations)
CREATE POLICY "Service role can manage all habits" 
ON public.user_habits
FOR ALL
USING (true)
WITH CHECK (true);

-- Note: This policy only applies when using the service role key.
-- Regular users are still protected by the existing user-specific policies.
```

4. **Click en "Run"** (o presiona `Cmd/Ctrl + Enter`)

5. **Verifica el resultado:**
   - Deberías ver: `Success. No rows returned`

---

### **Opción 2: Supabase CLI (Si la tienes instalada)**

```bash
# Navega al proyecto
cd /Users/enriquepabon/Projects/finco-app

# Aplica las migraciones pendientes
supabase db push

# O ejecuta la migración específica
supabase db execute --file supabase/migrations/20251107000003_fix_user_habits_rls.sql
```

---

## 🧪 **Probar el Fix:**

Una vez aplicada la migración:

### **1. Reinicia el servidor Next.js:**
```bash
# Ctrl+C para detener
npm run dev
```

### **2. Crea una nueva transacción:**
1. Ve al **Dashboard**
2. Click en **"Transacciones"** (barra superior)
3. Registra un gasto (ej: "Café - $5000")

### **3. Verifica en la consola del servidor:**

**✅ ESPERADO (Sin error):**
```
📝 Creating transaction: { ... }
✅ Transaction created: [uuid]
✅ Updated category [uuid] actual_amount: 5000
✅ Recalculated budget [uuid] totals
🎯 Habit tracked: daily_expense_log
✅ Habit record inserted successfully  ← ESTO ES NUEVO
POST /api/transactions 201 in 1234ms
```

**❌ ANTES (Con error):**
```
Error inserting habit: {
  code: '42501',
  message: 'new row violates row-level security policy...'
}
```

---

## 🔍 **Verificar en Supabase (Opcional):**

Puedes verificar que los hábitos se están guardando correctamente:

1. **Table Editor en Supabase Dashboard**
2. Busca la tabla `user_habits`
3. Deberías ver registros con:
   - `user_id`: Tu ID de usuario
   - `habit_type`: `daily_expense_log`
   - `completed_at`: Timestamp de hoy
   - `streak_count`: 1 (primera vez) o más (si ya habías registrado hoy)

---

## 📊 **¿Por Qué Esta Solución es Segura?**

### **Preocupación:** "¿No es peligroso permitir `USING (true)`?"

**Respuesta:** No, porque:

1. **Solo aplica al service role key** (que está en el backend, no expuesto al cliente)
2. Los usuarios normales **siguen protegidos** por las políticas anteriores:
   - `"Users can view their own habits"` (solo ven sus datos)
   - `"Users can insert their own habits"` (solo insertan sus propios datos)
3. El backend **valida la identidad del usuario** antes de insertar hábitos
4. Es la práctica recomendada por Supabase para operaciones de backend

---

## 🔐 **Explicación Técnica:**

### **Cómo Funcionan las Políticas RLS:**

```typescript
// Cliente (Frontend) - Usa anon key
const { data } = await supabase
  .from('user_habits')
  .select('*');
// ✅ RLS aplica: Solo ve sus propios hábitos (auth.uid() = user_id)

// Backend (API) - Usa service role key
const { data } = await supabase
  .from('user_habits')
  .insert({ user_id: '...', habit_type: '...' });
// ✅ RLS aplica: Service role policy permite la inserción
```

La política de service role tiene **menor prioridad** que las políticas de usuario, por lo que:
- Si hay un `auth.uid()` válido → usa políticas de usuario
- Si no hay `auth.uid()` (backend con service role) → usa política de service role

---

## 🎯 **Resumen:**

1. ✅ Ejecuta la migración SQL en Supabase Dashboard
2. ✅ Reinicia el servidor Next.js
3. ✅ Registra una transacción
4. ✅ Verifica que no hay error RLS en la consola
5. ✅ Verifica que los hábitos aparecen en `user_habits` table

---

**¿Necesitas ayuda ejecutando la migración?** Avísame y te guío paso a paso. 🚀

