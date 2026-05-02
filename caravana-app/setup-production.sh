#!/bin/bash

echo "🚀 Configurando ambiente de produção..."

# Gerar Prisma Client
echo "📦 Gerando Prisma Client..."
npx prisma generate

# Verificar se o banco existe
if [ ! -f "prisma/dev.db" ]; then
    echo "⚠️  Banco de dados não encontrado. Criando..."
    npx prisma db push --accept-data-loss
    
    # Executar seed se existir
    if [ -f "src/server/seed.ts" ]; then
        echo "🌱 Populando banco com dados iniciais..."
        npx tsx src/server/seed.ts
    fi
else
    echo "✅ Banco de dados encontrado"
fi

# Verificar conexão
echo "🔍 Verificando banco de dados..."
node check-production.mjs

echo "✅ Configuração concluída!"
