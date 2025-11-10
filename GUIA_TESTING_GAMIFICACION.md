# 🚀 Guía de Testing - MentorIA: Gamificación y Hábitos

## 🔴 **IMPORTANTE: Ejecutar Migraciones Primero**

### Error Actual:
```
Could not find the table 'public.user_habits' in the schema cache
```

**Solución:** Ejecutar las migraciones SQL en Supabase.

---

## 📋 **PASO 1: Ejecutar Migraciones en Supabase**

### Opción A: Desde Supabase Dashboard (Más Fácil)

1. **Ve a:** [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. **Selecciona tu proyecto** MentorIA

3. **Ve a SQL Editor** (ícono de base de datos en el menú lateral)

4. **Crea una nueva query** y ejecuta en este orden:

#### **Migración 1: Tabla user_habits**
```sql
-- Copia y pega TODO el contenido del archivo:
-- supabase/migrations/20251107000001_create_user_habits_table.sql
```

**Cómo hacerlo:**
- Abre el archivo: `supabase/migrations/20251107000001_create_user_habits_table.sql`
- Copia TODO el contenido (Cmd+A, Cmd+C)
- Pega en SQL Editor de Supabase
- Click en "Run" (o Cmd+Enter)

#### **Migración 2: Tablas badges y user_badges**
```sql
-- Copia y pega TODO el contenido del archivo:
-- supabase/migrations/20251107000002_create_badges_tables.sql
```

**Cómo hacerlo:**
- Abre el archivo: `supabase/migrations/20251107000002_create_badges_tables.sql`
- Copia TODO el contenido
- Pega en SQL Editor de Supabase
- Click en "Run"

5. **Verificar que las tablas se crearon:**
```sql
-- Ver tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_habits', 'badges', 'user_badges');

-- Ver badges seedeados
SELECT name, icon, rarity, points FROM badges ORDER BY sort_order;
```

**Resultado esperado:**
```
table_name
-----------
user_habits
badges
user_badges

name                 | icon | rarity | points
---------------------|------|--------|--------
Primer Paso          | 🎯   | common | 10
Racha de 3 Días      | 🔥   | common | 20
Primera Semana       | ⭐   | rare   | 50
Constancia (21 días) | 💪   | epic   | 100
Primer Ahorro        | 💰   | common | 15
Presupuesto Creado   | 📊   | common | 25
Mes Completo         | 🏆   | rare   | 150
Primera Meta         | 🎉   | epic   | 200
```

---

## 🧪 **PASO 2: Testing del Sistema de Hábitos**

### Test 1: Registrar una Transacción

1. **Inicia sesión** en la app
2. **Ve al Dashboard**
3. **Click en "Transacciones"** en el menú superior
4. **Registra un gasto:**
   - Descripción: "Almuerzo"
   - Monto: $50
   - Categoría: Comida
   - Click "Guardar"

### ✅ **Resultado Esperado:**

**En el servidor (terminal):**
```
✅ Transaction created: [transaction_id]
🎯 Habit tracked: daily_expense_log
```

**En Supabase:**
```sql
-- Verifica que se creó el hábito
SELECT * FROM user_habits 
WHERE user_id = 'TU_USER_ID'
ORDER BY completed_at DESC;
```

Deberías ver:
```
habit_type          | streak_count | completed_at
--------------------|--------------|------------------
daily_expense_log   | 1            | 2025-11-07 XX:XX
```

---

### Test 2: Ver el Panel de Hábitos

1. **Ve a "Overview"** en el dashboard
2. **Busca el panel "Mis Hábitos"**

### ✅ **Resultado Esperado:**

Deberías ver:
- ✅ **HabitTracker** con tu hábito
- 🔥 **"Registro Diario"** con 1 día de racha
- **Stats:**
  - "1 día total"
  - "1 completado hoy" ✓
  - "1 mejor racha"

**Si ves esto:**
```
¡Comienza tu primera racha!
Registra tu primer gasto o completa una acción para iniciar...
```

Significa que las migraciones **NO se ejecutaron** o hay un problema de caché.

**Solución:**
```sql
-- Refrescar el schema cache en Supabase
NOTIFY pgrst, 'reload schema';
```

---

## 🏆 **PASO 3: Testing del Sistema de Badges**

### Test 3: Verificar que Ganaste tu Primer Badge

#### Opción A: Desde la Consola del Navegador

1. **Abre DevTools** (F12)
2. **Ve a Console**
3. **Ejecuta:**
```javascript
// Obtener tu user ID
const userId = (await supabase.auth.getUser()).data.user.id;
console.log('User ID:', userId);

// Obtener token
const token = (await supabase.auth.getSession()).data.session.access_token;

// Verificar badges
const response = await fetch(`/api/badges/check`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ checkAll: true })
});

const result = await response.json();
console.log('Badges ganados:', result);
```

### ✅ **Resultado Esperado:**

```json
{
  "success": true,
  "newBadges": [
    {
      "name": "Primer Paso",
      "slug": "first-step",
      "description": "¡Registraste tu primer gasto!",
      "icon": "🎯",
      "rarity": "common",
      "points": 10
    }
  ],
  "count": 1,
  "message": "¡Ganaste 1 nuevo logro!"
}
```

#### Opción B: Verificar en Base de Datos

```sql
-- Ver badges ganados
SELECT 
  b.name,
  b.icon,
  b.points,
  ub.earned_at,
  ub.is_seen
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE ub.user_id = 'TU_USER_ID'
ORDER BY ub.earned_at DESC;
```

**Resultado esperado:**
```
name         | icon | points | earned_at           | is_seen
-------------|------|--------|---------------------|--------
Primer Paso  | 🎯   | 10     | 2025-11-07 XX:XX   | false
```

---

## 🔥 **PASO 4: Testing de Rachas (Milestones)**

### Test 4: Simular 3 Días Consecutivos

Para probar sin esperar 3 días reales:

```sql
-- SOLO PARA TESTING - Insertar hábitos de días anteriores
INSERT INTO user_habits (user_id, habit_type, completed_at, streak_count)
VALUES 
  ('TU_USER_ID', 'daily_expense_log', NOW() - INTERVAL '2 days', 1),
  ('TU_USER_ID', 'daily_expense_log', NOW() - INTERVAL '1 day', 2),
  ('TU_USER_ID', 'daily_expense_log', NOW(), 3);
```

**Reemplaza `TU_USER_ID` con tu ID real.**

### ✅ **Resultado Esperado:**

1. **En el Dashboard:**
   - El `StreakIndicator` mostrará: **"3 días seguidos"** 🔥
   - Barra de progreso visible
   - Mensaje: "¡3 días seguidos! Vas muy bien."

2. **Ganarás el badge "Racha de 3 Días":**
```javascript
// Verificar nuevo badge
const response = await fetch(`/api/badges/check`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ specificBadgeSlug: 'streak-3' })
});

const result = await response.json();
console.log('Badge de racha:', result);
```

---

## 📊 **PASO 5: Ver Todos tus Badges**

### Test 5: API de Badges

```javascript
// Obtener todos los badges
const userId = (await supabase.auth.getUser()).data.user.id;
const token = (await supabase.auth.getSession()).data.session.access_token;

const response = await fetch(`/api/badges/${userId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const badges = await response.json();
console.log('Badges:', badges);
```

### ✅ **Resultado Esperado:**

```json
{
  "success": true,
  "earnedBadges": [
    {
      "badge": {
        "name": "Primer Paso",
        "icon": "🎯",
        "points": 10
      },
      "earned_at": "2025-11-07T...",
      "is_seen": false
    },
    {
      "badge": {
        "name": "Racha de 3 Días",
        "icon": "🔥",
        "points": 20
      },
      "earned_at": "2025-11-07T...",
      "is_seen": false
    }
  ],
  "availableBadges": [
    {
      "name": "Primera Semana",
      "icon": "⭐",
      "points": 50
    }
    // ... más badges disponibles
  ],
  "totalPoints": 30,
  "stats": {
    "totalEarned": 2,
    "totalAvailable": 8,
    "unseenCount": 2
  }
}
```

---

## 🎮 **PASO 6: Testing de Auto-tracking**

### Test 6: Auto-tracking en Transacciones

1. **Registra otra transacción:**
   - Descripción: "Café"
   - Monto: $5
   - Categoría: Comida

2. **Verifica en la consola del servidor:**
```
✅ Transaction created: [id]
🎯 Habit tracked: daily_expense_log
```

3. **Verifica que NO se duplica:**
```sql
-- Debería haber solo UN registro por día
SELECT 
  DATE(completed_at) as fecha,
  COUNT(*) as registros
FROM user_habits
WHERE user_id = 'TU_USER_ID'
AND habit_type = 'daily_expense_log'
GROUP BY DATE(completed_at)
ORDER BY fecha DESC;
```

**Resultado esperado:**
```
fecha       | registros
------------|----------
2025-11-07  | 1
```

---

## 🐛 **Troubleshooting**

### Problema 1: "Could not find table"
**Solución:**
1. Ejecuta las migraciones en Supabase
2. Refresca el schema cache:
```sql
NOTIFY pgrst, 'reload schema';
```
3. Reinicia el servidor: `npm run dev`

### Problema 2: No veo el panel de hábitos
**Solución:**
1. Verifica que estás en la sección "Overview" del dashboard
2. Actualiza la página (Cmd+R)
3. Revisa la consola del navegador (F12) para errores

### Problema 3: No gano badges
**Solución:**
1. Verifica que las migraciones se ejecutaron
2. Ejecuta manualmente:
```javascript
fetch('/api/badges/check', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ checkAll: true })
});
```

### Problema 4: Error de Next.js con `params`
**Solución:** Ya corregido ✅ - Reinicia el servidor

---

## ✅ **Checklist de Verificación**

Antes de continuar, asegúrate de que:

- [ ] ✅ Migraciones ejecutadas en Supabase
- [ ] ✅ 8 badges visibles en la tabla `badges`
- [ ] ✅ Servidor reiniciado (`npm run dev`)
- [ ] ✅ Al registrar un gasto, se crea un `user_habit`
- [ ] ✅ `HabitTracker` visible en dashboard
- [ ] ✅ `StreakIndicator` muestra días correctamente
- [ ] ✅ Ganaste el badge "Primer Paso" 🎯
- [ ] ✅ No hay errores en consola del navegador
- [ ] ✅ No hay errores en consola del servidor

---

## 🎯 **Próximos Pasos**

Una vez que todo funcione:

1. **Probar rachas de 7 días** para ganar "Primera Semana" ⭐
2. **Registrar ahorros** para ganar "Primer Ahorro" 💰
3. **Crear un presupuesto** para ganar "Presupuesto Creado" 📊
4. **Implementar componentes visuales** (BadgeCard, CelebrationModal)

---

¿Algún error específico que necesites resolver? 🚀

