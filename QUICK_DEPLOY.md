# 🚀 Deploy Rápido en Vercel - MentorIA

## ⏱️ Tiempo Total: 15 minutos
## 🎯 Proyecto: MentorIA - Tu Mentor Financiero Personal con IA

---

## Paso 1: Preparar Repositorio (2 min)

```bash
# Asegurar que todo está commiteado
git add .
git commit -m "feat: prepare for production deployment"
git push origin main
```

---

## Paso 2: Deploy en Vercel (3 min)

1. Ir a **[vercel.com](https://vercel.com)**
2. Click **"Sign up with GitHub"**
3. Click **"Import Project"**
4. Seleccionar tu repo **finco-app**
5. Click **"Deploy"** (no cambiar nada)

✅ **En 2 minutos tendrás tu URL:** `https://finco-app-xxx.vercel.app`

---

## Paso 3: Configurar Variables de Entorno (5 min)

En Vercel Dashboard → Settings → Environment Variables, agregar:

```bash
# App URL (usar la URL que Vercel te dio)
NEXT_PUBLIC_APP_URL=https://finco-app-xxx.vercel.app

# Copiar de tu .env.local actual:
NEXT_PUBLIC_SUPABASE_URL=tu-valor-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-valor-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-valor-aqui
OPENAI_API_KEY=tu-valor-aqui

# Opcionales (recomendados):
UPSTASH_REDIS_URL=tu-valor-aqui
UPSTASH_REDIS_TOKEN=tu-valor-aqui
SENTRY_DSN=tu-valor-aqui
NEXT_PUBLIC_SENTRY_DSN=tu-valor-aqui
```

💡 **Tip:** Marcar todas para Production, Preview y Development

Después de agregar, click **"Redeploy"** en Deployments tab.

---

## Paso 4: Actualizar OAuth y Supabase (3 min)

### A. Google OAuth Console

Ir a: https://console.cloud.google.com/apis/credentials

Editar tu OAuth Client ID:

**Authorized JavaScript origins:**
```
https://finco-app-xxx.vercel.app
```

**Authorized redirect URIs:**
```
https://finco-app-xxx.vercel.app/auth/callback
```

### B. Supabase Dashboard

Ir a: https://app.supabase.com/project/_/auth/url-configuration

**Site URL:**
```
https://finco-app-xxx.vercel.app
```

**Redirect URLs:**
```
https://finco-app-xxx.vercel.app/**
https://finco-app-xxx.vercel.app/auth/callback
```

---

## Paso 5: Verificar Funcionamiento (2 min)

1. Abrir: `https://finco-app-xxx.vercel.app`
2. Probar login con Google
3. Verificar dashboard carga correctamente
4. ✅ **¡LISTO! Tu app está en producción**

---

## 🎯 Conectar Dominio Personalizado (Opcional)

Si tienes un dominio (ej: `finco.com`):

1. Vercel Dashboard → Settings → Domains
2. Agregar tu dominio
3. Configurar DNS records en tu proveedor:

```
A Record:
Name: @
Value: 76.76.21.21

CNAME Record:
Name: www
Value: cname.vercel-dns.com
```

4. Esperar 10-60 min para propagación DNS
5. ✅ SSL automático

---

## 🔥 Deploy Automático

Cada vez que hagas `git push`:
- ✅ Vercel detecta el cambio
- ✅ Build automático
- ✅ Deploy automático
- ✅ Preview URL para branches

---

## 📊 Monitoreo

### Analytics (Gratis en Vercel)
- Dashboard → Analytics
- Ver visitas, países, dispositivos

### Errores (Sentry)
- Ir a: https://sentry.io
- Ver errores en tiempo real
- Stack traces completos

### Logs (Vercel)
- Dashboard → Logs
- Ver requests en tiempo real

---

## 🆘 Troubleshooting

**❌ Error: "Environment variables undefined"**
```
Solución: Redeploy después de agregar variables
```

**❌ Error: "OAuth redirect mismatch"**
```
Solución: Verificar URLs en Google Console
```

**❌ Error: "Module not found"**
```
Solución: Verificar package.json y hacer commit
```

**❌ Build falla**
```
Solución: Verificar que npm run build funcione localmente
```

---

## 📞 Soporte

- 📖 [Docs Vercel](https://vercel.com/docs)
- 💬 [Discord Vercel](https://vercel.com/discord)
- 🐛 [Reportar Issue](https://github.com/tu-usuario/finco-app/issues)

---

## ✅ Checklist Final

- [ ] App deployada en Vercel
- [ ] Variables de entorno configuradas
- [ ] OAuth URLs actualizadas
- [ ] Supabase URLs actualizadas
- [ ] Login funciona correctamente
- [ ] Dashboard carga sin errores
- [ ] Sentry configurado (opcional)
- [ ] Dominio personalizado conectado (opcional)

---

**🎉 ¡Felicidades! Tu app FINCO está en producción.**

**Costo: $0/mes** hasta 100GB de bandwidth.

