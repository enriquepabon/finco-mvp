# 🧪 Guía de Testing de Accesibilidad - FINCO

Esta guía te ayudará a probar las mejoras de accesibilidad implementadas en Sprint 5.

## 📋 Checklist de Testing

- [ ] Levantar aplicación en desarrollo
- [ ] Ejecutar Lighthouse Audit
- [ ] Probar navegación con teclado
- [ ] Probar lectores de pantalla (opcional)
- [ ] Documentar resultados

---

## 🚀 Paso 1: Levantar la Aplicación

### 1.1 Instalar dependencias (si aún no lo hiciste)

```bash
npm install
```

### 1.2 Verificar que tienes el archivo `.env.local` configurado

Necesitas al menos:
```bash
NEXT_PUBLIC_SUPABASE_URL=tu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key
GOOGLE_GEMINI_API_KEY=tu-api-key
```

### 1.3 Ejecutar en modo desarrollo

```bash
npm run dev
```

**Espera a que veas:**
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

### 1.4 Abrir en el navegador

Abre **Google Chrome** (preferible para Lighthouse) en:
```
http://localhost:3000
```

---

## 🔍 Paso 2: Ejecutar Lighthouse Audit

### 2.1 Abrir Chrome DevTools

**Windows/Linux:** `F12` o `Ctrl+Shift+I`
**Mac:** `Cmd+Option+I`

### 2.2 Ir a la pestaña "Lighthouse"

Si no la ves, busca en el menú `>>` (más herramientas).

### 2.3 Configurar el audit

✅ **Seleccionar:**
- [x] Navigation (Default)
- [x] Desktop (o Mobile, prueba ambos si quieres)

✅ **Categorías a auditar:**
- [x] **Accessibility** ← ¡Esto es lo importante!
- [ ] Performance (opcional)
- [ ] Best Practices (opcional)
- [ ] SEO (opcional)

### 2.4 Ejecutar el audit

1. Click en **"Analyze page load"**
2. Espera 10-30 segundos mientras Lighthouse analiza
3. Revisa los resultados

### 2.5 Revisar el Score de Accesibilidad

**Target: 90+ puntos** 🎯

**Resultados esperados:**
- ✅ Verde (90-100): ¡Excelente!
- 🟡 Naranja (50-89): Necesita mejoras
- 🔴 Rojo (0-49): Problemas serios

### 2.6 Revisar Issues Específicos

Lighthouse te mostrará:
- **Passed audits** (✅ verde): Lo que está bien
- **Manual checks** (🔵 azul): Revisar manualmente
- **Failed audits** (❌ rojo): **IMPORTANTE - Documentar estos**

### 2.7 Exportar el reporte (opcional)

Click en el ícono de **download** (⬇️) arriba a la derecha para guardar el reporte HTML.

---

## ⌨️ Paso 3: Testing de Navegación con Teclado

### 3.1 Cerrar todos los modales primero

Asegúrate de estar en la página principal sin modales abiertos.

### 3.2 Testing Básico - Navegación con Tab

**Instrucciones:**
1. Click en la barra de direcciones del navegador
2. Presiona `Tab` repetidamente
3. Observa cómo el **focus** (outline azul) se mueve

**✅ Qué verificar:**
- [ ] El outline azul es **visible** en cada elemento
- [ ] Puedes navegar a **todos los botones e inputs**
- [ ] El orden de navegación es **lógico** (izquierda→derecha, arriba→abajo)
- [ ] No hay elementos "atrapados" (puedes salir con Tab)

**⚠️ Reporta si:**
- No ves el outline en algún elemento
- El orden de navegación es confuso
- Te quedas atrapado en algún lugar

### 3.3 Testing - Abrir Modal con Teclado

**Para el botón de Chat IA:**
1. Navega con `Tab` hasta el botón de chat (normalmente esquina inferior derecha)
2. Presiona `Enter` o `Space` para abrir el modal

**✅ Qué verificar:**
- [ ] El modal se abre
- [ ] El focus automáticamente va al primer elemento dentro del modal
- [ ] Los elementos del fondo (background) NO son accesibles con Tab

### 3.4 Testing - Focus Trap en Modal

**Con el modal abierto:**
1. Presiona `Tab` repetidamente
2. Observa cómo el focus se mueve

**✅ Qué verificar:**
- [ ] El focus **permanece dentro del modal** (no escapa al fondo)
- [ ] Al llegar al último elemento, `Tab` regresa al primero (ciclo)
- [ ] `Shift+Tab` funciona en dirección reversa
- [ ] Puedes navegar entre todas las opciones del modal

**⚠️ Reporta si:**
- El focus escapa al fondo (esto es un bug del focus trap)
- No puedes acceder a algún botón dentro del modal

### 3.5 Testing - Cerrar Modal con Escape

**Con el modal abierto:**
1. Presiona la tecla `Esc` (Escape)

**✅ Qué verificar:**
- [ ] El modal se cierra
- [ ] El focus regresa al botón que abrió el modal

### 3.6 Testing - Chat Interface

**Si seleccionas una opción del chat (ej: "Editar perfil"):**
1. Navega con `Tab` al input de mensaje
2. Escribe un mensaje
3. Presiona `Enter`

**✅ Qué verificar:**
- [ ] El mensaje se envía al presionar `Enter`
- [ ] `Shift+Enter` NO envía (opcional, solo si es textarea)
- [ ] Puedes navegar con Tab entre input y botón de enviar

### 3.7 Testing - Botones Toggle

**En la interfaz de perfil (si está disponible):**
1. Navega a los botones de "Nota de Voz" o "Subir Documento"
2. Presiona `Enter` o `Space`

**✅ Qué verificar:**
- [ ] El botón cambia de estado (se activa/desactiva)
- [ ] Visualmente se nota el cambio
- [ ] El focus permanece en el botón

---

## 🔊 Paso 4: Testing con Lector de Pantalla (OPCIONAL)

Este paso es opcional pero muy valioso para verificar la experiencia real de usuarios con discapacidad visual.

### 4.1 Activar Lector de Pantalla

**Windows:**
- Presiona `Win + Ctrl + Enter` para activar **Narrator**
- O descarga **NVDA** (gratis): https://www.nvaccess.org/download/

**Mac:**
- Presiona `Cmd + F5` para activar **VoiceOver**

**Linux:**
- Instala **Orca**: `sudo apt install orca`
- Ejecuta: `orca`

### 4.2 Navegar con el Lector

1. Usa `Tab` para navegar
2. Escucha lo que anuncia el lector de pantalla

**✅ Qué verificar:**
- [ ] Anuncia el **propósito** de cada botón (ej: "Botón Cerrar modal")
- [ ] Anuncia el **estado** de botones toggle (ej: "Nota de Voz, botón presionado")
- [ ] Anuncia las **labels** de los inputs (ej: "Mensaje de chat, editar texto")
- [ ] No anuncia solo "Botón" sin descripción

**⚠️ Reporta si:**
- Un botón se anuncia sin descripción clara
- Falta contexto sobre qué hace un elemento

---

## 📝 Paso 5: Documentar Resultados

### 5.1 Crear un archivo de reporte

Crea un archivo llamado `ACCESSIBILITY_TEST_RESULTS.md` con este formato:

```markdown
# Resultados de Testing de Accesibilidad - FINCO

**Fecha:** [Fecha actual]
**Tester:** [Tu nombre]
**Navegador:** Chrome [versión]
**Sistema Operativo:** [Windows/Mac/Linux]

---

## 🎯 Lighthouse Audit Results

**Score de Accesibilidad:** [XX]/100

**Status:** [✅ Aprobado / 🟡 Necesita mejoras / ❌ Problemas serios]

### Issues Encontrados:

1. [Nombre del issue] - Severity: [Alta/Media/Baja]
   - Descripción: [Qué encontró Lighthouse]
   - Ubicación: [Qué página/componente]

2. [Siguiente issue...]

### Passed Audits:

- ✅ [Lista de cosas que pasaron correctamente]

---

## ⌨️ Keyboard Navigation Testing

### Navegación General
- [ ] ✅ PASS / [ ] ❌ FAIL - Outline visible en todos los elementos
- [ ] ✅ PASS / [ ] ❌ FAIL - Orden de navegación lógico
- [ ] ✅ PASS / [ ] ❌ FAIL - No hay elementos atrapados

### Modal Functionality
- [ ] ✅ PASS / [ ] ❌ FAIL - Modal abre con Enter
- [ ] ✅ PASS / [ ] ❌ FAIL - Focus trap funciona correctamente
- [ ] ✅ PASS / [ ] ❌ FAIL - Escape cierra el modal
- [ ] ✅ PASS / [ ] ❌ FAIL - Focus regresa al trigger

### Chat Interface
- [ ] ✅ PASS / [ ] ❌ FAIL - Enter envía mensajes
- [ ] ✅ PASS / [ ] ❌ FAIL - Tab navega entre elementos

### Toggle Buttons
- [ ] ✅ PASS / [ ] ❌ FAIL - Estado visual claro
- [ ] ✅ PASS / [ ] ❌ FAIL - Activación con teclado

**Bugs encontrados:**
1. [Descripción del bug]
   - Cómo reproducir: [pasos]
   - Comportamiento esperado: [qué debería pasar]
   - Comportamiento actual: [qué pasó]

---

## 🔊 Screen Reader Testing (si se probó)

- [ ] ✅ PASS / [ ] ❌ FAIL - Botones anunciados correctamente
- [ ] ✅ PASS / [ ] ❌ FAIL - Estados anunciados correctamente
- [ ] ✅ PASS / [ ] ❌ FAIL - Labels de inputs claros

**Issues encontrados:**
- [Lista de problemas con el lector de pantalla]

---

## 📊 Resumen

**Estado general:** [Excelente / Bueno / Necesita trabajo]

**Problemas críticos:** [Número]
**Problemas menores:** [Número]

**Recomendaciones:**
1. [Sugerencia de mejora]
2. [Siguiente sugerencia...]

**¿Aprobado para producción?** [✅ SÍ / ❌ NO - necesita fixes]
```

### 5.2 Compartir los resultados

Una vez que completes el testing, comparte el archivo de resultados para que pueda revisar los issues y hacer los fixes necesarios.

---

## 🎯 Métricas de Éxito

Para considerar la accesibilidad aprobada, necesitamos:

- ✅ **Lighthouse Score:** 90+ puntos
- ✅ **Keyboard Navigation:** Todos los tests PASS
- ✅ **Focus Trap:** Funciona correctamente
- ✅ **Screen Reader:** Anuncios claros (si se probó)
- ✅ **0 problemas críticos**
- ✅ **Máximo 2-3 problemas menores**

---

## ❓ Preguntas Frecuentes

### ¿Qué navegador usar?
**Chrome** es preferible porque tiene Lighthouse integrado. Firefox también funciona pero requiere extensiones.

### ¿Cuánto tarda el testing?
- Lighthouse: 30 segundos
- Keyboard navigation: 5-10 minutos
- Screen reader (opcional): 10-15 minutos
- **Total:** ~15-25 minutos

### ¿Qué pasa si encuentro bugs?
¡Perfecto! Documenta todo en el reporte. Los bugs encontrados en testing son más fáciles de corregir que los encontrados en producción.

### ¿Puedo probar en mobile?
Sí, Lighthouse tiene modo mobile. La navegación con teclado es más para desktop, pero puedes probar el flujo touch en mobile.

---

## 🆘 Ayuda

Si tienes problemas durante el testing:
1. Verifica que la app esté corriendo (`npm run dev`)
2. Prueba en modo incógnito (para evitar extensiones que interfieren)
3. Limpia el cache del navegador
4. Reinicia la app si algo no funciona

---

¡Gracias por probar la accesibilidad de FINCO! 🎉
