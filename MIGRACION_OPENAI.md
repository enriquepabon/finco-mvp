# 🔄 MIGRACIÓN A OPENAI GPT - INSTRUCCIONES

## ✅ **Cambios Realizados:**

Se ha migrado el sistema de IA de **Google Gemini** a **OpenAI GPT** debido a problemas de compatibilidad con los modelos de Gemini.

### **Archivos Actualizados:**

1. ✅ **Instalado OpenAI SDK** - `npm install openai`
2. ✅ **Creado cliente OpenAI** - `lib/openai/client.ts`
3. ✅ **Actualizado env.ts** - Soporte para `OPENAI_API_KEY`
4. ✅ **Actualizado API de chat** - Usa OpenAI
5. ✅ **Actualizado API de budget** - Usa OpenAI

---

## 🔑 **PASO 1: Obtener API Key de OpenAI**

### **Opción A: Cuenta Personal (Recomendado para desarrollo)**

1. Ve a: https://platform.openai.com/api-keys
2. Inicia sesión o crea una cuenta
3. Click en **"Create new secret key"**
4. Copia la key (empieza con `sk-proj-...`)

### **Opción B: Cuenta de Organización**

1. Si tienes una organización, usa la cuenta de tu empresa
2. La API Key tendrá mejor límite de uso

---

## 📝 **PASO 2: Configurar .env.local**

Abre tu archivo `.env.local` y agrega:

```bash
# OpenAI API Key (Reemplazo de Gemini)
OPENAI_API_KEY=sk-proj-tu-key-aqui

# Puedes comentar Gemini si ya no lo usas
# GOOGLE_GEMINI_API_KEY=...
```

---

## 💰 **PASO 3: Cargar Créditos (Si es necesario)**

### **Cuenta Nueva:**
- OpenAI da **$5 USD** de crédito gratis durante los primeros 3 meses
- Suficiente para desarrollo y pruebas

### **Cuenta sin Créditos:**
1. Ve a: https://platform.openai.com/account/billing/overview
2. Agrega un método de pago
3. Compra **$5-10 USD** de créditos para empezar

### **Costo Estimado:**
- **GPT-3.5-Turbo**: $0.0015 por 1K tokens (~$0.001 por mensaje)
- **Desarrollo (100 mensajes)**: ~$0.10 USD
- **Producción (1000 usuarios/mes)**: ~$30-50 USD/mes

---

## 🚀 **PASO 4: Reiniciar Servidor**

```bash
# Ctrl+C para detener
npm run dev
```

---

## ✅ **PASO 5: Probar**

1. Ve a `/onboarding`
2. Habla con FINCO
3. Debería funcionar sin errores 404

---

## 🔧 **Cambiar Modelo (Opcional)**

En `lib/openai/client.ts` línea 21, puedes cambiar el modelo:

```typescript
// Opciones disponibles:
const MODEL = 'gpt-3.5-turbo';      // ✅ Rápido y económico (Recomendado)
const MODEL = 'gpt-4-turbo';        // 🚀 Más inteligente (10x más caro)
const MODEL = 'gpt-4';              // 🧠 El más inteligente (20x más caro)
```

---

## 📊 **Comparación: Gemini vs OpenAI**

| Característica | Google Gemini | OpenAI GPT |
|----------------|---------------|------------|
| **Disponibilidad** | ❌ Problemas de API | ✅ Estable |
| **Costo** | 🆓 Gratis | 💰 Pago por uso |
| **Velocidad** | ⚡ Rápido | ⚡ Rápido |
| **Calidad** | 🟢 Buena | 🟢 Excelente |
| **Límites** | Restrictivo | Generoso |
| **Soporte** | Regular | Excelente |

---

## 🆘 **Solución de Problemas**

### **Error: "Incorrect API key provided"**
- Verifica que la key empiece con `sk-proj-` o `sk-`
- Asegúrate de copiar la key completa

### **Error: "You exceeded your current quota"**
- Tu cuenta no tiene créditos
- Agrega un método de pago y compra créditos

### **Error: "Rate limit exceeded"**
- Estás haciendo muchas peticiones
- Espera un minuto e intenta de nuevo

---

## 💡 **Alternativa: Usar Ambos (Fallback)**

Si quieres mantener Gemini como backup, puedo configurar:
1. Intentar OpenAI primero
2. Si falla, usar Gemini
3. Mejor resiliencia

---

## 📞 **Siguiente Paso:**

**Una vez que tengas tu OpenAI API Key:**

1. Agrégala a `.env.local`
2. Reinicia el servidor
3. **¡Todo debería funcionar!** 🎉

**¿Ya tienes tu API Key de OpenAI?**

