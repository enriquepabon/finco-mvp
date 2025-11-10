# 🧪 Guía de Testing - MentorIA

## 📋 Checklist de Implementación

### 1️⃣ **Ejecutar Migraciones en Supabase**

#### Opción A: Desde Supabase Dashboard (Recomendado)
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Ejecuta las migraciones en orden:

**Primera migración - Hábitos:**
```sql
-- Copia y pega el contenido completo de:
-- supabase/migrations/20251107000001_create_user_habits_table.sql
```

**Segunda migración - Badges:**
```sql
-- Copia y pega el contenido completo de:
-- supabase/migrations/20251107000002_create_badges_tables.sql
```

4. Verifica que las tablas se crearon correctamente:
```sql
-- Verificar tabla user_habits
SELECT * FROM user_habits LIMIT 1;

-- Verificar tabla badges
SELECT * FROM badges ORDER BY sort_order;

-- Verificar tabla user_badges
SELECT * FROM user_badges LIMIT 1;
```

#### Opción B: Con Supabase CLI (Avanzado)
```bash
# Instalar Supabase CLI (si no lo tienes)
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref [TU_PROJECT_REF]

# Ejecutar migraciones
supabase db push
```

---

### 2️⃣ **Verificar Variables de Entorno**

Asegúrate de que tu archivo `.env.local` tiene:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# OpenAI
OPENAI_API_KEY=tu_openai_api_key
```

---

### 3️⃣ **Instalar Dependencias Faltantes**

```bash
# Framer Motion (para animaciones)
npm install framer-motion

# Lucide React (iconos)
npm install lucide-react

# Si falta @supabase/supabase-js
npm install @supabase/supabase-js
```

---

## 🧪 **Tests Funcionales**

### Test 1: Sistema de Hábitos ✅

#### Paso 1: Registrar una transacción
1. Inicia sesión en la app
2. Ve al Dashboard
3. Haz clic en "Transacciones" en el menú superior
4. Registra un gasto (ej: $50 en "Comida")

**Resultado esperado:**
- La transacción se guarda correctamente
- Se dispara automáticamente el tracking del hábito `daily_expense_log`

#### Paso 2: Ver el HabitTracker
1. Ve a la sección "Overview" del dashboard
2. Busca el panel "Mis Hábitos"

**Resultado esperado:**
- Deberías ver el componente `HabitTracker`
- Debería mostrar "Registro Diario" con 1 día de racha 🔥
- Stats: "1 día total", "1 hoy", "1 mejor racha"

#### Paso 3: Verificar en base de datos
```sql
-- Ver hábitos registrados
SELECT * FROM user_habits 
WHERE user_id = 'TU_USER_ID'
ORDER BY completed_at DESC;
```

---

### Test 2: Sistema de Badges ✅

#### Paso 1: Verificar badges disponibles
1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Network"
3. Haz una petición a: `/api/badges/[tu_user_id]`

**O con curl:**
```bash
curl -X GET "http://localhost:3000/api/badges/[tu_user_id]" \
  -H "Authorization: Bearer [tu_access_token]"
```

**Resultado esperado:**
```json
{
  "success": true,
  "earnedBadges": [],
  "availableBadges": [
    {
      "name": "Primer Paso",
      "slug": "first-step",
      "description": "¡Registraste tu primer gasto!",
      "icon": "🎯"
    },
    // ... más badges
  ],
  "totalPoints": 0,
  "stats": {
    "totalEarned": 0,
    "totalAvailable": 8
  }
}
```

#### Paso 2: Ganar tu primer badge
```bash
# Verificar si ganaste badges
curl -X POST "http://localhost:3000/api/badges/check" \
  -H "Authorization: Bearer [tu_access_token]" \
  -H "Content-Type: application/json" \
  -d '{"checkAll": true}'
```

**Resultado esperado:**
- Deberías ganar el badge "Primer Paso" (🎯) después de tu primera transacción

#### Paso 3: Ver badges ganados en base de datos
```sql
-- Ver badges del usuario
SELECT 
  ub.earned_at,
  b.name,
  b.description,
  b.points
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE ub.user_id = 'TU_USER_ID'
ORDER BY ub.earned_at DESC;
```

---

### Test 3: Milestones de Rachas ✅

#### Simular 3 días consecutivos:
```sql
-- SOLO PARA TESTING - Insertar hábitos de días anteriores
INSERT INTO user_habits (user_id, habit_type, completed_at, streak_count)
VALUES 
  ('TU_USER_ID', 'daily_expense_log', NOW() - INTERVAL '2 days', 1),
  ('TU_USER_ID', 'daily_expense_log', NOW() - INTERVAL '1 day', 2),
  ('TU_USER_ID', 'daily_expense_log', NOW(), 3);
```

**Resultado esperado:**
- El `StreakIndicator` debería mostrar "3 días seguidos" 🔥
- Deberías ganar el badge "Racha de 3 Días"
- El mensaje debería ser: "¡3 días seguidos! Vas muy bien."

---

### Test 4: API Endpoints ✅

#### Verificar que todos los endpoints respondan:

```bash
# 1. GET Habits
curl "http://localhost:3000/api/habits/[user_id]" \
  -H "Authorization: Bearer [token]"

# 2. POST Track Habit
curl -X POST "http://localhost:3000/api/habits/track" \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"habitType": "budget_check"}'

# 3. GET Badges
curl "http://localhost:3000/api/badges/[user_id]" \
  -H "Authorization: Bearer [token]"

# 4. POST Check Badges
curl -X POST "http://localhost:3000/api/badges/check" \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{"checkAll": true}'
```

---

## 🐛 **Debugging Común**

### Error: "Module not found"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "PGRST301: JWT expired"
```javascript
// El token de Supabase expiró, necesitas hacer logout/login
await supabase.auth.signOut()
// Volver a iniciar sesión
```

### Error: "relation user_habits does not exist"
```sql
-- Las migraciones no se ejecutaron
-- Ve a Supabase Dashboard > SQL Editor y ejecuta las migraciones
```

### Hábitos no se están registrando
```sql
-- Verificar que el trigger funciona
SELECT * FROM user_habits WHERE user_id = 'TU_USER_ID';

-- Si está vacío, verificar logs del servidor
-- npm run dev en terminal y revisar console.log
```

---

## ✅ **Checklist Final**

Antes de considerar todo listo:

- [ ] ✅ Migraciones ejecutadas en Supabase
- [ ] ✅ 8 badges visibles en la tabla `badges`
- [ ] ✅ Al registrar un gasto, se crea un `user_habit`
- [ ] ✅ `HabitTracker` visible en dashboard
- [ ] ✅ `StreakIndicator` muestra días correctamente
- [ ] ✅ Al registrar gasto, se gana badge "Primer Paso"
- [ ] ✅ API `/api/habits/[userId]` responde
- [ ] ✅ API `/api/badges/[userId]` responde
- [ ] ✅ No hay errores en la consola del navegador
- [ ] ✅ No hay errores en la consola del servidor

---

## 📊 **Queries Útiles para Testing**

```sql
-- 1. Ver todos los hábitos de un usuario
SELECT 
  habit_type,
  COUNT(*) as total,
  MAX(streak_count) as max_streak,
  MAX(completed_at) as last_completion
FROM user_habits
WHERE user_id = 'TU_USER_ID'
GROUP BY habit_type;

-- 2. Ver badges ganados por usuarios
SELECT 
  u.email,
  COUNT(ub.id) as badges_earned,
  SUM(b.points) as total_points
FROM auth.users u
LEFT JOIN user_badges ub ON u.id = ub.user_id
LEFT JOIN badges b ON ub.badge_id = b.id
GROUP BY u.email;

-- 3. Ver badges más ganados
SELECT 
  b.name,
  b.rarity,
  COUNT(ub.id) as times_earned
FROM badges b
LEFT JOIN user_badges ub ON b.id = ub.badge_id
GROUP BY b.id, b.name, b.rarity
ORDER BY times_earned DESC;

-- 4. Resetear hábitos de un usuario (SOLO TESTING)
DELETE FROM user_habits WHERE user_id = 'TU_USER_ID';
DELETE FROM user_badges WHERE user_id = 'TU_USER_ID';
```

---

## 🎉 **Si Todo Funciona...**

¡Felicitaciones! Has implementado exitosamente:

1. ✅ Sistema de Micro-hábitos con tracking automático
2. ✅ Sistema de Rachas con 9 milestones
3. ✅ Sistema de Gamificación con 8 badges
4. ✅ 4 API endpoints funcionales
5. ✅ Componentes React con animaciones
6. ✅ Auto-tracking en transacciones

---

## 📝 **Próximos Pasos**

Si quieres continuar:

1. **Completar UI de Gamificación:**
   - Componente `BadgeCard` para mostrar badges elegantemente
   - Modal `CelebrationModal` con confetti al ganar badges
   - Sección "Mis Logros" en el perfil de usuario

2. **Fase 7: Modo Freelancer**
   - Sistema de ingresos variables
   - Promediación inteligente
   - Presupuesto adaptativo

3. **Deploy a Producción**
   - Vercel deployment
   - Configuración de dominio
   - Analytics y monitoreo

---

**¿Tienes algún error o pregunta? Comparte el mensaje de error y te ayudo a resolverlo.** 🚀

