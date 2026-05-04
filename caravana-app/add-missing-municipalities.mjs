import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const missingMunicipalities = [
  { name: 'Guaçuí', lat: -20.7742, lng: -41.6789, region: 'Sul' },
  { name: 'Afonso Cláudio', lat: -20.0778, lng: -41.1258, region: 'Serrana' },
  { name: 'João Neiva', lat: -19.7578, lng: -40.3858, region: 'Litoral Norte' },
  { name: 'Aracruz', lat: -19.8206, lng: -40.2733, region: 'Litoral Norte' },
  { name: 'Cachoeiro de Itapemirim', lat: -20.8489, lng: -41.1129, region: 'Sul' },
  { name: 'Vila Pavão', lat: -18.6167, lng: -40.6167, region: 'Noroeste' },
  { name: 'Rio Novo do Sul', lat: -20.8597, lng: -40.9333, region: 'Sul' },
  { name: 'Barra de São Francisco', lat: -18.7528, lng: -40.8908, region: 'Noroeste' },
  { name: 'Nova Venécia', lat: -18.7128, lng: -40.4008, region: 'Noroeste' },
  { name: 'Muniz Freire', lat: -20.4667, lng: -41.4167, region: 'Serrana' },
  { name: 'Alegre', lat: -20.7628, lng: -41.5372, region: 'Sul' },
  { name: 'Linhares', lat: -19.3911, lng: -40.0719, region: 'Litoral Norte' }
];

async function addMunicipalities() {
  console.log('🏙️  Adicionando municípios faltantes...\n');
  
  let added = 0;
  let skipped = 0;
  
  for (const mun of missingMunicipalities) {
    try {
      // Verificar se já existe
      const existing = await prisma.municipality.findFirst({
        where: { name: mun.name }
      });
      
      if (existing) {
        console.log(`⏭️  ${mun.name} - já existe`);
        skipped++;
        continue;
      }
      
      // Adicionar
      await prisma.municipality.create({
        data: {
          name: mun.name,
          lat: mun.lat,
          lng: mun.lng,
          region: mun.region
        }
      });
      
      console.log(`✅ ${mun.name} - ${mun.region}`);
      added++;
      
    } catch (error) {
      console.error(`❌ Erro ao adicionar ${mun.name}:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Adicionados: ${added}`);
  console.log(`⏭️  Já existiam: ${skipped}`);
  console.log(`📝 Total: ${missingMunicipalities.length}\n`);
  
  await prisma.$disconnect();
}

addMunicipalities();
