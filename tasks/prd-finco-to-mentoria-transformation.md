# PRD: Transformación de FINCO a MentorIA

## 1. Introducción/Overview

### Problema
La aplicación actual (FINCO) funciona como un analista financiero técnico, pero la investigación de mercado y estrategia de marca indica que los usuarios necesitan un **mentor empático y accesible**, no solo un analista. El tono actual puede resultar intimidante para usuarios sin conocimientos financieros avanzados.

### Solución
Transformar FINCO en **MentorIA**: un mentor financiero personal que utiliza un tono conversacional, empático y sin jerga, basado en micro-hábitos y celebraciones de pequeños logros. Esta transformación incluye:
- Rebranding completo (nombre, identidad visual, tono de voz)
- Landing page nueva optimizada para conversión
- Actualización de prompts de IA a tono MentorIA
- Nuevas funcionalidades: micro-hábitos, gamificación sutil, modo freelancer
- Migración sin fricción para usuarios existentes

### Meta Principal
Transformar la experiencia del usuario de "intimidante y técnico" a "amigable y motivador", aumentando la retención D30 de 35% actual a >45% y logrando un NPS de >40 en la primera semana.

---

## 2. Goals

### Objetivos de Negocio
1. **Aumentar conversión del landing:** De 15% actual a >25%
2. **Mejorar retención D30:** De 35% a >45%
3. **Incrementar NPS inicial:** De +20 a >+40 en primera semana
4. **Reducir tiempo de onboarding:** Mantener <2 minutos con nuevo tono
5. **Aumentar engagement semanal:** +30% en interacciones con IA

### Objetivos de Producto
1. Implementar identidad visual MentorIA en toda la app
2. Lanzar landing page Next.js con SEO optimizado
3. Actualizar todos los prompts principales al tono MentorIA
4. Implementar sistema de micro-hábitos y celebraciones
5. Agregar gamificación sutil (rachas, badges)
6. Crear modo Freelancer para ingresos variables

### Objetivos de Usuario
1. Sentir que hablan con un mentor, no con un robot bancario
2. Recibir reconocimiento por pequeños logros (no solo grandes)
3. Entender recomendaciones financieras sin jerga técnica
4. Manejar ingresos variables si son freelancers
5. Mantener motivación a través de rachas y micro-victorias

---

## 3. User Stories

### Como usuario nuevo:
- **US-001:** Como visitante del landing, quiero entender en <5 segundos qué hace MentorIA y por qué es diferente, para decidir si me registro.
- **US-002:** Como usuario que completa el onboarding, quiero sentir que estoy hablando con un mentor amigable (no un banco), para sentirme cómodo compartiendo mi situación financiera.
- **US-003:** Como usuario en onboarding por voz, quiero que MentorIA se presente de forma cálida y explique el proceso, para saber qué esperar.

### Como usuario activo:
- **US-004:** Como usuario que registra su primer gasto, quiero recibir una celebración inmediata, para sentir que estoy progresando.
- **US-005:** Como usuario que completa 3 días consecutivos registrando gastos, quiero ver mi "racha" y recibir motivación, para mantener el hábito.
- **US-006:** Como freelancer, quiero que MentorIA entienda que mis ingresos varían cada mes, para recibir recomendaciones realistas.
- **US-007:** Como usuario que excede su presupuesto, quiero recibir un mensaje empático (no de regaño), para no sentirme culpable.

### Como usuario existente de FINCO:
- **US-008:** Como usuario actual de FINCO, quiero que mi transición a MentorIA sea automática y sin perder datos, para no tener que empezar de cero.
- **US-009:** Como usuario existente, quiero entender qué cambió y por qué es mejor, para apreciar las mejoras.

### Como usuario buscando motivación:
- **US-010:** Como usuario que ahorra $100, quiero recibir una celebración significativa con contexto, para sentir orgullo de mi logro.
- **US-011:** Como usuario que usa la app durante 7 días seguidos, quiero ver mi progreso y recibir un badge, para mantener mi compromiso.

---

## 4. Functional Requirements

### 4.1 Landing Page MentorIA (Next.js)

**REQ-LP-001:** La landing page debe tener las siguientes secciones en orden:
- Hero con propuesta de valor clara ("Tu mentor financiero personal")
- Features (6 tarjetas principales)
- Proceso en 4 pasos
- Testimonios (3 casos reales)
- CTA final con copy motivador
- Footer con enlaces legales

**REQ-LP-002:** La landing debe ser 100% responsive (mobile-first)

**REQ-LP-003:** SEO optimizado: meta tags, Open Graph, structured data

**REQ-LP-004:** Tiempo de carga <2 segundos (Lighthouse score >90)

**REQ-LP-005:** Botones CTA deben dirigir a `/onboarding` con tracking analytics

**REQ-LP-006:** Animaciones sutiles con Framer Motion en hero y features

### 4.2 Rebranding Visual

**REQ-VIS-001:** Cambiar todos los textos "FINCO" por "MentorIA" en:
- Componentes UI (headers, footers, etc.)
- Mensajes de chat
- Notificaciones
- Metadata y títulos de página

**REQ-VIS-002:** Actualizar paleta de colores a MentorIA:
- Primary: `#2E5BFF` (azul confianza)
- Success: `#00C48C` (verde progreso)
- Warning: `#FFB800` (amarillo alerta suave)
- Text: `#2D3436` (dark slate)
- Background: `#F8F9FA` (light neutral)

**REQ-VIS-003:** Actualizar logo en:
- Navbar
- Favicon
- Splash screen (si aplica)
- Meta tags

**REQ-VIS-004:** Crear componente `<MentorIALogo />` reutilizable

### 4.3 Actualización de Tono en Prompts de IA

**REQ-TONE-001:** Actualizar prompt de onboarding (`lib/gemini/specialized-prompts.ts`) para:
- Presentarse como "MentorIA" (no FINCO)
- Usar lenguaje más cálido y menos formal
- Evitar jerga financiera técnica
- Explicar el "por qué" de cada pregunta
- Celebrar respuestas del usuario

**REQ-TONE-002:** Actualizar prompt de budget chat para:
- Enfocarse en micro-hábitos, no grandes cambios
- Usar ejemplos concretos y cotidianos
- Validar emociones ("entiendo que es difícil...")
- Ofrecer opciones, no órdenes

**REQ-TONE-003:** Agregar reglas de tono a `specialized-prompts.ts` basadas en `MentorIA_Guia_Voz_Tono.md`:
```typescript
const MENTORIA_TONE_RULES = `
- Usa lenguaje simple (como hablar con un amigo)
- Evita jerga: "gastos" no "egresos", "dinero que entra" no "flujo de efectivo"
- Sé empático: "Este mes fue complicado, ¿verdad?" no "Fallaste en tu presupuesto"
- Da contexto: "Sugiero 10% porque funciona para 7 de 10 personas como tú"
- Celebra pequeño: "¡3 días seguidos registrando! Vas bien."
- Máximo 280 caracteres por respuesta
- Un emoji máximo por mensaje (solo para celebraciones)
`;
```

**REQ-TONE-004:** Actualizar mensajes de error para ser más humanos:
- ❌ "Error 500: Internal Server Error"
- ✅ "Hmm, algo salió mal. ¿Intentamos de nuevo?"

### 4.4 Sistema de Micro-hábitos

**REQ-HAB-001:** Crear tabla `user_habits` en Supabase:
```sql
CREATE TABLE user_habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  habit_type TEXT NOT NULL, -- 'expense_tracking', 'budget_review', 'goal_check'
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  total_completions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**REQ-HAB-002:** Implementar función `trackHabit(userId, habitType)` que:
- Incremente `current_streak` si el hábito se completa en días consecutivos
- Actualice `longest_streak` si se supera récord
- Dispare celebración si se alcanza hito (3, 7, 14, 30 días)

**REQ-HAB-003:** Mostrar rachas en dashboard principal:
- Indicador visual de "Días consecutivos registrando gastos"
- Mensaje motivador según racha actual
- Aviso si está en riesgo de perder racha (último registro >20 horas)

**REQ-HAB-004:** Enviar nudges contextuales:
- "Llevas 2 días sin registrar gastos. ¿Todo bien?"
- "¡Vas por 5 días! 2 más y desbloqueas el badge de 'Constancia'"

### 4.5 Gamificación Sutil

**REQ-GAME-001:** Crear tabla `user_badges` en Supabase:
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- emoji o URL de imagen
  criteria JSONB NOT NULL, -- { type: 'streak', value: 7 }
  rarity TEXT -- 'common', 'rare', 'epic'
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_new BOOLEAN DEFAULT TRUE
);
```

**REQ-GAME-002:** Definir badges iniciales:
- 🌱 "Primer Paso" - Completar onboarding
- 🔥 "Racha de 3" - 3 días consecutivos
- ⭐ "Constancia" - 7 días consecutivos
- 💎 "Compromiso Total" - 30 días consecutivos
- 🎯 "Primera Meta" - Completar primera meta de ahorro
- 💪 "Sobreviviente" - Recuperarse de un mes difícil

**REQ-GAME-003:** Mostrar badges ganados en perfil de usuario

**REQ-GAME-004:** Celebración modal al ganar nuevo badge:
- Animación de confetti sutil
- Mensaje personalizado
- Botón para compartir logro (opcional, futuro)

**REQ-GAME-005:** NO implementar:
- Puntos o scores numéricos (no es un juego)
- Leaderboards o comparaciones públicas
- Recompensas monetarias o descuentos

### 4.6 Modo Freelancer

**REQ-FREE-001:** Agregar campo `income_type` a perfil de usuario:
- Opciones: 'fixed', 'variable', 'mixed'
- Pregunta en onboarding: "¿Tus ingresos son fijos o varían cada mes?"

**REQ-FREE-002:** Si `income_type = 'variable'`, calcular presupuesto basado en:
- Promedio de últimos 3-6 meses de ingresos
- Presupuesto "conservador" (mes malo) y "optimista" (mes bueno)

**REQ-FREE-003:** Mostrar en dashboard de freelancer:
- Ingreso promedio últimos 3 meses
- Proyección para mes actual basada en tendencia
- "Colchón de estabilidad" (ahorro recomendado = 3-6 meses gastos)

**REQ-FREE-004:** Alertas específicas para freelancers:
- "Este mes va bajo en ingresos. Activé modo conservador en tu presupuesto."
- "¡Gran mes! ¿Apartamos algo extra para el fondo de estabilidad?"

**REQ-FREE-005:** Crear sección "Bolsillos" en presupuesto freelancer:
- Impuestos (sugerencia: 30% de ingresos)
- Gastos fijos
- Gastos variables
- Ahorro/emergencias

### 4.7 Celebraciones de Pequeños Logros

**REQ-CEL-001:** Implementar función `celebrateAchievement(userId, achievementType, context)` que:
- Genere mensaje personalizado según tipo de logro
- Use tono MentorIA (empático, específico, motivador)
- Muestre notificación in-app

**REQ-CEL-002:** Tipos de logros a celebrar:
- Primer gasto registrado
- Primer presupuesto creado
- Meta de ahorro alcanzada (cualquier monto)
- Semana completa dentro de presupuesto
- Reducción de gastos vs mes anterior
- Racha de 3, 7, 14, 30 días

**REQ-CEL-003:** Formato de celebración:
```typescript
interface Celebration {
  title: string; // "¡Primera semana completa! 🎯"
  message: string; // "Registraste gastos 7 días seguidos. Ya eres parte del 30% que lo logra."
  actionable?: string; // "¿Quieres que te recuerde seguir mañana?"
  tone: 'celebration' | 'encouragement' | 'milestone';
}
```

**REQ-CEL-004:** NO celebrar:
- Logros obvios o automáticos
- Con demasiada frecuencia (máx 1 celebración al día)
- Con exageración ("¡Eres el mejor!")

### 4.8 Migración de Usuarios Existentes

**REQ-MIG-001:** Crear script de migración que:
- NO requiera re-registro de usuarios
- Mantenga todos los datos históricos (budgets, transacciones, metas)
- Actualice referencias a "FINCO" en campos de texto (si existen)

**REQ-MIG-002:** Mostrar modal de bienvenida a usuarios existentes (una vez):
```
¡Hola de nuevo! 👋
FINCO ahora es MentorIA.
Mismo producto, mejor experiencia.

Cambios principales:
✓ Tono más amigable y motivador
✓ Celebraciones de pequeños logros
✓ Modo freelancer disponible
✓ Sistema de rachas y hábitos

Todos tus datos están intactos.
¿Listo para continuar?
```

**REQ-MIG-003:** Crear página `/welcome-to-mentoria` explicativa (opcional)

**REQ-MIG-004:** Inicializar campos nuevos para usuarios existentes:
- `income_type`: Por defecto 'fixed', pero ofrecer cambiar en perfil
- `current_streak`: Inicializar a 0
- `badges`: Otorgar badge "Fundador" a usuarios pre-migración

---

## 5. Non-Goals (Out of Scope)

### Fase 1 (Este PRD):
- ❌ Comparación con peers anónimos (futuro)
- ❌ Sistema de "bolsillos" virtuales (futuro)
- ❌ Integración con bancos (ya existe o no prioritario)
- ❌ Modo pareja/familiar (futuro)
- ❌ Inversiones o productos financieros complejos
- ❌ Cambio de arquitectura backend (solo frontend/UX)
- ❌ App móvil nativa (mantener web app)
- ❌ Cambio de modelo de IA (OpenAI se mantiene)

### Explícitamente NO hacer:
- ❌ Leaderboards o gamificación competitiva
- ❌ Recompensas monetarias
- ❌ Publicidad o marketing dentro de la app
- ❌ Vender productos financieros de terceros
- ❌ Consejos de inversión específicos (fuera de alcance legal)

---

## 6. Design Considerations

### 6.1 UI/UX Guidelines

**Paleta de Colores MentorIA:**
```css
--primary-blue: #2E5BFF;
--success-green: #00C48C;
--warning-yellow: #FFB800;
--text-dark: #2D3436;
--text-gray: #95A5A6;
--bg-light: #F8F9FA;
```

**Typography:**
- Font: Inter (ya en uso, mantener)
- Headers: 700 weight
- Body: 400 weight
- Buttons: 600 weight

**Componentes a Actualizar:**
- Navbar: Nuevo logo MentorIA
- Footer: Actualizar copyright y enlaces
- Chat bubbles: Colores más cálidos para mensajes de MentorIA
- Buttons: Usar gradient sutil para CTAs principales
- Cards: Más redondeadas (border-radius: 12px)

### 6.2 Animaciones

**Usar Framer Motion para:**
- Entrada de chat bubbles (fade + slide up)
- Celebraciones (confetti sutil)
- Badges (scale + bounce)
- Transiciones de página (fade)

**NO usar:**
- Animaciones largas (>300ms)
- Animaciones que bloqueen interacción
- Movimiento excesivo

### 6.3 Copywriting

**Tono General:**
- 2/10 humor (ingenioso ocasional, nunca burlón)
- 5/10 formalidad (profesional accesible)
- 9/10 respeto (siempre empático)
- 6/10 entusiasmo (motivador realista)

**Ejemplos de Copy:**
```
❌ "Bienvenido a la plataforma de gestión financiera"
✅ "Hola, soy MentorIA 👋 Vamos a mejorar tus finanzas juntos"

❌ "Error: Presupuesto inválido"
✅ "Ups, ese presupuesto parece muy ajustado. ¿Probamos con 10% menos?"

❌ "Tarea completada"
✅ "¡Primera semana completa! 🎯 Ya eres parte del 30% que lo logra"
```

### 6.4 Accesibilidad

- WCAG 2.1 AA compliance
- Contraste de colores mínimo 4.5:1
- Labels en todos los form inputs
- Navegación por teclado funcional
- Alt text en todas las imágenes

---

## 7. Technical Considerations

### 7.1 Stack (Mantener Actual)
- **Frontend:** Next.js 15.4.2, React, TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Backend:** Supabase (PostgreSQL)
- **AI:** OpenAI GPT-3.5-turbo / GPT-4
- **Deployment:** Vercel

### 7.2 Nuevas Dependencias
```json
{
  "framer-motion": "^10.x", // Si no está instalado
  "react-confetti": "^6.x", // Para celebraciones
  "date-fns": "^2.x" // Para cálculos de rachas
}
```

### 7.3 Estructura de Archivos Nuevos
```
/tasks/
  prd-finco-to-mentoria-transformation.md
  tasks-prd-finco-to-mentoria-transformation.md
  
/src/app/
  (landing)/
    page.tsx // Nueva landing MentorIA
    layout.tsx
  welcome-to-mentoria/
    page.tsx // Para usuarios migrados
    
/src/components/
  branding/
    MentorIALogo.tsx
  gamification/
    BadgeCard.tsx
    StreakIndicator.tsx
    CelebrationModal.tsx
  habits/
    HabitTracker.tsx
    
/lib/
  gamification/
    badges.ts
    celebrations.ts
  habits/
    tracker.ts
    streaks.ts
  constants/
    mentoria-brand.ts // Colores, copy, etc.
```

### 7.4 Database Schema Changes

**Nuevas Tablas:**
- `user_habits` (REQ-HAB-001)
- `badges` (REQ-GAME-001)
- `user_badges` (REQ-GAME-001)

**Modificaciones a Tablas Existentes:**
```sql
ALTER TABLE users ADD COLUMN income_type TEXT DEFAULT 'fixed';
ALTER TABLE users ADD COLUMN saw_migration_welcome BOOLEAN DEFAULT FALSE;
```

### 7.5 API Changes

**Nuevos Endpoints:**
- `GET /api/habits/:userId` - Obtener hábitos del usuario
- `POST /api/habits/track` - Registrar completación de hábito
- `GET /api/badges/:userId` - Obtener badges del usuario
- `POST /api/badges/check` - Verificar si usuario ganó nuevo badge
- `GET /api/celebrations/:userId` - Obtener celebraciones pendientes

**Endpoints Modificados:**
- `/api/chat` - Incluir reglas de tono MentorIA
- `/api/budget-chat` - Incluir reglas de tono MentorIA
- `/api/user/profile` - Incluir campos nuevos (income_type, etc.)

### 7.6 Performance Considerations

- Landing page: SSG con Next.js para SEO
- Imágenes: Next.js Image component con optimización automática
- Fonts: Preload Inter font
- Bundle size: Code splitting por ruta
- Database: Índices en `user_id` de tablas nuevas

---

## 8. Success Metrics

### 8.1 Landing Page
- **Tasa de conversión:** >25% (de visitante a registro)
- **Tiempo en página:** >30 segundos promedio
- **Bounce rate:** <40%
- **Lighthouse score:** >90

### 8.2 Onboarding
- **Tasa de completación:** >70%
- **Tiempo promedio:** <2 minutos
- **NPS post-onboarding:** >40

### 8.3 Engagement
- **Retención D1:** >65%
- **Retención D7:** >50%
- **Retención D30:** >45%
- **Sesiones por semana:** >3 (promedio)
- **Tiempo en app:** >5 minutos por sesión

### 8.4 Gamificación
- **Usuarios con racha activa:** >40%
- **Badges ganados por usuario:** >2 en primer mes
- **Interacciones con celebraciones:** >80% (no ignoradas)

### 8.5 Modo Freelancer
- **Adopción:** >20% de usuarios activa modo freelancer
- **Satisfacción:** NPS de freelancers >50

### 8.6 Tono y Experiencia
- **NPS general:** >40
- **"Very disappointed" si se quita:** >40%
- **Encuesta post-migración:** >80% prefiere MentorIA vs FINCO

---

## 9. Open Questions

### Pre-Implementación:
1. **Logo:** ¿Diseñarlo internamente o contratar diseñador? ¿Presupuesto disponible?
2. **Testimonios:** ¿Usar testimonios reales o placeholders inicialmente?
3. **Analytics:** ¿Qué herramienta usar? (Google Analytics, Mixpanel, PostHog)
4. **A/B Testing:** ¿Implementar desde el inicio o en iteración futura?
5. **Email/Push Notifications:** ¿Integrar servicio de notificaciones para rachas? (futuro)

### Durante Implementación:
6. **Voz de marca:** ¿Hacer test A/B con usuarios reales antes de lanzar?
7. **Migración:** ¿Fecha específica de lanzamiento o gradual?
8. **Rollback:** ¿Plan de contingencia si usuarios rechazan cambio?

### Post-Lanzamiento:
9. **Métricas:** ¿Cada cuánto revisar métricas de éxito? (sugerencia: semanal)
10. **Iteraciones:** ¿Criterio para considerar features futuras (bolsillos, peers)?

---

## 10. Dependencies & Risks

### Dependencies:
- **OpenAI API:** Cambios en prompts dependen de estabilidad de API
- **Supabase:** Migraciones de DB requieren downtime mínimo
- **Diseño de logo:** Si se contrata externo, puede retrasar landing page

### Risks:

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Usuarios rechazan nuevo tono | Media | Alto | A/B test previo con muestra pequeña |
| Migración rompe datos | Baja | Crítico | Backup completo pre-migración, rollback plan |
| Landing no convierte | Media | Alto | Iterar basado en analytics primeras 2 semanas |
| Badges no motivan | Media | Medio | Encuesta a usuarios, ajustar criterios |
| Modo freelancer confuso | Media | Medio | Beta con freelancers reales antes de lanzar |

---

## 11. Phases & Timeline

### Fase 1: Foundation (Semanas 1-2)
- Setup proyecto y estructura
- Branding visual (logo, colores)
- Landing page MentorIA
- Actualización prompts IA

### Fase 2: Gamificación (Semanas 3-4)
- Sistema de hábitos y rachas
- Badges y celebraciones
- UI de gamificación

### Fase 3: Freelancer Mode (Semana 5)
- Lógica de ingresos variables
- Dashboard freelancer
- Alertas específicas

### Fase 4: Migración y Lanzamiento (Semana 6)
- Script de migración
- Testing exhaustivo
- Comunicación a usuarios
- Lanzamiento público

**Total estimado:** 6 semanas (puede variar según equipo)

---

## 12. Approval & Next Steps

### Para Aprobar:
- [ ] Review por Product Owner
- [ ] Review por Tech Lead
- [ ] Review por diseñador (branding)
- [ ] Presupuesto aprobado (si aplica logo externo)

### Después de Aprobación:
1. Generar task list con `generate-tasks.mdc`
2. Asignar tasks a equipo
3. Crear board en herramienta de PM
4. Kickoff meeting con equipo

---

**Documento Creado:** 2024-11-06  
**Versión:** 1.0  
**Owner:** Equipo Producto  
**Status:** Draft - Pendiente Aprobación

