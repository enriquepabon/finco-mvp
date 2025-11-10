# Task List: FINCO to MentorIA Transformation

Based on: `prd-finco-to-mentoria-transformation.md`

---

## Relevant Files

- `src/app/(landing)/page.tsx` - Nueva landing page MentorIA (Next.js)
- `src/app/(landing)/layout.tsx` - Layout específico para landing
- `src/app/welcome-to-mentoria/page.tsx` - Página de bienvenida para usuarios migrados
- `src/components/branding/MentorIALogo.tsx` - Componente de logo reutilizable
- `src/components/gamification/BadgeCard.tsx` - Componente para mostrar badges
- `src/components/gamification/StreakIndicator.tsx` - Indicador de rachas
- `src/components/gamification/CelebrationModal.tsx` - Modal de celebraciones
- `src/components/habits/HabitTracker.tsx` - Componente de seguimiento de hábitos
- `lib/gamification/badges.ts` - Lógica de badges y criterios
- `lib/gamification/celebrations.ts` - Sistema de celebraciones
- `lib/habits/tracker.ts` - Lógica de tracking de hábitos
- `lib/habits/streaks.ts` - Cálculo de rachas
- `lib/constants/mentoria-brand.ts` - Constantes de marca (colores, copy)
- `lib/gemini/specialized-prompts.ts` - Actualizar prompts con tono MentorIA
- `src/app/api/habits/[userId]/route.ts` - API para obtener hábitos
- `src/app/api/habits/track/route.ts` - API para registrar hábito
- `src/app/api/badges/[userId]/route.ts` - API para obtener badges
- `src/app/api/badges/check/route.ts` - API para verificar nuevos badges
- `src/app/api/celebrations/[userId]/route.ts` - API para obtener celebraciones
- `supabase/migrations/XXXXXX_add_mentoria_features.sql` - Migración de DB
- `scripts/migrate-users-to-mentoria.ts` - Script de migración de usuarios
- `public/images/mentoria-logo.svg` - Logo de MentorIA (si se crea internamente)

### Notes

- Todas las migraciones de Supabase deben probarse en ambiente de desarrollo primero
- Hacer backup de base de datos antes de ejecutar script de migración
- Los nuevos componentes usan Framer Motion para animaciones
- El sistema de badges es extensible para agregar más en el futuro

---

## Tasks

- [x] 1.0 Setup de Proyecto y Constantes de Marca
  - [x] 1.1 Crear directorio `/lib/constants/mentoria-brand.ts` con paleta de colores, tipografía y constantes de marca
  - [x] 1.2 Instalar dependencias nuevas: `npm install framer-motion react-confetti date-fns` (si no están instaladas)
  - [x] 1.3 Crear estructura de carpetas: `/src/components/branding`, `/src/components/gamification`, `/src/components/habits`
  - [x] 1.4 Actualizar archivo de configuración de Tailwind con colores de MentorIA
  - [x] 1.5 Crear documento `/docs/mentoria-implementation-notes.md` para tracking de cambios

- [x] 2.0 Landing Page MentorIA
  - [x] 2.1 Crear grupo de rutas `/src/app/(landing)/` con layout específico
  - [x] 2.2 Implementar `/src/app/(landing)/page.tsx` - Sección Hero con propuesta de valor
  - [x] 2.3 Implementar sección Features (6 tarjetas con iconos y descripciones)
  - [x] 2.4 Implementar sección Proceso (4 pasos visuales)
  - [x] 2.5 Implementar sección Testimonios (3 casos reales con formato de tarjeta)
  - [x] 2.6 Implementar sección CTA final con gradiente
  - [x] 2.7 Implementar Footer con enlaces a secciones legales
  - [x] 2.8 Agregar animaciones con Framer Motion (fade in, slide up)
  - [x] 2.9 Optimizar SEO: meta tags, Open Graph, structured data JSON-LD
  - [x] 2.10 Hacer responsive (mobile-first) y probar en diferentes dispositivos
  - [x] 2.11 Optimizar imágenes con Next.js Image component
  - [x] 2.12 Configurar tracking de analytics en botones CTA

- [x] 3.0 Rebranding Visual en Aplicación
  - [x] 3.1 Crear componente `/src/components/branding/MentorIALogo.tsx` con SVG o imagen optimizada
  - [x] 3.2 Reemplazar todas las referencias "FINCO" por "MentorIA" en componentes UI (usar búsqueda global)
  - [x] 3.3 Actualizar Navbar: logo, título y colores según paleta MentorIA
  - [x] 3.4 Actualizar Footer: copyright, enlaces y branding
  - [x] 3.5 Actualizar meta tags en `/src/app/layout.tsx` (title, description, favicon)
  - [x] 3.6 Crear nuevo favicon con logo MentorIA y agregarlo a `/public`
  - [x] 3.7 Actualizar colores de botones principales (CTAs) con gradiente MentorIA
  - [x] 3.8 Actualizar colores de chat bubbles (mensajes del asistente más cálidos)
  - [x] 3.9 Aumentar border-radius de cards a 12px para look más moderno
  - [x] 3.10 Verificar contraste de colores para accesibilidad WCAG 2.1 AA

- [ ] 4.0 Actualización de Prompts de IA
  - [ ] 4.1 Abrir `/lib/gemini/specialized-prompts.ts` y crear constante `MENTORIA_TONE_RULES`
  - [ ] 4.2 Actualizar función `getOnboardingContext()` para usar tono MentorIA (empático, simple, motivador)
  - [ ] 4.3 Actualizar función `getBudgetConversationalPrompt()` para enfocarse en micro-hábitos
  - [ ] 4.4 Cambiar presentación del agente de "FINCO" a "MentorIA" en mensajes de bienvenida
  - [ ] 4.5 Simplificar lenguaje: "gastos" en vez de "egresos", "dinero que entra" en vez de "flujo de efectivo"
  - [ ] 4.6 Agregar contexto a recomendaciones: "Sugiero X porque funciona para Y personas como tú"
  - [ ] 4.7 Actualizar mensajes de error para ser más humanos (ver ejemplos en PRD)
  - [ ] 4.8 Limitar respuestas a máximo 280 caracteres por mensaje
  - [ ] 4.9 Probar prompts con OpenAI y ajustar temperatura si es necesario
  - [ ] 4.10 Documentar cambios de tono en `/docs/mentoria-tone-guide.md`

- [ ] 5.0 Sistema de Micro-hábitos y Rachas
  - [ ] 5.1 Crear migración de Supabase: tabla `user_habits` con campos según PRD
  - [ ] 5.2 Crear migración de Supabase: índices en `user_id` y `habit_type`
  - [ ] 5.3 Implementar `/lib/habits/tracker.ts` con función `trackHabit(userId, habitType)`
  - [ ] 5.4 Implementar `/lib/habits/streaks.ts` con lógica de cálculo de rachas consecutivas
  - [ ] 5.5 Crear API route `/src/app/api/habits/[userId]/route.ts` - GET hábitos del usuario
  - [ ] 5.6 Crear API route `/src/app/api/habits/track/route.ts` - POST para registrar hábito completado
  - [ ] 5.7 Crear componente `/src/components/habits/HabitTracker.tsx` para mostrar hábitos activos
  - [ ] 5.8 Crear componente `/src/components/habits/StreakIndicator.tsx` con animación de fuego/racha
  - [ ] 5.9 Integrar `StreakIndicator` en dashboard principal (visible siempre)
  - [ ] 5.10 Implementar lógica: disparar `trackHabit()` cuando usuario registra gasto
  - [ ] 5.11 Implementar nudge: "Llevas 2 días sin registrar gastos. ¿Todo bien?"
  - [ ] 5.12 Implementar alerta: "¡Vas por 5 días! 2 más y desbloqueas badge de Constancia"

- [ ] 6.0 Sistema de Gamificación (Badges y Celebraciones)
  - [ ] 6.1 Crear migración de Supabase: tabla `badges` con criterios JSON
  - [ ] 6.2 Crear migración de Supabase: tabla `user_badges` con relación a usuarios
  - [ ] 6.3 Seedear tabla `badges` con 6 badges iniciales (ver PRD: Primer Paso, Racha de 3, etc.)
  - [ ] 6.4 Implementar `/lib/gamification/badges.ts` con función `checkBadgeCriteria(userId, badgeId)`
  - [ ] 6.5 Implementar `/lib/gamification/celebrations.ts` con función `celebrateAchievement()`
  - [ ] 6.6 Crear API route `/src/app/api/badges/[userId]/route.ts` - GET badges del usuario
  - [ ] 6.7 Crear API route `/src/app/api/badges/check/route.ts` - POST para verificar si ganó nuevo badge
  - [ ] 6.8 Crear componente `/src/components/gamification/BadgeCard.tsx` para mostrar badge ganado
  - [ ] 6.9 Crear componente `/src/components/gamification/CelebrationModal.tsx` con confetti y animación
  - [ ] 6.10 Integrar verificación de badges después de cada acción importante (completar onboarding, racha, meta)
  - [ ] 6.11 Mostrar `CelebrationModal` cuando usuario gane nuevo badge
  - [ ] 6.12 Crear sección "Mis Logros" en perfil de usuario para ver badges ganados
  - [ ] 6.13 Implementar celebraciones de texto (sin modal) para logros pequeños

- [ ] 7.0 Modo Freelancer
  - [ ] 7.1 Crear migración de Supabase: agregar columna `income_type` a tabla `users` (default: 'fixed')
  - [ ] 7.2 Actualizar pregunta en onboarding: "¿Tus ingresos son fijos o varían cada mes?"
  - [ ] 7.3 Implementar función `calculateFreelancerBudget()` en `/lib/budget/freelancer-calculator.ts`
  - [ ] 7.4 Calcular promedio de ingresos últimos 3-6 meses para presupuesto conservador
  - [ ] 7.5 Crear componente `/src/components/dashboard/FreelancerDashboard.tsx` con métricas específicas
  - [ ] 7.6 Mostrar "Ingreso promedio últimos 3 meses" en dashboard freelancer
  - [ ] 7.7 Mostrar "Proyección para mes actual" basada en tendencia
  - [ ] 7.8 Mostrar "Colchón de estabilidad" (ahorro recomendado = 3-6 meses gastos)
  - [ ] 7.9 Implementar alerta: "Este mes va bajo en ingresos. Activé modo conservador en tu presupuesto."
  - [ ] 7.10 Implementar alerta positiva: "¡Gran mes! ¿Apartamos algo extra para el fondo de estabilidad?"
  - [ ] 7.11 Crear sección "Bolsillos" visual en presupuesto freelancer (Impuestos 30%, Gastos fijos, Variables, Ahorro)
  - [ ] 7.12 Agregar toggle en perfil para cambiar entre modo fijo/variable/mixto

- [ ] 8.0 Migración de Usuarios Existentes
  - [ ] 8.1 Hacer BACKUP completo de base de datos de producción
  - [ ] 8.2 Crear script `/scripts/migrate-users-to-mentoria.ts` para migración
  - [ ] 8.3 En script: NO modificar datos existentes (budgets, transacciones, metas)
  - [ ] 8.4 En script: Agregar campo `income_type = 'fixed'` a usuarios existentes
  - [ ] 8.5 En script: Agregar campo `saw_migration_welcome = false` a usuarios existentes
  - [ ] 8.6 En script: Otorgar badge especial "Fundador" a usuarios pre-migración
  - [ ] 8.7 Crear página `/src/app/welcome-to-mentoria/page.tsx` con mensaje de bienvenida
  - [ ] 8.8 Implementar modal de bienvenida (una sola vez) al iniciar sesión si `saw_migration_welcome = false`
  - [ ] 8.9 En modal: Explicar cambios principales (tono, celebraciones, modo freelancer, rachas)
  - [ ] 8.10 En modal: Botón "Entendido, ¡vamos!" que actualiza `saw_migration_welcome = true`
  - [ ] 8.11 Probar script de migración en ambiente de desarrollo primero
  - [ ] 8.12 Ejecutar script de migración en producción (en horario de bajo tráfico)

- [ ] 9.0 Testing y QA
  - [ ] 9.1 Testing manual: Landing page responsive en mobile, tablet, desktop
  - [ ] 9.2 Testing manual: Flujo de onboarding completo con nuevo tono MentorIA
  - [ ] 9.3 Testing manual: Registro de primer gasto y aparición de celebración
  - [ ] 9.4 Testing manual: Racha de 3 días y obtención de badge
  - [ ] 9.5 Testing manual: Modo freelancer (cambiar tipo de ingreso y verificar dashboard)
  - [ ] 9.6 Testing manual: Modal de bienvenida para usuarios migrados
  - [ ] 9.7 Testing de accesibilidad: navegación por teclado en landing y app
  - [ ] 9.8 Testing de accesibilidad: contraste de colores con herramienta (WAVE o Lighthouse)
  - [ ] 9.9 Performance: Lighthouse score de landing page (objetivo: >90)
  - [ ] 9.10 Performance: Verificar tamaño de bundle (no debe aumentar >15%)
  - [ ] 9.11 Testing cross-browser: Chrome, Safari, Firefox, Edge
  - [ ] 9.12 Testing de regresión: Verificar que funcionalidades existentes sigan funcionando
  - [ ] 9.13 User Acceptance Testing: 3-5 usuarios beta prueban por 2 días y dan feedback

- [ ] 10.0 Deployment y Lanzamiento
  - [ ] 10.1 Ejecutar `npm run build` localmente y verificar que no haya errores
  - [ ] 10.2 Revisar y resolver todos los warnings de build
  - [ ] 10.3 Actualizar variables de entorno en Vercel (si aplica)
  - [ ] 10.4 Deploy a ambiente de staging primero
  - [ ] 10.5 Prueba completa en staging (onboarding, chat, gamificación, modo freelancer)
  - [ ] 10.6 Ejecutar script de migración de usuarios en producción
  - [ ] 10.7 Deploy a producción desde rama `main`
  - [ ] 10.8 Monitoreo post-deploy (15 min): verificar logs, errores, performance
  - [ ] 10.9 Smoke testing en producción: landing page, login, onboarding básico
  - [ ] 10.10 Enviar comunicación a usuarios existentes vía email (opcional)
  - [ ] 10.11 Publicar post en redes sociales anunciando MentorIA
  - [ ] 10.12 Configurar monitoreo de métricas clave (conversión landing, retención D1, NPS)

---

**Estado:** ✅ Ready to Start Implementation  
**Total Sub-tareas:** 113  
**Próximo Paso:** Empezar con tarea 1.1 y pedir confirmación después de cada sub-tarea

