import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDB() {
  try {
    console.log('📊 Verificando banco de dados...\n');
    
    // Total de entidades
    const total = await prisma.entity.count();
    console.log(`Total de entidades: ${total}`);
    
    // Por status
    const byStatus = await prisma.entity.groupBy({
      by: ['status'],
      _count: true
    });
    
    console.log('\nPor status:');
    byStatus.forEach(s => {
      console.log(`  ${s.status}: ${s._count}`);
    });
    
    // Últimas 10 entidades criadas
    const recent = await prisma.entity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        municipality: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log('\nÚltimas 10 entidades criadas:');
    recent.forEach(e => {
      console.log(`  [${e.status}] ${e.name} - ${e.municipality} (${new Date(e.createdAt).toLocaleString('pt-BR')})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDB();
