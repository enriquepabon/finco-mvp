#!/bin/bash

# Script de Verificación - MentorIA
# Verifica que todas las funcionalidades estén correctamente implementadas

echo "🔍 MentorIA - Script de Verificación"
echo "======================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# Función para verificar archivos
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2 - Archivo no encontrado: $1"
        ((FAILED++))
    fi
}

# Función para verificar directorios
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2 - Directorio no encontrado: $1"
        ((FAILED++))
    fi
}

echo "📁 Verificando estructura de archivos..."
echo ""

# Migraciones
echo "🗄️  Migraciones:"
check_file "supabase/migrations/20251107000001_create_user_habits_table.sql" "Migración de user_habits"
check_file "supabase/migrations/20251107000002_create_badges_tables.sql" "Migración de badges"

echo ""

# Librería de Hábitos
echo "🔥 Sistema de Hábitos:"
check_file "src/lib/habits/tracker.ts" "tracker.ts"
check_file "src/lib/habits/streaks.ts" "streaks.ts"

echo ""

# Librería de Gamificación
echo "🏆 Sistema de Gamificación:"
check_file "src/lib/gamification/badges.ts" "badges.ts"
check_file "src/lib/gamification/celebrations.ts" "celebrations.ts"

echo ""

# API Routes - Habits
echo "🌐 API Routes - Hábitos:"
check_file "src/app/api/habits/[userId]/route.ts" "GET /api/habits/[userId]"
check_file "src/app/api/habits/track/route.ts" "POST /api/habits/track"

echo ""

# API Routes - Badges
echo "🌐 API Routes - Badges:"
check_file "src/app/api/badges/[userId]/route.ts" "GET /api/badges/[userId]"
check_file "src/app/api/badges/check/route.ts" "POST /api/badges/check"

echo ""

# Componentes
echo "🎨 Componentes React:"
check_file "src/components/habits/HabitTracker.tsx" "HabitTracker"
check_file "src/components/habits/StreakIndicator.tsx" "StreakIndicator"

echo ""

# Constantes
echo "📝 Constantes de Marca:"
check_file "src/lib/constants/mentoria-brand.ts" "mentoria-brand.ts"

echo ""

# Landing Page
echo "🚀 Landing Page:"
check_file "src/app/landing/page.tsx" "Landing page"
check_file "src/app/landing/layout.tsx" "Landing layout"
check_file "src/components/branding/Navigation.tsx" "Navigation"

echo ""

# Verificar package.json para dependencias
echo "📦 Verificando dependencias..."
if [ -f "package.json" ]; then
    if grep -q "framer-motion" package.json; then
        echo -e "${GREEN}✓${NC} framer-motion instalado"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} framer-motion no encontrado - Ejecuta: npm install framer-motion"
        ((FAILED++))
    fi

    if grep -q "lucide-react" package.json; then
        echo -e "${GREEN}✓${NC} lucide-react instalado"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} lucide-react no encontrado - Ejecuta: npm install lucide-react"
        ((FAILED++))
    fi
fi

echo ""
echo "======================================"
echo "📊 Resultados:"
echo -e "${GREEN}✓ Pasaron: $PASSED${NC}"
echo -e "${RED}✗ Fallaron: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Todo listo! Todos los archivos están en su lugar.${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Ejecuta las migraciones en Supabase"
    echo "2. Verifica que .env.local esté configurado"
    echo "3. Ejecuta: npm run dev"
    echo "4. Visita: http://localhost:3000"
else
    echo -e "${YELLOW}⚠️  Algunos archivos faltan. Revisa los errores arriba.${NC}"
fi

echo ""
echo "📖 Para más información, consulta: TESTING_GUIDE.md"
echo ""

