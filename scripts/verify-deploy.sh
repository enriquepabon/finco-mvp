#!/bin/bash

# ==============================================================================
# Script de Verificación Pre-Deploy para FINCO
# ==============================================================================
# Este script verifica que todo esté listo antes de hacer deploy
# ==============================================================================

echo "🚀 FINCO - Verificación Pre-Deploy"
echo "===================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
WARNINGS=0

# ==============================================================================
# 1. Verificar Node.js y npm
# ==============================================================================
echo "📦 Verificando Node.js y npm..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js instalado: $NODE_VERSION"
    ((PASSED++))
    
    if [[ "${NODE_VERSION:1:2}" -ge 18 ]]; then
        echo -e "${GREEN}✓${NC} Versión de Node.js compatible (>= 18)"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Node.js debe ser versión 18 o superior"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} Node.js no está instalado"
    ((FAILED++))
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm instalado: v$NPM_VERSION"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} npm no está instalado"
    ((FAILED++))
fi

echo ""

# ==============================================================================
# 2. Verificar Git
# ==============================================================================
echo "🔧 Verificando Git..."
if command -v git &> /dev/null; then
    echo -e "${GREEN}✓${NC} Git instalado"
    ((PASSED++))
    
    # Verificar si hay cambios sin commitear
    if git diff-index --quiet HEAD --; then
        echo -e "${GREEN}✓${NC} No hay cambios sin commitear"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Hay cambios sin commitear"
        echo "  Ejecutar: git add . && git commit -m 'feat: prepare for deploy'"
        ((WARNINGS++))
    fi
    
    # Verificar remote
    if git remote get-url origin &> /dev/null; then
        REMOTE_URL=$(git remote get-url origin)
        echo -e "${GREEN}✓${NC} Remote configurado: $REMOTE_URL"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} No hay remote configurado"
        echo "  Ejecutar: git remote add origin https://github.com/usuario/repo.git"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} Git no está instalado"
    ((FAILED++))
fi

echo ""

# ==============================================================================
# 3. Verificar package.json
# ==============================================================================
echo "📄 Verificando package.json..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json existe"
    ((PASSED++))
    
    # Verificar scripts requeridos
    if grep -q '"build"' package.json; then
        echo -e "${GREEN}✓${NC} Script 'build' encontrado"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Script 'build' no encontrado en package.json"
        ((FAILED++))
    fi
    
    if grep -q '"start"' package.json; then
        echo -e "${GREEN}✓${NC} Script 'start' encontrado"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Script 'start' no encontrado en package.json"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} package.json no existe"
    ((FAILED++))
fi

echo ""

# ==============================================================================
# 4. Verificar dependencias
# ==============================================================================
echo "📚 Verificando dependencias..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules existe"
    ((PASSED++))
    
    # Verificar dependencias críticas
    CRITICAL_DEPS=("next" "react" "@supabase/supabase-js" "@google/generative-ai")
    
    for dep in "${CRITICAL_DEPS[@]}"; do
        if [ -d "node_modules/$dep" ]; then
            echo -e "${GREEN}✓${NC} $dep instalado"
            ((PASSED++))
        else
            echo -e "${RED}✗${NC} $dep NO instalado"
            ((FAILED++))
        fi
    done
else
    echo -e "${RED}✗${NC} node_modules no existe. Ejecutar: npm install"
    ((FAILED++))
fi

echo ""

# ==============================================================================
# 5. Verificar archivos de configuración
# ==============================================================================
echo "⚙️  Verificando archivos de configuración..."
CONFIG_FILES=("next.config.ts" "tsconfig.json" ".gitignore")

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file existe"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $file no encontrado"
        ((FAILED++))
    fi
done

# Verificar .vercelignore
if [ -f ".vercelignore" ]; then
    echo -e "${GREEN}✓${NC} .vercelignore existe (optimización)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} .vercelignore no existe (opcional pero recomendado)"
    ((WARNINGS++))
fi

# Verificar vercel.json
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓${NC} vercel.json existe (configuración)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} vercel.json no existe (opcional)"
    ((WARNINGS++))
fi

echo ""

# ==============================================================================
# 6. Verificar variables de entorno
# ==============================================================================
echo "🔐 Verificando variables de entorno..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local existe"
    ((PASSED++))
    
    # Verificar variables críticas
    REQUIRED_VARS=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "GOOGLE_GEMINI_API_KEY"
    )
    
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" .env.local && ! grep -q "^${var}=tu-" .env.local; then
            echo -e "${GREEN}✓${NC} $var está configurado"
            ((PASSED++))
        else
            echo -e "${RED}✗${NC} $var NO está configurado o tiene valor de ejemplo"
            ((FAILED++))
        fi
    done
else
    echo -e "${RED}✗${NC} .env.local no existe"
    echo "  Copiar: cp .env.example .env.local"
    ((FAILED++))
fi

# Verificar que .env.local NO esté en git
if grep -q ".env.local" .gitignore; then
    echo -e "${GREEN}✓${NC} .env.local está en .gitignore"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} .env.local NO está en .gitignore (CRÍTICO)"
    ((FAILED++))
fi

echo ""

# ==============================================================================
# 7. Verificar build
# ==============================================================================
echo "🏗️  Verificando build..."
echo "  Ejecutando: npm run build (esto puede tardar 1-2 minutos)"

if npm run build &> /dev/null; then
    echo -e "${GREEN}✓${NC} Build exitoso"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Build falló"
    echo "  Ejecutar manualmente: npm run build"
    echo "  Y revisar los errores"
    ((FAILED++))
fi

echo ""

# ==============================================================================
# 8. Verificar TypeScript
# ==============================================================================
echo "📘 Verificando TypeScript..."
if npm run type-check &> /dev/null; then
    echo -e "${GREEN}✓${NC} Sin errores de TypeScript"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Hay errores de TypeScript"
    echo "  Ejecutar: npm run type-check para ver detalles"
    ((WARNINGS++))
fi

echo ""

# ==============================================================================
# 9. Verificar estructura del proyecto
# ==============================================================================
echo "📁 Verificando estructura del proyecto..."
REQUIRED_DIRS=("src" "src/app" "src/components" "public")

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} Directorio $dir existe"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Directorio $dir no encontrado"
        ((FAILED++))
    fi
done

echo ""

# ==============================================================================
# Resumen
# ==============================================================================
echo ""
echo "===================================="
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "===================================="
echo -e "${GREEN}✓ Verificaciones pasadas:${NC} $PASSED"
echo -e "${YELLOW}⚠ Advertencias:${NC} $WARNINGS"
echo -e "${RED}✗ Verificaciones fallidas:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡TODO LISTO PARA DEPLOY!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. git push origin main"
    echo "2. Ir a vercel.com e importar proyecto"
    echo "3. Configurar variables de entorno en Vercel"
    echo "4. ¡Deploy automático!"
    echo ""
    exit 0
else
    echo -e "${RED}❌ HAY PROBLEMAS QUE RESOLVER${NC}"
    echo ""
    echo "Por favor corrige los errores marcados con ✗ antes de deployar."
    echo ""
    exit 1
fi

