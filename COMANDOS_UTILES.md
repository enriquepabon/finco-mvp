# 🛠️ Comandos Útiles para Despliegue - MentorIA

## 🚀 Scripts de Despliegue

### Verificar que todo está listo para deploy
```bash
# Ejecutar script de verificación
./scripts/verify-deploy.sh

# O manualmente:
chmod +x scripts/verify-deploy.sh && ./scripts/verify-deploy.sh
```

### Build local para testing
```bash
# Build de producción
npm run build

# Iniciar servidor de producción localmente
npm start

# Abrir en: http://localhost:3000
```

### Deploy a Vercel (después de configurar)
```bash
# Primera vez: instalar CLI de Vercel
npm i -g vercel

# Deploy
vercel

# Deploy a producción directamente
vercel --prod
```

---

## 🔧 Comandos de Desarrollo

### Iniciar servidor de desarrollo
```bash
npm run dev
```

### Type checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint

# Auto-fix errores de lint
npm run lint -- --fix
```

### Testing
```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

---

## 🐙 Comandos Git

### Preparar para deploy
```bash
# Ver estado
git status

# Agregar todos los archivos
git add .

# Commit con mensaje descriptivo
git commit -m "feat: prepare for production deployment"

# Push a GitHub
git push origin main
```

### Verificar remote
```bash
# Ver remote configurado
git remote -v

# Agregar remote si no existe
git remote add origin https://github.com/tu-usuario/finco-app.git

# Cambiar remote
git remote set-url origin https://github.com/tu-usuario/finco-app.git
```

---

## 🔐 Comandos de Variables de Entorno

### Copiar template de .env
```bash
cp .env.example .env.local
```

### Verificar variables (sin mostrar valores)
```bash
# Ver qué variables están definidas
grep -o '^[^=]*' .env.local | sort

# Contar variables definidas
grep -c '^[A-Z]' .env.local
```

### Exportar variables para testing local
```bash
# Cargar .env.local en terminal actual
export $(cat .env.local | xargs)

# Verificar que se cargaron
echo $NEXT_PUBLIC_SUPABASE_URL
```

---

## 🐳 Comandos Docker (Opcional)

### Build imagen Docker
```bash
# Build
docker build -t finco-app .

# Build sin cache
docker build --no-cache -t finco-app .
```

### Ejecutar contenedor
```bash
# Ejecutar con variables de entorno
docker run -p 3000:3000 \
  --env-file .env.local \
  finco-app

# Ejecutar en background
docker run -d -p 3000:3000 \
  --env-file .env.local \
  --name finco-container \
  finco-app
```

### Docker Compose
```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Rebuild y restart
docker-compose up -d --build
```

### Comandos útiles Docker
```bash
# Ver contenedores corriendo
docker ps

# Ver logs de contenedor
docker logs finco-container

# Entrar al contenedor
docker exec -it finco-container sh

# Detener contenedor
docker stop finco-container

# Eliminar contenedor
docker rm finco-container

# Eliminar imagen
docker rmi finco-app
```

---

## 🔍 Comandos de Debugging

### Verificar puerto ocupado
```bash
# Ver qué está usando el puerto 3000
lsof -i :3000

# Matar proceso en puerto 3000
kill -9 $(lsof -t -i:3000)
```

### Verificar conexión a Supabase
```bash
# Usando curl
curl -H "apikey: TU_ANON_KEY" \
  https://tu-proyecto.supabase.co/rest/v1/

# Debe responder con info de las tablas
```

### Verificar API de OpenAI
```bash
# Usando curl
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Debe responder con texto generado
```

---

## 📊 Comandos de Monitoreo

### Ver tamaño del bundle
```bash
# Después de build
du -sh .next

# Ver archivos más grandes
du -h .next/* | sort -rh | head -20
```

### Analizar bundle
```bash
# Instalar analyzer
npm install --save-dev @next/bundle-analyzer

# Agregar a next.config.ts:
# const withBundleAnalyzer = require('@next/bundle-analyzer')({
#   enabled: process.env.ANALYZE === 'true',
# })

# Analizar
ANALYZE=true npm run build
```

### Ver uso de memoria
```bash
# Durante desarrollo
ps aux | grep node

# Más detallado
top -pid $(pgrep -f "next dev")
```

---

## 🧹 Comandos de Limpieza

### Limpiar cache y rebuild
```bash
# Eliminar .next y node_modules
rm -rf .next node_modules

# Reinstalar
npm install

# Rebuild
npm run build
```

### Limpiar solo cache
```bash
# Eliminar .next
rm -rf .next

# Cache de npm
npm cache clean --force
```

### Limpiar Docker
```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes sin usar
docker image prune

# Limpieza completa (cuidado)
docker system prune -a
```

---

## 🔄 Comandos de Update

### Actualizar dependencias
```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas (cuidado)
npm update

# Actualizar una específica
npm update next

# Actualizar a última versión (breaking changes)
npm install next@latest
```

### Verificar seguridad
```bash
# Audit de seguridad
npm audit

# Fix automático
npm audit fix

# Fix forzado (puede romper cosas)
npm audit fix --force
```

---

## 📦 Comandos de Backup

### Crear backup de base de datos
```bash
# En Supabase Dashboard:
# Settings → Database → Backups

# O vía CLI (si tienes configurado):
supabase db dump > backup.sql
```

### Backup de código
```bash
# Crear bundle de git
git bundle create finco-backup.bundle --all

# Restaurar desde bundle
git clone finco-backup.bundle finco-app-restored
```

### Backup de .env
```bash
# Copiar .env.local a lugar seguro (NUNCA a Git)
cp .env.local ~/Backups/finco-env-$(date +%Y%m%d).local

# O usar password manager para guardar variables
```

---

## 🚨 Comandos de Emergencia

### Rollback rápido en Vercel
```bash
# Vía CLI
vercel rollback

# O en Dashboard:
# Deployments → Click en deploy anterior → Promote to Production
```

### Desactivar sitio temporalmente
```bash
# Crear archivo public/maintenance.html
# Configurar redirect en vercel.json

# O simplemente:
# Vercel Dashboard → Settings → Pause Deployment
```

### Ver logs en tiempo real (Vercel)
```bash
vercel logs --follow

# Logs de una función específica
vercel logs /api/chat --follow
```

---

## 💡 Tips y Trucos

### Alias útiles para .zshrc o .bashrc
```bash
# Agregar a ~/.zshrc:
alias finco-dev="cd ~/Projects/finco-app && npm run dev"
alias finco-build="cd ~/Projects/finco-app && npm run build"
alias finco-deploy="cd ~/Projects/finco-app && git push && vercel --prod"
alias finco-verify="cd ~/Projects/finco-app && ./scripts/verify-deploy.sh"
```

### Script de deploy rápido
```bash
# Crear script scripts/quick-deploy.sh:
#!/bin/bash
npm run type-check && \
npm run lint && \
npm run build && \
git add . && \
git commit -m "feat: deploy $(date +%Y-%m-%d)" && \
git push origin main

# Hacer ejecutable:
chmod +x scripts/quick-deploy.sh

# Usar:
./scripts/quick-deploy.sh
```

---

## 📚 Recursos y Documentación

### Vercel CLI
```bash
# Ver todos los comandos
vercel --help

# Ver variables de entorno en Vercel
vercel env ls

# Agregar variable de entorno
vercel env add NEXT_PUBLIC_APP_URL production

# Ver dominios
vercel domains ls
```

### Next.js CLI
```bash
# Ver info del proyecto
next info

# Build con debug
next build --debug

# Start con puerto custom
next start -p 3001
```

---

## 🔐 Comandos de Seguridad

### Verificar archivos expuestos
```bash
# Verificar que .env.local NO esté en git
git ls-files | grep .env

# Ver qué se incluirá en próximo commit
git status --short

# Ver archivos ignorados
git status --ignored
```

### Generar secrets seguros
```bash
# Para JWT secrets, etc.
openssl rand -base64 32
```

---

## 📞 Soporte

Si algún comando no funciona:

1. **Verificar versión de Node:**
   ```bash
   node -v  # Debe ser >= 18
   ```

2. **Limpiar e reinstalar:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Ver logs completos:**
   ```bash
   npm run build --verbose
   ```

4. **Buscar ayuda:**
   - [Docs Vercel](https://vercel.com/docs)
   - [Docs Next.js](https://nextjs.org/docs)
   - [Supabase Support](https://supabase.com/support)

---

**💡 Tip:** Guarda este archivo como referencia rápida durante el desarrollo y despliegue.

