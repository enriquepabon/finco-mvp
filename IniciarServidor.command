#!/bin/zsh

# Asegura que npm esté en PATH al ejecutar por doble clic
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

cd "/Users/enriquepabon/Documents/APP´s Enrique Pabon" || exit 1

echo "Instalando dependencias (si es necesario)..."
npm install --silent

echo "Iniciando servidor en http://localhost:3000 ..."
npm start


