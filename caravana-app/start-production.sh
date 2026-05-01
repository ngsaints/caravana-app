#!/bin/bash

# Script para iniciar o servidor em produção na Hostinger

echo "🚀 Iniciando Caravana da Cultura - ES"
echo "======================================"

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
fi

# Verificar se dist existe
if [ ! -d "dist" ]; then
  echo "🔨 Fazendo build do frontend..."
  npm run build
fi

# Verificar se o banco existe
if [ ! -f "prisma/dev.db" ]; then
  echo "🗄️ Criando banco de dados..."
  npx prisma db push
fi

# Iniciar servidor
echo "✅ Iniciando servidor..."
npm run server
