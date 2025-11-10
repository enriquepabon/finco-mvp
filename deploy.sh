#!/bin/bash

# Script de deployment rápido para MentorIA
# Uso: ./deploy.sh "mensaje del commit"

echo "🚀 Iniciando deployment de MentorIA..."

# Verificar si hay cambios
if [[ -z $(git status -s) ]]; then
    echo "❌ No hay cambios para desplegar"
    exit 1
fi

# Mostrar cambios
echo "📝 Cambios detectados:"
git status -s

# Agregar todos los cambios
git add .

# Hacer commit
if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar un mensaje de commit"
    echo "Uso: ./deploy.sh 'mensaje del commit'"
    exit 1
fi

git commit -m "$1"

# Push a main
echo "⬆️  Subiendo cambios a GitHub..."
git push origin main

echo "✅ Cambios enviados!"
echo "🔄 Vercel comenzará el deployment automáticamente"
echo "📊 Monitorea el progreso en: https://vercel.com/dashboard"
echo ""
echo "🌐 Tu sitio: https://finco-mvp.vercel.app"

