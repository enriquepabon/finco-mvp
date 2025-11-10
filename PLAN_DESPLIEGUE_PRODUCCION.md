# 🚀 Plan de Despliegue a Producción - MentorIA

## 📊 Resumen Ejecutivo

**Proyecto:** MentorIA - Tu Mentor Financiero Personal con IA  
**Stack:** Next.js 15 + Supabase + OpenAI GPT-4o mini  
**Plataforma Recomendada:** Vercel (Gratis)  
**Tiempo Estimado:** 30 minutos  
**Costo Mensual:** $0 (Hobby Plan)  
**Escalabilidad:** Hasta 100GB/mes bandwidth  

---

## 🎯 Opción 1: Vercel (RECOMENDADA)

### ✅ Ventajas para tu Proyecto

| Característica | Vercel | Railway | Fly.io |
|----------------|--------|---------|--------|
| **Costo Inicial** | $0 | $5-10/mes | $0-5/mes |
| **Next.js Optimization** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Deploy Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **SSL + CDN** | ✅ Gratis | ✅ Gratis | ✅ Gratis |
| **Dominio Custom** | ✅ Gratis | ✅ Gratis | ✅ Gratis |
| **Zero Config** | ✅ | ❌ | ❌ |
| **Auto-scaling** | ✅ | ✅ | Manual |
| **Analytics** | ✅ Incluido | ❌ | ❌ |

### 📋 Paso a Paso - Deploy en Vercel

#### **1. Preparación del Repositorio (5 min)**

```bash
# Asegurarte que tu código está en GitHub
cd /Users/enriquepabon/Projects/finco-app

# Si no tienes repo remoto, crear uno:
git init
git add .
git commit -m "feat: prepare for production deployment"

# Crear repo en GitHub y conectar
git remote add origin https://github.com/tu-usuario/finco-app.git
git branch -M main
git push -u origin main
```

#### **2. Crear Cuenta en Vercel (2 min)**

1. Ir a [vercel.com](https://vercel.com)
2. **"Sign up with GitHub"**
3. Autorizar acceso a tus repositorios

#### **3. Importar Proyecto (3 min)**

1. Click en **"Add New Project"**
2. Seleccionar tu repositorio `finco-app`
3. Vercel **detecta automáticamente** que es Next.js
4. **NO tocar la configuración de build** (está perfecta)

#### **4. Configurar Variables de Entorno (10 min)**

En Vercel Dashboard → Tu Proyecto → Settings → Environment Variables:

```bash
# ============================================
# VARIABLES REQUERIDAS (Production)
# ============================================

NEXT_PUBLIC_APP_URL=https://tu-dominio-vercel.vercel.app

# Supabase (copiar de tu .env.local actual)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI API (GPT-4o mini)
OPENAI_API_KEY=sk-proj-...

# ============================================
# VARIABLES OPCIONALES (Recomendadas)
# ============================================

# Upstash Redis (para rate limiting y cache)
UPSTASH_REDIS_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_TOKEN=AYxxxx...

# Sentry (para monitoreo de errores)
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=sntrys_xxxxx (solo si usas Sentry)
```

**💡 Tip:** Marca todas como "Production", "Preview" y "Development"

#### **5. Actualizar URLs en Servicios (5 min)**

**A. Actualizar Google OAuth Console:**
```
https://console.cloud.google.com/apis/credentials

Authorized JavaScript origins:
- https://tu-dominio-vercel.vercel.app

Authorized redirect URIs:
- https://tu-dominio-vercel.vercel.app/auth/callback
```

**B. Actualizar Supabase:**
```
https://app.supabase.com/project/_/auth/url-configuration

Site URL: https://tu-dominio-vercel.vercel.app

Redirect URLs:
- https://tu-dominio-vercel.vercel.app/**
- https://tu-dominio-vercel.vercel.app/auth/callback
```

#### **6. Deploy (1 min)**

1. Click en **"Deploy"**
2. Esperar 1-2 minutos
3. ✅ **Tu app está en producción**

#### **7. Conectar Dominio Personalizado (5 min)**

**Si ya tienes dominio:**

1. Vercel Dashboard → Tu Proyecto → **Settings → Domains**
2. Agregar tu dominio: `tudominio.com`
3. Vercel te da los **DNS records** a configurar:

```
A Record:
Type: A
Name: @
Value: 76.76.21.21

CNAME Record:
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Ir a tu proveedor de dominio (GoDaddy, Namecheap, etc.)
5. Agregar estos records en DNS settings
6. **Esperar 10-60 minutos** para propagación
7. ✅ SSL automático cuando propague

---

## 🔧 Configuraciones Adicionales

### **A. Optimizar para Producción**

Crear `.vercelignore` en la raíz:

```
# .vercelignore
node_modules
.env*.local
.next
.git
*.md
docs
scripts/test-*.js
```

### **B. Configurar Redirects (Opcional)**

Si quieres forzar HTTPS y www, agregar en `next.config.ts`:

```typescript
async redirects() {
  return [
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'tudominio.com' }],
      destination: 'https://www.tudominio.com/:path*',
      permanent: true,
    },
  ];
},
```

### **C. Headers de Seguridad**

Ya los tienes configurados en `next.config.ts`, pero verifica:

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
      ],
    },
  ];
},
```

---

## 🎯 Opción 2: Railway (Si prefieres Docker)

### 📋 Paso a Paso - Deploy en Railway

#### **1. Crear Proyecto en Railway**

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar proyecto
cd /Users/enriquepabon/Projects/finco-app
railway init
```

#### **2. Configurar Variables de Entorno**

```bash
# Opción 1: Via CLI
railway variables set NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
railway variables set SUPABASE_SERVICE_ROLE_KEY="xxx"
railway variables set GOOGLE_GEMINI_API_KEY="xxx"
railway variables set NEXT_PUBLIC_APP_URL="https://finco-app.up.railway.app"

# Opción 2: Via Dashboard (más fácil)
# 1. Ir a railway.app/project/tu-proyecto
# 2. Ir a Variables
# 3. Copiar y pegar tus variables
```

#### **3. Crear railway.json**

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### **4. Deploy**

```bash
railway up
```

**Costo estimado:** $5-10/mes dependiendo del uso

---

## 🎯 Opción 3: Fly.io (Docker + Gratis)

### 📋 Paso a Paso - Deploy en Fly.io

#### **1. Instalar Fly CLI**

```bash
curl -L https://fly.io/install.sh | sh
```

#### **2. Login y Launch**

```bash
cd /Users/enriquepabon/Projects/finco-app
fly auth login
fly launch
```

#### **3. Configurar fly.toml**

Fly genera `fly.toml`, editarlo:

```toml
app = "finco-app"
primary_region = "mia"  # Miami - más cerca de LATAM

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "3000"
  NODE_ENV = "production"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80
    force_https = true

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

#### **4. Configurar Secrets**

```bash
fly secrets set NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
fly secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
fly secrets set SUPABASE_SERVICE_ROLE_KEY="xxx"
fly secrets set GOOGLE_GEMINI_API_KEY="xxx"
fly secrets set NEXT_PUBLIC_APP_URL="https://finco-app.fly.dev"
```

#### **5. Deploy**

```bash
fly deploy
```

---

## 📊 Comparación de Costos

### Escenario: 10,000 usuarios/mes, 50GB bandwidth

| Plataforma | Costo/Mes | Incluye | Limitaciones |
|------------|-----------|---------|--------------|
| **Vercel Hobby** | **$0** | SSL, CDN, Analytics | 100GB bandwidth |
| **Vercel Pro** | $20 | Todo lo anterior + más | 1TB bandwidth |
| **Railway** | $5-10 | Docker, PostgreSQL | $5 base + uso |
| **Fly.io** | $0-5 | 3 VMs gratis | 160GB gratis |

### Recomendación por Fase:

**MVP/Beta (0-1K usuarios):**  
→ **Vercel Hobby** ($0) ✅

**Early Stage (1K-10K usuarios):**  
→ **Vercel Hobby** ($0) ✅

**Growth (10K-100K usuarios):**  
→ **Vercel Pro** ($20) o **Railway** ($15-30)

**Scale (100K+ usuarios):**  
→ **Vercel Enterprise** o **Self-hosted Kubernetes**

---

## 🔒 Checklist de Seguridad Pre-Deploy

### ✅ Antes de hacer Deploy:

- [ ] **NO commitear** `.env.local` (verificar `.gitignore`)
- [ ] Rotar todas las API keys de desarrollo
- [ ] Usar variables de entorno específicas de producción
- [ ] Configurar RLS en Supabase correctamente
- [ ] Configurar CORS con dominio de producción
- [ ] Habilitar Sentry para monitoreo de errores
- [ ] Configurar Upstash Redis para rate limiting
- [ ] Verificar OAuth redirects apunten a producción
- [ ] SSL/HTTPS habilitado (automático en Vercel)
- [ ] Headers de seguridad configurados

### ✅ Después del Deploy:

- [ ] Probar flujo completo de registro/login
- [ ] Verificar onboarding conversacional funcione
- [ ] Probar dashboard con datos reales
- [ ] Verificar analytics de Vercel
- [ ] Configurar alertas en Sentry
- [ ] Probar desde diferentes dispositivos
- [ ] Verificar performance en Lighthouse
- [ ] Configurar Google Search Console
- [ ] Agregar sitemap.xml
- [ ] Configurar robots.txt

---

## 🎯 Mi Recomendación Final

### Para tu proyecto FINCO:

**1. Fase MVP (Ahora):** ✅ **VERCEL GRATIS**
- Costo: $0
- Deploy en: 30 minutos
- Perfect match con Next.js
- SSL + CDN incluidos

**2. Servicios Complementarios:**
- ✅ **Supabase Free Tier** (ya lo tienes)
- ✅ **Google Gemini Free Tier** (ya lo tienes)
- ✅ **Upstash Redis Free** (100 req/día gratis)
- ✅ **Sentry Free** (5K eventos/mes gratis)

**Costo Total MVP:** $0/mes 🎉

**3. Cuando Escalar:**
- Si pasas 100GB bandwidth → Vercel Pro ($20)
- Si necesitas más Redis → Upstash Pay as you go ($0.2/100K req)
- Si necesitas más Sentry → Sentry Team ($26)

---

## 🚀 Próximos Pasos

### Recomendación Inmediata:

1. ✅ **Deploy en Vercel** (30 min, gratis)
2. ✅ **Conectar tu dominio** (5 min)
3. ✅ **Configurar Sentry** (10 min, gratis)
4. ✅ **Agregar Upstash Redis** (5 min, gratis)

### Total: 50 minutos, $0 de costo

---

## 📞 Soporte y Troubleshooting

### Problemas Comunes:

**Error: "Module not found"**
```bash
# Solución: Verificar node_modules en .vercelignore
# Vercel instala dependencias automáticamente
```

**Error: "Environment variables undefined"**
```bash
# Solución: Verificar que todas las variables NEXT_PUBLIC_* 
# estén configuradas en Vercel Dashboard
```

**Error: "OAuth redirect mismatch"**
```bash
# Solución: Agregar URL de Vercel en Google Console:
# https://tu-app.vercel.app/auth/callback
```

**Deploy lento (>5 min)**
```bash
# Solución: Verificar que no estés incluyendo node_modules en git
# Usar .vercelignore para excluir archivos innecesarios
```

---

## 📚 Recursos Adicionales

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Railway Docs](https://docs.railway.app)
- [Fly.io Docs](https://fly.io/docs)

---

## 🎉 Conclusión

Para FINCO, **Vercel es la mejor opción** porque:

1. ✅ **$0 de costo** para MVP
2. ✅ **Optimizado para Next.js** (creadores del framework)
3. ✅ **Deploy automático** desde Git
4. ✅ **SSL + CDN gratis** globalmente
5. ✅ **Dominio personalizado** incluido
6. ✅ **Zero configuration** necesaria
7. ✅ **Escalabilidad** automática

**Railway es innecesario** porque ya tienes:
- Backend → Supabase
- IA → Google Gemini  
- Cache → Upstash Redis (opcional)
- Monitoring → Sentry (opcional)

Tu app es **perfectamente stateless** → ideal para serverless.

---

**¿Listo para deployar? Sigue la sección "Paso a Paso - Deploy en Vercel" arriba.** 🚀

