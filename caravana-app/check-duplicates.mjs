import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
  const entities = await prisma.entity.findMany({ 
    where: { status: 'active' },
    select: { id: true, name: true, municipality: true, lat: true, lng: true }
  });
  
  console.log('Total entidades ativas:', entities.length);
  
  // Agrupar por coordenadas
  const coordMap = new Map();
  
  entities.forEach(e => {
    const key = `${e.lat.toFixed(6)},${e.lng.toFixed(6)}`;
    if (!coordMap.has(key)) {
      coordMap.set(key, []);
    }
    coordMap.get(key).push(e);
  });
  
  console.log('\nCoordenadas únicas:', coordMap.size);
  
  // Mostrar coordenadas duplicadas
  let duplicateCount = 0;
  coordMap.forEach((entities, coords) => {
    if (entities.length > 1) {
      duplicateCount += entities.length;
      console.log(`\n${coords} (${entities.length} entidades):`);
      entities.forEach(e => console.log(`  - ${e.name} (${e.municipality})`));
    }
  });
  
  console.log(`\nTotal de entidades com coordenadas duplicadas: ${duplicateCount}`);
  console.log(`Marcadores visíveis no mapa: ${coordMap.size}`);
  
  await prisma.$disconnect();
  process.exit(0);
}

checkDuplicates();
