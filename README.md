# 🏦 FINCO - Plataforma Financiera Inteligente

[![CI](https://github.com/enriquepabon/finco-mvp/actions/workflows/ci.yml/badge.svg)](https://github.com/enriquepabon/finco-mvp/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-orange?style=for-the-badge&logo=google)](https://ai.google.dev/)

> **Tu coach financiero personal impulsado por inteligencia artificial**

FINCO es una plataforma financiera moderna que combina la potencia de la IA conversacional con herramientas avanzadas de análisis financiero para ayudarte a tomar el control de tus finanzas personales.

## ✨ Características Principales

### 🤖 **IA Conversacional Avanzada**
- **Coach financiero personal** con personalidad empática y experta
- **Onboarding inteligente** con 9 preguntas estructuradas
- **Parser inteligente** que entiende respuestas en español natural
- **Google Gemini 1.5 Flash** para conversaciones fluidas y contextuales

### 📊 **Dashboard Profesional**
- **Componentes editables** para actualización en tiempo real
- **4 KPIs financieros** calculados automáticamente:
  - 🏆 Patrimonio Neto
  - 🎯 Capacidad de Ahorro  
  - ⚠️ Nivel de Endeudamiento
  - 🛡️ Fondo de Emergencia

### 📈 **Visualizaciones Avanzadas**
- **Gráfico de patrimonio** (dona interactiva)
- **Análisis de flujo de caja** (barras comparativas)
- **Tooltips informativos** con datos detallados
- **Responsive design** para móvil y desktop

### 🔒 **Seguridad Empresarial**
- **Autenticación OAuth** con Google
- **Row Level Security (RLS)** en Supabase
- **Datos encriptados** y políticas granulares
- **Sessions seguras** con Next.js SSR

## 🚀 Demo en Vivo

**🌐 [Ver Demo](https://finco-mvp.vercel.app)**

### 📱 Funcionalidades Disponibles:
1. **Registro/Login** con Google OAuth
2. **Onboarding conversacional** con FINCO
3. **Dashboard interactivo** con gráficas
4. **Edición de perfil** en tiempo real
5. **Análisis financiero** automático

## 🛠️ Stack Tecnológico

### **Frontend**
- ⚡ **Next.js 15.4.2** - Framework React con Turbopack
- 🎨 **Tailwind CSS** - Styling moderno y responsive
- 📊 **Recharts** - Gráficas interactivas profesionales
- 🎭 **Lucide React** - Iconos modernos y consistentes
- 🧩 **Headless UI** - Componentes accesibles
- 📱 **PWA** - Soporte nativo para aplicación web

### **Backend & Base de Datos**
- 🗄️ **Supabase** - Backend-as-a-Service con PostgreSQL
- 🔐 **Row Level Security** - Seguridad granular por usuario
- 🚀 **Supabase SSR** - Server-side rendering optimizado
- 🔑 **Google OAuth** - Autenticación social segura

### **Inteligencia Artificial**
- 🤖 **Google Gemini 1.5 Flash** - IA conversacional avanzada
- 🧠 **Parser inteligente** - Procesamiento de lenguaje natural
- 💬 **Sistema de contexto** - Conversaciones coherentes
- 📝 **Análisis semántico** - Comprensión de respuestas complejas

### **Desarrollo**
- 📘 **TypeScript** - Tipado estático completo
- 🔍 **ESLint** - Linting de código
- 🎯 **Prettier** - Formato consistente
- 🧪 **Testing Scripts** - Pruebas automatizadas

## 📦 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase
- API Key de Google Gemini
- Proyecto OAuth en Google Console

### **1. Clonar el repositorio**
```bash
git clone https://github.com/enriquepabon/finco-mvp.git
cd finco-mvp
```

### **2. Instalar dependencias**
```bash
npm install
```

### **3. Configurar variables de entorno**

FINCO utiliza **validación automática de variables de entorno con Zod** para garantizar que todas las configuraciones requeridas estén presentes antes de iniciar la aplicación.

#### **Paso 1: Copiar archivo de ejemplo**
```bash
cp .env.example .env.local
```

#### **Paso 2: Configurar variables requeridas**

Editar `.env.local` con tus credenciales:

```bash
# ==============================================================================
# VARIABLES REQUERIDAS (obligatorias para que la app funcione)
# ==============================================================================

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase - Obtener de: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Google Gemini AI - Obtener de: https://makersuite.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=tu-gemini-api-key-aqui
```

#### **Paso 3: (Opcional) Configurar servicios adicionales**

```bash
# ==============================================================================
# VARIABLES OPCIONALES (mejoran la experiencia pero no son obligatorias)
# ==============================================================================

# Upstash Redis - Para caché (mejora rendimiento)
# Obtener de: https://console.upstash.com
UPSTASH_REDIS_URL=https://tu-redis.upstash.io
UPSTASH_REDIS_TOKEN=tu-redis-token-aqui

# Sentry - Para monitoreo de errores en producción
# Obtener de: https://sentry.io
SENTRY_DSN=https://tu-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://tu-sentry-dsn@sentry.io/project-id
```

#### **🔍 Validación automática**

La aplicación valida todas las variables de entorno al iniciar usando **Zod schemas**:
- ✅ Si todas las variables requeridas están configuradas → La app inicia correctamente
- ❌ Si falta alguna variable requerida → Muestra error claro indicando qué falta
- 🎯 Proporciona **TypeScript autocomplete** para todas las variables

**Ejemplo de error si falta una variable:**
```
ZodError: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": ["GOOGLE_GEMINI_API_KEY"],
    "message": "GOOGLE_GEMINI_API_KEY is required"
  }
]
```

#### **📚 Documentación de variables**

| Variable | Tipo | Requerida | Descripción | Dónde obtenerla |
|----------|------|-----------|-------------|-----------------|
| `NEXT_PUBLIC_APP_URL` | URL | ✅ Sí | URL de la aplicación | `http://localhost:3000` en desarrollo |
| `NEXT_PUBLIC_SUPABASE_URL` | URL | ✅ Sí | URL de tu proyecto Supabase | [Supabase Dashboard](https://app.supabase.com/project/_/settings/api) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | String | ✅ Sí | Clave anónima de Supabase | [Supabase Dashboard](https://app.supabase.com/project/_/settings/api) |
| `SUPABASE_SERVICE_ROLE_KEY` | String | ✅ Sí | Clave de servicio de Supabase | [Supabase Dashboard](https://app.supabase.com/project/_/settings/api) |
| `GOOGLE_GEMINI_API_KEY` | String | ✅ Sí | API Key de Google Gemini | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `UPSTASH_REDIS_URL` | URL | ❌ No | URL de Redis para caché | [Upstash Console](https://console.upstash.com) |
| `UPSTASH_REDIS_TOKEN` | String | ❌ No | Token de autenticación Redis | [Upstash Console](https://console.upstash.com) |
| `SENTRY_DSN` | URL | ❌ No | DSN de Sentry (backend) | [Sentry Dashboard](https://sentry.io) |
| `NEXT_PUBLIC_SENTRY_DSN` | URL | ❌ No | DSN de Sentry (frontend) | [Sentry Dashboard](https://sentry.io) |

### **4. Configurar base de datos**
Ejecutar en Supabase SQL Editor:
```sql
-- Crear tabla de perfiles
\i sql/create_user_profiles_table.sql
```

### **5. Configurar OAuth**
En Google Console:
- **Authorized JavaScript origins**: `http://localhost:3000`
- **Authorized redirect URIs**: `http://localhost:3000/auth/callback`

### **6. Iniciar desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 📊 Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Supabase)    │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ • Chat UI       │    │ • Auth          │    │ • user_profiles │
│ • Dashboard     │    │ • RLS           │    │ • Triggers      │
│ • Components    │    │ • Edge Funcs    │    │ • Policies      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   AI Engine     │    │   Auth Provider │
│ (Google Gemini) │    │    (Google)     │
│                 │    │                 │
│ • Conversations │    │ • OAuth 2.0     │
│ • Context       │    │ • JWT Tokens    │
│ • Parsing       │    │ • Sessions      │
└─────────────────┘    └─────────────────┘
```

## 🎯 Flujo de Usuario

### **1. Autenticación**
```
Usuario → Google OAuth → Callback → Verificación → Dashboard/Onboarding
```

### **2. Onboarding Conversacional**
```
Chat FINCO → 9 Preguntas → Parser → Validación → Base de Datos → Dashboard
```

### **3. Dashboard Interactivo**
```
Visualización → Edición → Validación → Cálculos → Gráficas → Análisis
```

## 📈 Funcionalidades Implementadas

### ✅ **Fase 1: Configuración Base**
- [x] Next.js 15 con TypeScript
- [x] Tailwind CSS configurado
- [x] PWA nativo implementado
- [x] Dependencias modernas

### ✅ **Fase 2: Backend Supabase**
- [x] Cliente Supabase configurado
- [x] Base de datos con RLS
- [x] Triggers automáticos
- [x] Políticas de seguridad

### ✅ **Fase 3: Autenticación**
- [x] Google OAuth implementado
- [x] AuthProvider con contexto
- [x] Protección de rutas
- [x] Manejo de sesiones

### ✅ **Fase 4: IA Conversacional**
- [x] Google Gemini integrado
- [x] Chat con FINCO
- [x] Parser inteligente
- [x] Onboarding automático

### ✅ **Fase 5: Dashboard Avanzado**
- [x] Componentes editables
- [x] KPIs financieros
- [x] Gráficas profesionales
- [x] Análisis en tiempo real

## 🔮 Roadmap Futuro

### **🔄 Fase 6: Gestión de Presupuestos**
- [ ] Categorías personalizables
- [ ] Seguimiento de transacciones
- [ ] Alertas inteligentes
- [ ] Reportes automáticos

### **🎯 Fase 7: Metas de Ahorro**
- [ ] Definición de objetivos
- [ ] Tracking de progreso
- [ ] Recomendaciones IA
- [ ] Gamificación

### **📊 Fase 8: Análisis Predictivo**
- [ ] Machine Learning
- [ ] Predicciones financieras
- [ ] Comparativas de mercado
- [ ] Insights personalizados

## 🤝 Contribuir

### **Reportar Bugs**
Crear un [issue](https://github.com/enriquepabon/finco-mvp/issues) con:
- Descripción del problema
- Pasos para reproducir
- Capturas de pantalla
- Información del entorno

### **Solicitar Funcionalidades**
Abrir un [issue](https://github.com/enriquepabon/finco-mvp/issues) con:
- Descripción de la funcionalidad
- Casos de uso
- Beneficios esperados
- Mockups (opcional)

### **Pull Requests**
1. Fork del repositorio
2. Crear rama para la funcionalidad
3. Commits descriptivos
4. Tests actualizados
5. Documentación actualizada

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Enrique Pabón**
- GitHub: [@enriquepabon](https://github.com/enriquepabon)
- LinkedIn: [Enrique Pabón](https://linkedin.com/in/enriquepabon)

## 🙏 Agradecimientos

- **Google Gemini** por la IA conversacional
- **Supabase** por el backend robusto
- **Next.js** por el framework increíble
- **Recharts** por las visualizaciones
- **Tailwind CSS** por el styling moderno

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella en GitHub ⭐**

[🌟 Star en GitHub](https://github.com/enriquepabon/finco-mvp) • [🐛 Reportar Bug](https://github.com/enriquepabon/finco-mvp/issues) • [💡 Solicitar Feature](https://github.com/enriquepabon/finco-mvp/issues)

**Hecho con ❤️ en Colombia 🇨🇴**

</div>
