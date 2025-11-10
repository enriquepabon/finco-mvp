# Task List - MentorIA: Mejoras y Optimizaciones Post-Reestructuración

**Proyecto:** MentorIA - Plataforma de Gestión Financiera Personal  
**Fase:** Optimizaciones y Funcionalidades Avanzadas  
**Fecha Inicio:** Noviembre 8, 2025  
**Estado:** Planificación

---

## Contexto del Proyecto

El proyecto de reestructuración base está **100% completado**. Este documento detalla las mejoras y funcionalidades adicionales para llevar MentorIA al siguiente nivel.

**Reestructuración Completada:**
- ✅ Nueva estructura de categorías (income/expense/savings)
- ✅ Clasificación de gastos (fijo/variable, esencial/no esencial)
- ✅ Visualización presupuesto vs real con progress bars
- ✅ Dashboard con 4 KPIs y 4 gráficos avanzados
- ✅ Reporte financiero con IA (GPT-4o-mini)
- ✅ Transacciones con campo de detalle
- ✅ Edición de categorías/subcategorías en tiempo real

---

## 📋 Tareas Principales

### 1. Optimizaciones de UX del Reporte de IA

**Objetivo:** Mejorar la experiencia del usuario al interactuar con el reporte financiero con IA.

#### 1.1 ~~Regenerar Reporte~~ ✅ YA IMPLEMENTADO
- [x] ~~Agregar botón "🔄 Regenerar Reporte"~~ - Se regenera automáticamente al abrir modal
- [x] ~~Implementar lógica para generar nuevo reporte~~ - Ya existe en useEffect
- **NOTA:** Actualmente se genera un nuevo reporte cada vez que se abre el modal.
- **MEJORA OPCIONAL:** Agregar botón manual "🔄 Regenerar" para regenerar sin cerrar/abrir modal
- **MEJORA OPCIONAL:** Cachear reporte y solo regenerar si han pasado X minutos

#### 1.2 Exportar Reporte a PDF ✅ COMPLETADO
- [x] Instalar dependencia `jsPDF` y `html2canvas`
- [x] Crear función `exportReportToPDF()` en `FinancialReportModal`
- [x] Diseñar template PDF con logo y branding de MentorIA
- [x] Incluir todas las secciones del reporte en PDF
- [x] Agregar gráficos y visualizaciones al PDF (captura completa del modal)
- [x] Agregar botón "📥 Descargar PDF" en el modal
- [x] Implementar nombre de archivo dinámico: `MentorIA_Reporte_MM_YYYY.pdf`
- [x] **FIX**: Eliminar `html2canvas` (incompatible con Tailwind v4+ que usa `lab()`)
- [x] **FIX**: Reescribir usando solo `jsPDF` con texto estructurado nativo

**Notas Técnicas**:
- Solución final: Solo `jsPDF` sin captura de pantalla
- Razón: `html2canvas` no soporta `lab()`, `oklch()` de Tailwind CSS v4+
- PDF incluye: Header, Salud Financiera, Resumen, Presupuesto vs Real, 50/30/20, Recomendaciones, Áreas de Mejora, Objetivos, Footer
- Soporte automático de múltiples páginas con `checkPageBreak()`
- Texto con wrapping automático usando `pdf.splitTextToSize()`

#### 1.3 Compartir Reporte por Email
- [x] Crear endpoint `/api/send-report-email`
- [x] Integrar con servicio de email Resend
- [x] Diseñar template HTML de email con el reporte
- [x] Agregar botón "📧 Enviar por Email" en el modal
- [x] Crear modal de confirmación con input de email
- [x] Validar email antes de enviar
- [x] Mostrar notificación de éxito/error
- [x] Guardar registro de emails enviados en `report_emails` table
- [x] Crear migración para tabla `report_emails`

#### 1.4 Notificaciones de Progreso
- [ ] Instalar librería de notificaciones (react-hot-toast o similar)
- [ ] Agregar notificación al iniciar generación de reporte
- [ ] Agregar notificación al completar generación
- [ ] Agregar notificación en caso de error
- [ ] Agregar notificación al exportar PDF
- [ ] Agregar notificación al enviar email

#### 1.5 Historial de Reportes
- [ ] Crear tabla `financial_reports_history` en Supabase
- [ ] Agregar columnas: `id`, `user_id`, `budget_id`, `report_data`, `generated_at`
- [ ] Modificar endpoint para guardar reporte en historial
- [ ] Crear componente `ReportHistoryModal`
- [ ] Agregar botón "📚 Ver Historial" en dashboard
- [ ] Implementar lista de reportes anteriores
- [ ] Permitir ver/descargar reportes anteriores
- [ ] Agregar opción de eliminar reportes antiguos

---

### 2. Análisis Avanzados y Comparaciones

**Objetivo:** Proporcionar insights más profundos mediante comparaciones temporales y tendencias.

#### 2.1 Comparación Mes a Mes
- [ ] Crear endpoint `/api/budget-comparison` que reciba rango de meses
- [ ] Consultar múltiples presupuestos de la base de datos
- [ ] Calcular deltas entre meses (ingresos, gastos, ahorros)
- [ ] Crear componente `BudgetComparisonChart`
- [ ] Implementar gráfico de líneas con Recharts
- [ ] Mostrar tendencias ascendentes/descendentes con iconos
- [ ] Agregar selector de rango de meses (últimos 3, 6, 12 meses)
- [ ] Integrar en dashboard como nueva sección

#### 2.2 Tendencias y Proyecciones
- [ ] Implementar algoritmo de regresión lineal simple
- [ ] Crear función `calculateTrend()` para ingresos, gastos, ahorros
- [ ] Proyectar valores para los próximos 3 meses
- [ ] Crear componente `TrendProjectionCard`
- [ ] Visualizar proyección con área sombreada en gráfico
- [ ] Agregar indicadores de confianza (alta/media/baja)
- [ ] Mostrar alertas si proyección indica problemas

#### 2.3 Predicción de Gastos Futuros
- [ ] Analizar patrones históricos de gastos por categoría
- [ ] Identificar gastos recurrentes y su frecuencia
- [ ] Crear endpoint `/api/predict-expenses`
- [ ] Implementar lógica de predicción basada en promedio móvil
- [ ] Crear componente `ExpensePredictionWidget`
- [ ] Mostrar próximos gastos esperados con fechas estimadas
- [ ] Agregar a dashboard como widget lateral

#### 2.4 Recomendaciones Proactivas con IA
- [ ] Modificar prompt de GPT-4o-mini para incluir análisis histórico
- [ ] Agregar detección de anomalías en gastos
- [ ] Generar alertas cuando gasto supera promedio en X%
- [ ] Crear endpoint `/api/proactive-insights`
- [ ] Implementar sistema de notificaciones push (opcional)
- [ ] Mostrar insights en tiempo real en dashboard
- [ ] Crear componente `ProactiveInsightCard`

#### 2.5 Score de Salud Financiera Histórico
- [ ] Guardar score de salud financiera en cada reporte
- [ ] Crear gráfico de evolución del score
- [ ] Mostrar mejoras/declives con feedback visual
- [ ] Agregar benchmarks (promedio de usuarios similares)
- [ ] Crear componente `HealthScoreHistory`

---

### 3. Mejoras Visuales y de Diseño

**Objetivo:** Refinar la interfaz para una experiencia más moderna, intuitiva y atractiva.

#### 3.1 Más Gráficos Interactivos
- [ ] Agregar tooltips personalizados a todos los gráficos
- [ ] Implementar zoom en gráficos de líneas
- [ ] Agregar interactividad en gráficos de pie (expandir slice al hover)
- [ ] Crear gráfico de área apilada para distribución de gastos
- [ ] Agregar gráfico de cascada (waterfall) para flujo de efectivo
- [ ] Implementar mini-gráficos (sparklines) en KPI cards

#### 3.2 Responsive Design Mejorado
- [ ] Auditar diseño en móvil (375px, 414px)
- [ ] Auditar diseño en tablet (768px, 1024px)
- [ ] Reorganizar KPIs en grid 2x2 para móvil
- [ ] Convertir tablas grandes en cards en móvil
- [ ] Implementar drawer lateral para navegación en móvil
- [ ] Optimizar modales para pantallas pequeñas
- [ ] Agregar gestos táctiles (swipe para cerrar modales)

#### 3.3 Modo Oscuro
- [ ] Instalar `next-themes` para gestión de temas
- [ ] Definir paleta de colores para dark mode
- [ ] Crear variables CSS/Tailwind para ambos temas
- [ ] Implementar toggle de tema en navbar
- [ ] Actualizar todos los componentes para soportar dark mode
- [ ] Ajustar gráficos para dark mode (colores de líneas/áreas)
- [ ] Guardar preferencia de tema en localStorage
- [ ] Respetar preferencia del sistema operativo

#### 3.4 Animaciones y Transiciones
- [ ] Instalar `framer-motion` para animaciones
- [ ] Agregar animación de entrada a KPI cards (stagger)
- [ ] Animar transición entre meses en selector
- [ ] Agregar animación a progress bars (fill animation)
- [ ] Implementar skeleton loaders durante carga de datos
- [ ] Animar aparición de modales con slide/fade
- [ ] Agregar micro-interacciones en botones (ripple effect)

#### 3.5 Mejoras de Accesibilidad
- [ ] Auditar contraste de colores (WCAG AA compliance)
- [ ] Agregar labels ARIA a todos los componentes interactivos
- [ ] Implementar navegación por teclado en modales
- [ ] Agregar focus visible en todos los elementos interactivos
- [ ] Implementar skip navigation links
- [ ] Agregar texto alternativo a todos los gráficos
- [ ] Testear con screen reader (VoiceOver/NVDA)

---

### 4. Funcionalidades Adicionales Avanzadas

**Objetivo:** Expandir las capacidades de la plataforma con funcionalidades de alto valor.

#### 4.1 Transacciones Recurrentes
- [ ] Crear tabla `recurring_transactions` en Supabase
- [ ] Definir schema: `id`, `user_id`, `budget_id`, `frequency`, `next_date`, etc.
- [ ] Implementar tipos de frecuencia (semanal, quincenal, mensual, anual)
- [ ] Crear componente `RecurringTransactionModal`
- [ ] Agregar botón "🔁 Configurar Recurrente" en transaction modals
- [ ] Implementar lógica de creación automática de transacciones
- [ ] Crear endpoint `/api/process-recurring-transactions` (cron job)
- [ ] Agregar sección "Transacciones Recurrentes" en dashboard
- [ ] Permitir editar/pausar/eliminar transacciones recurrentes
- [ ] Agregar notificación antes de crear transacción recurrente

#### 4.2 Escaneo de Recibos con OCR
- [ ] Investigar APIs de OCR (Tesseract.js, Google Vision, Azure)
- [ ] Crear endpoint `/api/scan-receipt`
- [ ] Implementar upload de imagen (foto del recibo)
- [ ] Procesar imagen con OCR para extraer monto, fecha, comercio
- [ ] Usar GPT-4o-mini para categorizar basado en comercio
- [ ] Crear componente `ReceiptScannerModal`
- [ ] Agregar botón "📸 Escanear Recibo" en transaction modals
- [ ] Mostrar preview de la imagen
- [ ] Permitir editar datos extraídos antes de guardar
- [ ] Guardar imagen del recibo en Supabase Storage

#### 4.3 Integración Bancaria (Open Banking)
- [ ] Investigar proveedores (Plaid, Belvo, Fintoc)
- [ ] Crear cuenta de desarrollador con proveedor seleccionado
- [ ] Implementar flujo de autenticación bancaria
- [ ] Crear tabla `bank_connections` en Supabase
- [ ] Crear endpoint `/api/connect-bank`
- [ ] Crear componente `BankConnectionModal`
- [ ] Implementar sincronización automática de transacciones
- [ ] Crear endpoint `/api/sync-bank-transactions`
- [ ] Mapear transacciones bancarias a categorías de presupuesto
- [ ] Mostrar saldo bancario en tiempo real en dashboard
- [ ] Agregar sección "Cuentas Conectadas" en configuración
- [ ] Implementar desconexión y reconexión de cuentas

#### 4.4 Presupuestos Compartidos (Multi-usuario)
- [ ] Crear tabla `budget_members` en Supabase
- [ ] Implementar roles: owner, editor, viewer
- [ ] Crear endpoint `/api/invite-member`
- [ ] Crear componente `InviteMemberModal`
- [ ] Implementar envío de invitación por email
- [ ] Crear página de aceptación de invitación
- [ ] Implementar permisos basados en roles
- [ ] Agregar avatares de miembros en header del presupuesto
- [ ] Mostrar quién creó cada transacción
- [ ] Implementar log de actividad (audit trail)
- [ ] Agregar notificaciones cuando otro miembro edita presupuesto

#### 4.5 Metas de Ahorro con Seguimiento
- [ ] Ampliar funcionalidad de categorías de "Ahorros"
- [ ] Agregar campos: `target_date`, `monthly_contribution`, `progress_pct`
- [ ] Crear componente `SavingsGoalCard` con visual de progreso
- [ ] Implementar cálculo de cuánto falta para alcanzar meta
- [ ] Mostrar fecha estimada de cumplimiento
- [ ] Agregar celebración visual al alcanzar meta (confetti)
- [ ] Crear gráfico de proyección de ahorro
- [ ] Agregar recomendaciones de IA para alcanzar metas más rápido

#### 4.6 Sistema de Alertas Personalizables
- [ ] Crear tabla `user_alerts` en Supabase
- [ ] Definir tipos de alerta: presupuesto excedido, meta alcanzada, etc.
- [ ] Crear componente `AlertConfigurationModal`
- [ ] Permitir configurar umbrales personalizados
- [ ] Implementar notificaciones en app (toast)
- [ ] Implementar notificaciones por email (opcional)
- [ ] Agregar badge de alertas en navbar
- [ ] Crear página de centro de notificaciones
- [ ] Implementar marca como leído/archivado

---

## 🗂️ Archivos Relevantes

### Backend (API Routes)
- `src/app/api/generate-financial-report/route.ts` - Generación de reportes con IA
- `src/app/api/send-report-email/route.ts` - Envío de reportes por email

### Frontend (Components)
- `src/components/reports/FinancialReportModal.tsx` - Modal de reporte financiero con exportación a PDF y envío por email
- `src/app/dashboard/budget/[budgetId]/page.tsx` - Dashboard principal

### Database (Migrations)
- `supabase/migrations/` - Migraciones de base de datos
- `supabase/migrations/20251108000005_create_report_emails_table.sql` - Tabla para registro de emails

### Types
- `src/types/transaction.ts` - Tipos de transacciones
- `src/types/budget.ts` - Tipos de presupuesto

### Dependencies
- `jspdf` - Generación de documentos PDF
- `html2canvas` - Captura de HTML como imágenes para PDF
- `resend` - Servicio de envío de emails

---

## 📝 Notas y Consideraciones

### Priorización Sugerida
1. **Alta Prioridad:** Optimizaciones de UX del Reporte (Tarea 1)
2. **Media Prioridad:** Mejoras Visuales (Tarea 3)
3. **Media Prioridad:** Análisis Avanzados (Tarea 2)
4. **Baja Prioridad:** Funcionalidades Adicionales (Tarea 4)

### Dependencias Externas
- **jsPDF** o **react-pdf** - Para exportar PDF
- **Resend** o **SendGrid** - Para envío de emails
- **react-hot-toast** - Para notificaciones
- **framer-motion** - Para animaciones
- **next-themes** - Para dark mode
- **Plaid/Belvo/Fintoc** - Para integración bancaria
- **Tesseract.js** o **Google Vision** - Para OCR

### Estimación de Tiempo (Aproximada)
- **Tarea 1 (UX del Reporte):** 3-4 días
- **Tarea 2 (Análisis Avanzados):** 5-7 días
- **Tarea 3 (Mejoras Visuales):** 4-5 días
- **Tarea 4 (Funcionalidades Adicionales):** 10-15 días

**Total Estimado:** 22-31 días de desarrollo

---

## 🚀 Próximos Pasos

**Esperando confirmación del usuario para comenzar con la primera tarea.**

Una vez confirmado, se procederá a:
1. Trabajar en sub-tareas de manera secuencial
2. Solicitar aprobación después de cada sub-tarea
3. Actualizar este documento con el progreso
4. Hacer commits siguiendo conventional commits
5. Ejecutar tests antes de cada commit de tarea completa

---

**Última Actualización:** 2025-11-08  
**Responsable:** AI Assistant + Usuario  
**Estado del Proyecto:** 🟢 Base Completada - Listo para Optimizaciones

