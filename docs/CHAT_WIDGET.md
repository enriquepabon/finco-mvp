# 💬 Chat Inteligente de MentorIA - Landing Page

## 🎯 Descripción General

El **Chat Widget** es un asistente conversacional impulsado por **GPT-4o-mini** que responde preguntas sobre MentorIA directamente desde el landing page. Está diseñado para convertir visitantes en usuarios al resolver sus dudas de forma inmediata y personalizada.

---

## ✨ Características Principales

### 1. **Interfaz Atractiva**
- ✅ Botón flotante con efecto de pulso animado
- ✅ Badge "nuevo" con animación bounce
- ✅ Tooltip informativo al hacer hover
- ✅ Modal responsive y elegante
- ✅ Animaciones suaves de entrada/salida

### 2. **UX Optimizada**
- 💬 Mensaje de bienvenida automático
- 💡 4 sugerencias rápidas de preguntas
- 📝 Auto-scroll a mensajes nuevos
- ⌨️ Atajos de teclado (Enter para enviar)
- 🔄 Indicador de "escribiendo..."
- ✅ Validación de entrada (máx 500 caracteres)
- 🔒 Mensaje de privacidad y seguridad

### 3. **IA Inteligente (GPT-4o-mini)**
- 🤖 Personalidad cálida y motivadora
- 🎤 Habla en primera persona como "MentorIA"
- 📚 Conocimiento profundo sobre la plataforma
- 🎯 Respuestas concisas (2-4 párrafos)
- 💰 Costo-eficiente (~500 tokens por conversación)

### 4. **Optimización Técnica**
- ⚡ Streaming de respuestas (rápido)
- 📊 Control de tokens (max 500 por respuesta)
- 🧠 Historial de conversación (últimos 10 mensajes)
- 🔥 Sin base de datos (stateless, privado)
- 🚫 Manejo de errores robusto

---

## 📂 Estructura de Archivos

```
src/
├── app/
│   └── api/
│       └── landing/
│           └── chat/
│               └── route.ts          # Endpoint del chat
├── components/
│   └── landing/
│       └── ChatWidget.tsx            # Componente visual
└── app/
    └── landing/
        └── layout.tsx                # Integración del chat
```

---

## 🔧 Configuración Técnica

### Endpoint API: `/api/landing/chat`

**Método:** `POST`

**Request Body:**
```json
{
  "message": "¿Qué es MentorIA?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hola"
    },
    {
      "role": "assistant",
      "content": "¡Hola! Soy MentorIA..."
    }
  ]
}
```

**Response:**
```json
{
  "reply": "¡Hola! Soy MentorIA, tu agente financiero personalizado...",
  "tokensUsed": 342,
  "model": "gpt-4o-mini"
}
```

**Configuración del Modelo:**
- **Modelo:** `gpt-4o-mini` (costo-eficiente)
- **Temperature:** `0.7` (balance creatividad/consistencia)
- **Max Tokens:** `500` (respuestas concisas)
- **Frequency Penalty:** `0.3` (evita repeticiones)
- **Presence Penalty:** `0.3` (fomenta variedad)

---

## 📝 Prompt del Sistema

El prompt está diseñado para que MentorIA sea:

### **Personalidad:**
- 🤗 Cálido y empático
- 💪 Motivador
- 🎓 Educativo pero simple
- 😊 Amigable (usa emojis)
- 🎯 Orientado a la acción

### **Conocimientos Clave:**

1. **Funcionalidades de MentorIA:**
   - Presupuestos inteligentes
   - Registro por voz
   - Dashboard visual
   - Reportes con IA
   - Metas y ahorros
   - Regla 50/30/20
   - Alertas inteligentes

2. **Planes (Estructura Básica):**
   - **Gratuito:** 1 presupuesto, registro manual, dashboard básico
   - **Premium:** (Próximamente) Todo ilimitado, IA avanzada
   - **Familiar:** (Próximamente) Hasta 5 usuarios, presupuestos compartidos

3. **Diferenciadores:**
   - Único con registro por voz en español
   - IA que aprende de tus hábitos
   - Adaptado a Colombia
   - Interfaz para NO expertos
   - Seguridad bancaria

4. **Casos de Uso:**
   - Ahorrar para vacaciones
   - Controlar gastos hormiga
   - Salir de deudas
   - Crear fondo de emergencia
   - Mejorar puntaje crediticio

### **Reglas de Interacción:**

1. ✅ Respuestas de 2-4 párrafos (concisas)
2. ✅ Siempre terminar con pregunta o CTA
3. ✅ Ser honesto sobre limitaciones
4. ✅ Empatía en problemas financieros serios
5. ✅ Enfocarse en cómo MentorIA RESUELVE problemas

---

## 🎨 Componente Visual (`ChatWidget.tsx`)

### Estados del Componente:

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

### Funciones Principales:

1. **`handleSend()`**
   - Envía mensaje del usuario
   - Actualiza estado de carga
   - Llama al endpoint `/api/landing/chat`
   - Agrega respuesta al historial

2. **`scrollToBottom()`**
   - Auto-scroll a último mensaje

3. **`handleSuggestionClick()`**
   - Pre-llena input con sugerencia

### Animaciones CSS:

```css
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 💰 Costo Estimado

### Por Conversación:
- **Promedio:** 500-800 tokens
- **Costo:** ~$0.0001 - $0.0002 USD
- **1000 conversaciones:** ~$0.10 - $0.20 USD

### Optimizaciones:
- ✅ Max 500 tokens por respuesta
- ✅ Solo últimos 10 mensajes de historial
- ✅ Sin almacenamiento en BD (reduce infraestructura)
- ✅ Uso de GPT-4o-mini (80% más barato que GPT-4)

---

## 🧪 Pruebas Sugeridas

### 1. **Preguntas Básicas:**
- "¿Qué es MentorIA?"
- "¿Cómo funciona?"
- "¿Cuánto cuesta?"

### 2. **Casos de Uso:**
- "No sé cómo ahorrar"
- "Quiero controlar mis gastos"
- "¿Cómo puedo salir de deudas?"

### 3. **Funcionalidades:**
- "¿Qué es el registro por voz?"
- "¿Tienen reportes con IA?"
- "¿Cómo funcionan los presupuestos?"

### 4. **Planes:**
- "¿Qué planes tienen?"
- "¿Hay plan gratuito?"
- "¿Cuándo estará el plan Premium?"

---

## 🚀 Despliegue

El chat se activa automáticamente en el landing page (`/landing`) sin configuración adicional.

### Variables de Entorno Necesarias:

```bash
# .env.local
OPENAI_API_KEY=sk-tu_clave_aqui
```

### Verificación:

1. Ve a `/landing`
2. Deberías ver el botón flotante en la esquina inferior derecha
3. Click para abrir el chat
4. MentorIA debería saludarte automáticamente

---

## 📊 Métricas Recomendadas (Futuro)

Si decides implementar tracking, considera medir:

1. **Engagement:**
   - % de visitantes que abren el chat
   - Mensajes promedio por conversación
   - Tiempo promedio de conversación

2. **Conversión:**
   - % que preguntan por planes
   - % que hacen click en CTAs
   - % que se registran después de chatear

3. **Calidad:**
   - % de respuestas útiles (feedback)
   - Preguntas más frecuentes
   - Temas que más interesan

---

## 🔄 Futuras Mejoras (Opcional)

1. **Persistencia:**
   - Guardar conversaciones en Supabase
   - Retomar conversación después de registro

2. **Analytics:**
   - Dashboard de métricas del chat
   - Identificar preguntas sin respuesta satisfactoria

3. **Personalización:**
   - Detectar intención de compra
   - Ofrecer demos personalizadas
   - Integrar calendario para llamadas

4. **Multiidioma:**
   - Detectar idioma del usuario
   - Soporte en inglés

5. **Integraciones:**
   - Enviar conversaciones a CRM
   - Notificar al equipo de ventas

---

## ❓ Preguntas Frecuentes

### ¿Es necesario tener cuenta para usar el chat?

**No.** El chat funciona para visitantes anónimos. Es una herramienta de conversión.

### ¿Se guardan las conversaciones?

**No.** Actualmente el chat es stateless (sin memoria entre sesiones) para maximizar privacidad.

### ¿Funciona en móviles?

**Sí.** El componente es completamente responsive.

### ¿Puedo personalizar el prompt?

**Sí.** Edita `MENTORIA_SYSTEM_PROMPT` en `/src/app/api/landing/chat/route.ts`

### ¿Cómo agrego más información sobre planes?

Actualiza la sección "Planes" en el prompt del sistema. MentorIA aprenderá automáticamente.

---

## 🛠️ Troubleshooting

### El botón no aparece:

1. Verifica que estás en `/landing`
2. Revisa la consola del navegador
3. Asegúrate de que `ChatWidget` esté importado en `layout.tsx`

### El chat no responde:

1. Verifica que `OPENAI_API_KEY` esté configurada
2. Revisa los logs del servidor (terminal)
3. Verifica que `/api/landing/chat` devuelve 200

### Respuestas lentas:

- **Normal:** GPT-4o-mini tarda 2-5 segundos
- Si es más, verifica tu conexión a internet
- Considera implementar streaming para UX más fluida

---

## 📚 Recursos Adicionales

- [Documentación de OpenAI Chat Completions](https://platform.openai.com/docs/guides/chat)
- [GPT-4o-mini Pricing](https://openai.com/pricing)
- [Best Practices para Prompts](https://platform.openai.com/docs/guides/prompt-engineering)

---

## 💬 Soporte

Si tienes dudas sobre el chat o quieres personalizarlo, contacta al equipo de desarrollo.

**¡MentorIA está listo para convertir visitantes en usuarios! 🚀**

