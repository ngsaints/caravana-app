import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCoordinates() {
  const entities = await prisma.entity.findMany({ 
    where: { status: 'active' } 
  });
  
  console.log('Total entidades ativas:', entities.length);
  
  const invalid = entities.filter(e => 
    !e.lat || !e.lng || 
    e.lat === 0 || e.lng === 0 || 
    isNaN(e.lat) || isNaN(e.lng) ||
    e.lat < -22 || e.lat > -17 ||  // Fora do ES
    e.lng < -42 || e.lng > -39
  );
  
  console.log('Com coordenadas inválidas ou fora do ES:', invalid.length);
  
  invalid.forEach(e => {
    console.log(`- ${e.name} (${e.municipality}): lat=${e.lat}, lng=${e.lng}`);
  });
  
  const valid = entities.filter(e => 
    e.lat && e.lng && 
    e.lat !== 0 && e.lng !== 0 && 
    !isNaN(e.lat) && !isNaN(e.lng) &&
    e.lat >= -22 && e.lat <= -17 &&
    e.lng >= -42 && e.lng <= -39
  );
  
  console.log('\nEntidades válidas que devem aparecer no mapa:', valid.length);
  
  await prisma.$disconnect();
  process.exit(0);
}

checkCoordinates();
