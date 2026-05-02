import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando ambiente de produção...\n');

// Verificar se o banco existe
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
console.log(`📁 Caminho do banco: ${dbPath}`);
console.log(`✅ Banco existe: ${fs.existsSync(dbPath)}`);

if (fs.existsSync(dbPath)) {
  const stats = fs.statSync(dbPath);
  console.log(`📊 Tamanho do banco: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

// Tentar conectar ao banco
try {
  const prisma = new PrismaClient();
  
  console.log('\n🔌 Testando conexão com o banco...');
  
  const entityCount = await prisma.entity.count();
  console.log(`✅ Entidades no banco: ${entityCount}`);
  
  const municipalityCount = await prisma.municipality.count();
  console.log(`✅ Municípios no banco: ${municipalityCount}`);
  
  const configCount = await prisma.config.count();
  console.log(`✅ Configurações no banco: ${configCount}`);
  
  const byStatus = await prisma.entity.groupBy({
    by: ['status'],
    _count: true
  });
  
  console.log('\n📊 Entidades por status:');
  byStatus.forEach(item => {
    console.log(`   ${item.status}: ${item._count}`);
  });
  
  await prisma.$disconnect();
  console.log('\n✅ Tudo funcionando corretamente!');
  
} catch (error) {
  console.error('\n❌ Erro ao conectar ao banco:', error.message);
  console.error('\n💡 Solução: Execute "npx prisma generate" e "npx prisma db push"');
  process.exit(1);
}
