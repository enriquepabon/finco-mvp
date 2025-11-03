# Task List: FINCO - Implementación de Mejoras

**Basado en**: OPORTUNIDADES_MEJORA.md, PLAN_IMPLEMENTACION.md
**Fecha de creación**: 3 de Noviembre, 2025
**Objetivo**: Implementar 19 oportunidades de mejora para llevar FINCO a nivel enterprise-ready

---

## Relevant Files

*(Se actualizará durante la implementación)*

### Archivos a Modificar/Crear:
- `next.config.ts` - Configuración de CORS y headers
- `middleware.ts` - Middleware de autenticación centralizado
- `lib/env.ts` - Validación de variables de entorno con Zod
- `lib/logger.ts` - Sistema de logging configurable
- `lib/cache/gemini-cache.ts` - Sistema de caché para respuestas de IA
- `lib/rate-limit.ts` - Rate limiting con Upstash
- `vitest.config.ts` - Configuración de testing
- `src/__tests__/setup.ts` - Setup de tests
- `.github/workflows/ci.yml` - Pipeline de CI/CD
- `Dockerfile` - Containerización con Docker
- `docker-compose.yml` - Orquestación local
- `.env.example` - Template de variables de entorno
- `sentry.client.config.ts` - Monitoreo de errores

### Tests a Crear:
- `src/__tests__/parsers/onboarding-parser.test.ts` - Tests para parsers de onboarding
- `src/__tests__/parsers/transaction-parser.test.ts` - Tests para parser de transacciones
- `src/__tests__/parsers/budget-parser.test.ts` - Tests para parser de presupuestos
- `src/__tests__/api/chat.test.ts` - Tests para API de chat
- `src/__tests__/api/transactions.test.ts` - Tests para API de transacciones

### Notas:
- Los tests se colocarán en `src/__tests__/` siguiendo la estructura del código fuente
- Usar `npm run test` para ejecutar todos los tests
- Usar `npm run test:watch` para modo watch durante desarrollo
- Cada parent task debe committearse solo después de que todos sus sub-tasks pasen los tests

---

## Tasks

### Sprint 1: Seguridad Crítica (Semana 1-2)

- [ ] 1.0 **Seguridad Crítica** - Eliminar vulnerabilidades de seguridad activas y fortalecer la autenticación
  - [ ] 1.1 Arreglar CORS con wildcard en next.config.ts
  - [ ] 1.2 Crear variable de entorno NEXT_PUBLIC_APP_URL en .env
  - [ ] 1.3 Configurar headers CORS específicos (Allow-Origin, Allow-Methods, Allow-Headers)
  - [ ] 1.4 Agregar lógica condicional para dev vs prod
  - [ ] 1.5 Probar CORS en localhost y verificar rechazo de orígenes no autorizados
  - [ ] 1.6 Instalar @supabase/auth-helpers-nextjs para middleware
  - [ ] 1.7 Crear archivo middleware.ts en la raíz del proyecto
  - [ ] 1.8 Implementar verificación de sesión con createMiddlewareClient
  - [ ] 1.9 Configurar matcher para proteger /api/* y /dashboard/*
  - [ ] 1.10 Remover código duplicado de validación de auth en API routes (~10 archivos)
  - [ ] 1.11 Probar con usuario autenticado y no autenticado
  - [ ] 1.12 Instalar zod para validación de esquemas
  - [ ] 1.13 Crear lib/env.ts con schema de validación de todas las env vars
  - [ ] 1.14 Reemplazar todas las referencias process.env.X! con importaciones de env.X
  - [ ] 1.15 Crear archivo .env.example con todas las variables requeridas
  - [ ] 1.16 Actualizar README.md con instrucciones de configuración de env vars
  - [ ] 1.17 Identificar todos los campos 'debug' en API route responses
  - [ ] 1.18 Agregar condicional NODE_ENV === 'development' para campos debug
  - [ ] 1.19 Probar en modo producción que no se exponga info sensible
  - [ ] 1.20 Verificar que responses en prod solo contengan datos necesarios

### Sprint 2: Performance y Optimización (Semana 3-4)

- [ ] 2.0 **Performance y Optimización** - Reducir bundle size, optimizar respuestas de API y agregar rate limiting
  - [ ] 2.1 Verificar que paquetes no se usen: buscar imports de zustand, web-push, three
  - [ ] 2.2 Ejecutar: npm uninstall zustand web-push three @react-three/fiber @react-three/drei lottie-react
  - [ ] 2.3 Ejecutar npm run build y verificar que no haya errores
  - [ ] 2.4 Medir bundle size antes y después (next build con análisis)
  - [ ] 2.5 Actualizar documentación removiendo referencias a paquetes eliminados
  - [ ] 2.6 Crear cuenta en Upstash Redis (https://upstash.com)
  - [ ] 2.7 Instalar @upstash/redis
  - [ ] 2.8 Agregar UPSTASH_REDIS_URL y UPSTASH_REDIS_TOKEN a .env y env.ts
  - [ ] 2.9 Crear lib/cache/gemini-cache.ts con funciones getCached y setCached
  - [ ] 2.10 Implementar función de hash para generar cache keys (prompt + context)
  - [ ] 2.11 Integrar caché en lib/gemini/client.ts (sendMessageToGemini)
  - [ ] 2.12 Agregar caché a /api/chat, /api/budget-chat, /api/profile-edit-chat
  - [ ] 2.13 Configurar TTL de 1 hora (3600 segundos)
  - [ ] 2.14 Probar que respuestas en caché sean instantáneas
  - [ ] 2.15 Instalar @upstash/ratelimit
  - [ ] 2.16 Crear lib/rate-limit.ts con función checkRateLimit
  - [ ] 2.17 Configurar límite de 10 requests por 10 segundos por usuario
  - [ ] 2.18 Integrar rate limiting en todas las API routes críticas
  - [ ] 2.19 Agregar headers X-RateLimit-Limit, X-RateLimit-Remaining en responses
  - [ ] 2.20 Manejar error 429 con mensaje amigable al usuario
  - [ ] 2.21 Probar haciendo múltiples requests rápidos y verificar bloqueo
  - [ ] 2.22 Instalar svgo como devDependency
  - [ ] 2.23 Optimizar Financial Robot.svg con: npx svgo "Financial Robot.svg" -o "public/financial-robot.svg"
  - [ ] 2.24 Medir reducción de tamaño del SVG
  - [ ] 2.25 Mover otros assets a public/ si no están ahí
  - [ ] 2.26 Identificar componentes con <img> y reemplazar con next/image donde aplique
  - [ ] 2.27 Verificar lazy loading y performance con Lighthouse

### Sprint 3: Testing y CI/CD (Semana 5-6)

- [ ] 3.0 **Testing y CI/CD** - Implementar suite de tests automatizados y pipeline de integración continua
  - [ ] 3.1 Instalar vitest, @testing-library/react, @testing-library/jest-dom, @vitejs/plugin-react
  - [ ] 3.2 Crear vitest.config.ts con configuración para Next.js
  - [ ] 3.3 Crear src/__tests__/setup.ts con imports de testing-library
  - [ ] 3.4 Agregar scripts "test", "test:watch", "test:coverage" a package.json
  - [ ] 3.5 Crear test dummy (src/__tests__/example.test.ts) para verificar setup
  - [ ] 3.6 Ejecutar npm run test y verificar que funcione
  - [ ] 3.7 Crear src/__tests__/parsers/onboarding-parser.test.ts
  - [ ] 3.8 Escribir tests para parseColombianCurrency (15 casos: millones, miles, decimales, edge cases)
  - [ ] 3.9 Escribir tests para parseAge (10 casos: rangos válidos, strings, edge cases)
  - [ ] 3.10 Escribir tests para parseCivilStatus (8 casos: variaciones de estados civiles)
  - [ ] 3.11 Escribir tests para parseChildrenCount (10 casos: números, "no tengo", edge cases)
  - [ ] 3.12 Escribir tests para parseFullName (8 casos: capitalización, nombres compuestos)
  - [ ] 3.13 Ejecutar npm run test:coverage y verificar >80% en parsers
  - [ ] 3.14 Crear src/__tests__/api/chat.test.ts con msw para mocking
  - [ ] 3.15 Mockear Supabase client y métodos de auth
  - [ ] 3.16 Mockear Gemini AI responses
  - [ ] 3.17 Escribir test: POST /api/chat con mensaje válido retorna respuesta
  - [ ] 3.18 Escribir test: POST /api/chat sin token retorna 401
  - [ ] 3.19 Escribir test: POST /api/chat guarda datos parseados en DB
  - [ ] 3.20 Crear src/__tests__/api/transactions.test.ts
  - [ ] 3.21 Escribir tests para GET, POST, PUT, DELETE de transacciones
  - [ ] 3.22 Verificar cobertura >60% en API routes
  - [ ] 3.23 Crear directorio .github/workflows/
  - [ ] 3.24 Crear .github/workflows/ci.yml con jobs: lint, type-check, test, build
  - [ ] 3.25 Configurar workflow para ejecutar en push y pull_request a main
  - [ ] 3.26 Agregar cache de node_modules en workflow
  - [ ] 3.27 Agregar badge de status de CI al README.md
  - [ ] 3.28 Hacer push y verificar que el workflow se ejecute en GitHub Actions

### Sprint 4: Calidad de Código (Semana 7-8)

- [ ] 4.0 **Calidad de Código** - Mejorar tipado, eliminar código duplicado y estandarizar logging
  - [ ] 4.1 Crear lib/logger.ts con clase Logger configurable por nivel
  - [ ] 4.2 Implementar métodos: debug, info, warn, error con timestamps
  - [ ] 4.3 Agregar lógica para enviar errors a Sentry en producción (preparación)
  - [ ] 4.4 Configurar logger para solo mostrar debug en development
  - [ ] 4.5 Identificar todos los console.log en el proyecto (usar grep)
  - [ ] 4.6 Reemplazar console.log con logger.debug en archivos de lib/
  - [ ] 4.7 Reemplazar console.error con logger.error en todo el proyecto
  - [ ] 4.8 Reemplazar console.warn con logger.warn donde aplique
  - [ ] 4.9 Verificar en modo production que solo aparezcan errors en consola
  - [ ] 4.10 Probar que logs incluyan contexto útil (user_id, operation, etc)
  - [ ] 4.11 Crear src/types/chat.ts con interfaces ChatMessage, ChatResponse, ChatHistory
  - [ ] 4.12 Crear src/types/onboarding.ts con interface OnboardingData completa
  - [ ] 4.13 Crear src/types/budget.ts con interfaces Budget, BudgetCategory, Transaction
  - [ ] 4.14 Identificar todos los ': any' en el proyecto (usar grep)
  - [ ] 4.15 Reemplazar 'any' con tipos específicos en API routes
  - [ ] 4.16 Reemplazar 'any' con tipos específicos en componentes
  - [ ] 4.17 Reemplazar 'any' con tipos específicos en lib/parsers
  - [ ] 4.18 Ejecutar npm run type-check y resolver todos los errores
  - [ ] 4.19 Verificar que IDE muestre autocomplete mejorado
  - [ ] 4.20 Crear src/components/chat/BaseChatInterface.tsx con props genéricas
  - [ ] 4.21 Extraer lógica compartida: useState para messages, loading, error
  - [ ] 4.22 Crear custom hooks: useChat, useChatHistory, useChatSubmit
  - [ ] 4.23 Refactorizar ChatInterface.tsx para usar BaseChatInterface
  - [ ] 4.24 Refactorizar BudgetChatInterface.tsx para usar BaseChatInterface
  - [ ] 4.25 Refactorizar ProfileEditChatInterface.tsx para usar BaseChatInterface
  - [ ] 4.26 Refactorizar SpecializedChatInterface.tsx para usar BaseChatInterface
  - [ ] 4.27 Eliminar código duplicado (medir reducción de líneas)
  - [ ] 4.28 Probar que todos los componentes de chat funcionen correctamente
  - [ ] 4.29 Agregar JSDoc a lib/parsers/onboarding-parser.ts (cada función)
  - [ ] 4.30 Agregar JSDoc a lib/gemini/client.ts con ejemplos de uso
  - [ ] 4.31 Agregar JSDoc a lib/cache/gemini-cache.ts
  - [ ] 4.32 Agregar JSDoc a funciones críticas de API routes
  - [ ] 4.33 Verificar que IDE muestre documentación al hacer hover

### Sprint 5: Accesibilidad e Infraestructura (Semana 9-10)

- [ ] 5.0 **Accesibilidad e Infraestructura** - Mejorar accesibilidad, agregar Docker y monitoreo de errores
  - [ ] 5.1 Identificar todos los botones sin texto visible (solo iconos)
  - [ ] 5.2 Agregar aria-label descriptivo a todos los botones de iconos
  - [ ] 5.3 Agregar aria-pressed a botones toggle (ej: voice recording)
  - [ ] 5.4 Identificar inputs sin labels asociados
  - [ ] 5.5 Agregar <label> con htmlFor o aria-label a todos los inputs
  - [ ] 5.6 Crear clases CSS para sr-only (screen reader only)
  - [ ] 5.7 Implementar navegación con Tab en modales y formularios
  - [ ] 5.8 Agregar handler onKeyDown para cerrar modal con Escape
  - [ ] 5.9 Agregar handler onKeyDown para enviar mensaje con Enter (sin Shift)
  - [ ] 5.10 Implementar trap de focus en modales abiertos
  - [ ] 5.11 Agregar focus indicators visibles (outline) a elementos interactivos
  - [ ] 5.12 Probar navegación completa con teclado (sin mouse)
  - [ ] 5.13 Ejecutar Lighthouse audit y revisar score de accesibilidad
  - [ ] 5.14 Corregir issues reportados por Lighthouse (meta 90+)
  - [ ] 5.15 Crear Dockerfile multi-stage (deps, builder, runner)
  - [ ] 5.16 Configurar NODE_ENV=production en Dockerfile
  - [ ] 5.17 Crear .dockerignore con node_modules, .git, .next
  - [ ] 5.18 Crear docker-compose.yml con servicio web en puerto 3000
  - [ ] 5.19 Probar build: docker build -t finco-mvp .
  - [ ] 5.20 Probar ejecución: docker run -p 3000:3000 finco-mvp
  - [ ] 5.21 Agregar instrucciones de Docker al README.md
  - [ ] 5.22 Crear cuenta en Sentry (https://sentry.io)
  - [ ] 5.23 Instalar @sentry/nextjs
  - [ ] 5.24 Ejecutar npx @sentry/wizard --integration nextjs
  - [ ] 5.25 Configurar SENTRY_DSN en .env y env.ts
  - [ ] 5.26 Crear sentry.client.config.ts y sentry.server.config.ts
  - [ ] 5.27 Agregar Sentry.captureException en bloques catch críticos
  - [ ] 5.28 Configurar source maps para mejor debugging
  - [ ] 5.29 Probar captura de error lanzando excepción de prueba
  - [ ] 5.30 Configurar alertas de email para errores críticos en Sentry
  - [ ] 5.31 Revisar que todos los parent tasks estén completados
  - [ ] 5.32 Ejecutar suite completa de tests una última vez
  - [ ] 5.33 Verificar métricas finales: bundle size, coverage, Lighthouse
  - [ ] 5.34 Actualizar documentación con nuevas características implementadas

---

## Progress Tracking

**Status**: ✅ Sub-tasks generados - Listo para implementación

**Estadísticas**:
- Parent tasks completados: 0/5
- Sub-tasks completados: 0/120
- Commits realizados: 2 (análisis + task list)

**Desglose por Sprint**:
- Sprint 1 (Seguridad): 0/20 sub-tasks
- Sprint 2 (Performance): 0/27 sub-tasks
- Sprint 3 (Testing): 0/28 sub-tasks
- Sprint 4 (Calidad): 0/33 sub-tasks
- Sprint 5 (A11y & Infra): 0/34 sub-tasks

**Próximo sub-task**: 1.1 - Arreglar CORS con wildcard en next.config.ts

**Última actualización**: 3 de Noviembre, 2025

---

## Notes

- **Metodología**: Una sub-task a la vez, esperando aprobación del usuario antes de continuar
- **Testing**: Ejecutar suite completa de tests antes de cada commit
- **Commits**: Usar formato conventional commits (feat:, fix:, refactor:, test:, docs:)
- **Git workflow**: Trabajar en branch `claude/review-project-improvements-011CUmp2RqbnWPVGwvNcVgbx`
- **Target**: Desarrollador junior debería poder seguir este plan paso a paso
