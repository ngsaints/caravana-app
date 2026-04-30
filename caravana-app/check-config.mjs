import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConfig() {
  try {
    console.log('🔍 Verificando configurações...\n');
    
    const configs = await prisma.config.findMany();
    
    if (configs.length === 0) {
      console.log('❌ Nenhuma configuração encontrada no banco');
    } else {
      console.log(`✅ ${configs.length} configuração(ões) encontrada(s):\n`);
      
      for (const config of configs) {
        console.log(`Key: ${config.key}`);
        if (config.key === 'GEMINI_TOKENS') {
          try {
            const tokens = JSON.parse(config.value);
            console.log(`  Valor: ${tokens.length} token(s) Gemini`);
          } catch {
            console.log(`  Valor: ${config.value.substring(0, 50)}...`);
          }
        } else {
          const masked = config.value.substring(0, 10) + '...' + config.value.substring(config.value.length - 5);
          console.log(`  Valor: ${masked}`);
        }
        console.log(`  Atualizado: ${new Date(config.updatedAt).toLocaleString('pt-BR')}\n`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfig();
