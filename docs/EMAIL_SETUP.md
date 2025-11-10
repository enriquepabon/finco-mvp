# 📧 Configuración de Envío de Emails (Resend)

## ¿Qué es Resend?

[Resend](https://resend.com) es un servicio de envío de emails transaccionales diseñado para desarrolladores. MentorIA lo utiliza para enviar los reportes financieros por email.

## ⚠️ ¿Es obligatorio?

**NO**. La funcionalidad de envío de emails es **OPCIONAL**. Si no configuras Resend:

- ✅ La aplicación funcionará perfectamente
- ✅ Podrás generar reportes financieros con IA
- ✅ Podrás descargar los reportes en PDF
- ❌ NO podrás enviar reportes por email

## 🚀 Configuración Rápida (5 minutos)

### 1. Crear cuenta en Resend

1. Ve a [https://resend.com/signup](https://resend.com/signup)
2. Crea una cuenta gratuita
3. Confirma tu email

### 2. Obtener tu API Key

1. Una vez logueado, ve a **API Keys** en el menú izquierdo
2. Click en **Create API Key**
3. Dale un nombre (ej: "MentorIA")
4. Selecciona los permisos: **Sending access**
5. Click en **Add**
6. **Copia la API key** (empieza con `re_...`)

### 3. Configurar dominio (Opcional pero recomendado)

Para enviar emails desde tu propio dominio:

1. Ve a **Domains** en Resend
2. Click en **Add Domain**
3. Ingresa tu dominio (ej: `mentoria.com`)
4. Sigue las instrucciones para configurar los registros DNS

**Alternativa**: Puedes usar el dominio de prueba que Resend te proporciona (`onboarding.resend.dev`)

### 4. Agregar la API Key a tu proyecto

Abre tu archivo `.env.local` y agrega:

```bash
RESEND_API_KEY=re_tu_api_key_aqui
```

### 5. Reiniciar el servidor

```bash
npm run dev
```

## 🧪 Probar la funcionalidad

1. Abre MentorIA en tu navegador
2. Ve a un presupuesto
3. Genera un reporte financiero (botón "⚡ Reporte IA")
4. Click en "📧 Enviar por Email"
5. Ingresa un email (pre-llenado con tu email de perfil)
6. Click en "Enviar"

Si todo está bien configurado, recibirás el email en unos segundos.

## ❓ Preguntas Frecuentes

### ¿Cuánto cuesta Resend?

- **Plan gratuito**: 3,000 emails/mes
- **Planes pagos**: Desde $20/mes (50,000 emails)

Para un uso personal o pequeño equipo, el plan gratuito es más que suficiente.

### ¿Qué pasa si no configuro RESEND_API_KEY?

La aplicación detectará automáticamente que no está configurada y mostrará un mensaje amigable:

```
⚠️ Servicio de email no configurado
RESEND_API_KEY faltante en variables de entorno
💡 Visita https://resend.com para obtener tu API key
```

El resto de la aplicación funcionará normalmente.

### ¿Puedo usar otro servicio de email?

Sí, pero tendrías que modificar el código en `/src/app/api/send-report-email/route.ts`. Resend es el servicio recomendado por su simplicidad y confiabilidad.

### ¿Los emails se ven bien en todos los clientes?

Sí, el email está diseñado con HTML responsive que funciona en:

- Gmail
- Outlook
- Apple Mail
- Navegadores web
- Apps móviles

## 🐛 Solución de Problemas

### Error: "Missing API key"

**Causa**: No has configurado `RESEND_API_KEY` en `.env.local`

**Solución**:
1. Verifica que el archivo `.env.local` existe
2. Verifica que la línea `RESEND_API_KEY=re_...` está presente
3. Reinicia el servidor (`npm run dev`)

### Error: "Invalid API key"

**Causa**: La API key es incorrecta o está mal copiada

**Solución**:
1. Ve a [https://resend.com/api-keys](https://resend.com/api-keys)
2. Genera una nueva API key
3. Cópiala completa (debe empezar con `re_`)
4. Reemplázala en `.env.local`
5. Reinicia el servidor

### Error: "Domain not verified"

**Causa**: Estás intentando enviar desde un dominio personalizado que no ha sido verificado

**Solución**:
1. Usa el dominio de prueba de Resend (`onboarding.resend.dev`)
2. O ve a **Domains** en Resend y completa la verificación DNS

### El email no llega

**Posibles causas**:

1. **Está en spam**: Revisa tu carpeta de spam/correo no deseado
2. **Email incorrecto**: Verifica que el email está bien escrito
3. **Dominio no verificado**: Si usas un dominio personalizado, verifica que esté configurado correctamente

## 📚 Recursos Adicionales

- [Documentación oficial de Resend](https://resend.com/docs)
- [SDK de Resend para Node.js](https://github.com/resendlabs/resend-node)
- [Ejemplos de integración](https://resend.com/docs/send-with-nextjs)

## 💬 Soporte

Si tienes problemas con la configuración, abre un issue en GitHub o contacta al equipo de desarrollo.

