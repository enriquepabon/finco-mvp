# ✅ Checklist de Pre-Deploy - MentorIA

## 📋 Verificaciones Antes de Deploy

### 🔒 Seguridad

- [ ] **Archivo `.env.local` NO está en Git**
  ```bash
  # Verificar:
  git status
  # Si aparece .env.local, agregarlo a .gitignore
  ```

- [ ] **Variables de entorno configuradas**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL`

- [ ] **Row Level Security (RLS) activado en Supabase**
  ```sql
  -- Verificar en Supabase SQL Editor:
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public';
  -- Todos deben tener rowsecurity = true
  ```

- [ ] **Políticas RLS configuradas correctamente**
  - [ ] `user_profiles` - usuarios solo ven sus datos
  - [ ] `budgets` - usuarios solo ven sus presupuestos
  - [ ] `transactions` - usuarios solo ven sus transacciones

### 🔑 OAuth y Autenticación

- [ ] **OAuth Google configurado en producción**
  - [ ] Authorized JavaScript origins incluye URL de producción
  - [ ] Authorized redirect URIs incluye `/auth/callback`

- [ ] **Supabase Authentication configurado**
  - [ ] Site URL apunta a producción
  - [ ] Redirect URLs incluye URL de producción
  - [ ] Email confirmations deshabilitadas (o configuradas)

### 🎯 Performance

- [ ] **Build de producción funciona localmente**
  ```bash
  npm run build
  npm start
  # Probar en http://localhost:3000
  ```

- [ ] **No hay errores de TypeScript**
  ```bash
  npm run type-check
  ```

- [ ] **No hay errores de linting**
  ```bash
  npm run lint
  ```

- [ ] **Imágenes optimizadas**
  - [ ] Usar Next.js Image component
  - [ ] Formatos WebP cuando sea posible

### 📊 Monitoreo (Opcional pero Recomendado)

- [ ] **Sentry configurado**
  - [ ] Cuenta creada en sentry.io
  - [ ] DSN agregado a variables de entorno
  - [ ] Source maps configurados

- [ ] **Upstash Redis configurado (para rate limiting)**
  - [ ] Cuenta creada en upstash.com
  - [ ] URL y token agregados a variables de entorno

### 🌐 DNS y Dominio

- [ ] **Dominio registrado** (si aplica)
- [ ] **Acceso al panel DNS del proveedor**
- [ ] **Records DNS listos para actualizar**

### 📱 Funcionalidad

- [ ] **Login con Google funciona**
- [ ] **Onboarding conversacional funciona**
- [ ] **Dashboard carga correctamente**
- [ ] **Gráficas se muestran sin errores**
- [ ] **Edición de perfil funciona**
- [ ] **API routes responden correctamente**

### 📝 Contenido

- [ ] **Metadata actualizada en layout.tsx**
  ```typescript
  export const metadata = {
    title: 'FINCO - Tu Coach Financiero IA',
    description: 'Plataforma financiera inteligente...',
  }
  ```

- [ ] **Favicon configurado**
  - [ ] `/public/favicon.ico` existe
  - [ ] Se muestra correctamente

- [ ] **robots.txt configurado** (si aplica)
- [ ] **sitemap.xml configurado** (si aplica)

---

## 🚀 Checklist Durante Deploy

### En Vercel

- [ ] **Proyecto importado desde GitHub**
- [ ] **Framework detectado automáticamente (Next.js)**
- [ ] **Build settings correctos**
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`
  - [ ] Install Command: `npm install`

- [ ] **Variables de entorno agregadas**
  - [ ] Marcadas para Production
  - [ ] Marcadas para Preview (opcional)
  - [ ] Marcadas para Development (opcional)

- [ ] **Deploy exitoso**
  - [ ] Build completado sin errores
  - [ ] URL de producción accesible

---

## ✅ Checklist Post-Deploy

### Verificación Funcional

- [ ] **Abrir URL de producción**
- [ ] **Homepage carga correctamente**
- [ ] **Probar login con Google OAuth**
  - [ ] Redirect funciona
  - [ ] Usuario se crea en Supabase
  - [ ] Session persiste
- [ ] **Probar onboarding**
  - [ ] Chat funciona
  - [ ] Respuestas se procesan
  - [ ] Datos se guardan
- [ ] **Probar dashboard**
  - [ ] KPIs se calculan correctamente
  - [ ] Gráficas se renderizan
  - [ ] Edición funciona

### Verificación de Seguridad

- [ ] **HTTPS habilitado** (automático en Vercel)
- [ ] **Headers de seguridad presentes**
  ```bash
  # Verificar con:
  curl -I https://tu-dominio.vercel.app
  
  # Debe incluir:
  # X-Content-Type-Options: nosniff
  # X-Frame-Options: SAMEORIGIN
  # Referrer-Policy: origin-when-cross-origin
  ```

- [ ] **CSP configurado** (si aplica)
- [ ] **Rate limiting funciona** (si configurado)

### Verificación de Performance

- [ ] **Lighthouse Score > 90**
  - [ ] Performance > 90
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 90

- [ ] **Core Web Vitals**
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

### Monitoreo

- [ ] **Vercel Analytics funcionando**
  - [ ] Visitas registradas
  - [ ] Métricas disponibles

- [ ] **Sentry capturando errores** (si configurado)
  - [ ] Crear error de prueba
  - [ ] Verificar que aparece en Sentry

### SEO

- [ ] **Google Search Console configurado** (opcional)
  - [ ] Sitio verificado
  - [ ] Sitemap enviado

- [ ] **Meta tags correctos**
  ```bash
  # Verificar con:
  curl https://tu-dominio.vercel.app | grep -i meta
  ```

- [ ] **Open Graph tags presentes**
  - [ ] og:title
  - [ ] og:description
  - [ ] og:image

---

## 🔄 Checklist de Updates Futuros

### Antes de cada Deploy

- [ ] **Tests pasan** (si aplica)
  ```bash
  npm test
  ```

- [ ] **Build local exitoso**
  ```bash
  npm run build
  ```

- [ ] **Commit descriptivo**
  ```bash
  git commit -m "feat: descripción clara del cambio"
  ```

### Después de cada Deploy

- [ ] **Verificar funcionamiento básico**
  - [ ] Login funciona
  - [ ] Features principales funcionan

- [ ] **Revisar logs en Vercel**
  - [ ] No hay errores críticos
  - [ ] Performance aceptable

---

## 📊 Métricas de Éxito

### Técnicas

- ✅ Uptime > 99.9%
- ✅ Response time < 1s
- ✅ Error rate < 0.1%
- ✅ Build time < 3 min

### Negocio

- ✅ Registro de usuarios funciona
- ✅ Onboarding se completa
- ✅ Dashboard se usa activamente
- ✅ Cero pérdida de datos

---

## 🆘 Plan de Rollback

Si algo falla:

1. **En Vercel Dashboard:**
   - Ir a Deployments
   - Click en el deploy anterior (working)
   - Click "Promote to Production"

2. **Tiempo de rollback:** < 1 minuto

3. **Sin downtime:** cambio instantáneo

---

## 📝 Notas Adicionales

### Variables de Entorno por Ambiente

**Development (.env.local):**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Production (Vercel):**
```bash
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### URLs a Actualizar

Cuando cambies de dominio, actualizar en:
1. ✅ Google OAuth Console
2. ✅ Supabase Authentication
3. ✅ Vercel Environment Variables
4. ✅ Sentry (si aplica)
5. ✅ Google Analytics (si aplica)

---

## 🎯 Contactos Importantes

- **Soporte Vercel:** support@vercel.com
- **Soporte Supabase:** support@supabase.io
- **Docs Next.js:** https://nextjs.org/docs
- **Community:** Discord servers de cada plataforma

---

**✅ Última actualización:** Noviembre 2025  
**👤 Responsable:** Equipo FINCO  
**🔄 Revisar:** Antes de cada deploy

