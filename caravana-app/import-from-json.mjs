import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();

// Mapear coordenadas para municípios
function getMunicipalityFromCoords(lat, lng) {
  const municipalities = [
    { name: 'Vitória', lat: -20.2976, lng: -40.2958 },
    { name: 'Vila Velha', lat: -20.3297, lng: -40.2925 },
    { name: 'Serra', lat: -20.1288, lng: -40.3078 },
    { name: 'Cariacica', lat: -20.2620, lng: -40.4165 },
    { name: 'Cachoeiro de Itapemirim', lat: -20.8489, lng: -41.1129 },
    { name: 'Linhares', lat: -19.3911, lng: -40.0719 },
    { name: 'São Mateus', lat: -18.7167, lng: -39.8597 },
    { name: 'Colatina', lat: -19.5397, lng: -40.6308 },
    { name: 'Guarapari', lat: -20.6667, lng: -40.5000 },
    { name: 'Aracruz', lat: -19.8206, lng: -40.2733 },
    { name: 'Viana', lat: -20.3833, lng: -40.4958 },
    { name: 'Alegre', lat: -20.7628, lng: -41.5372 },
    { name: 'Castelo', lat: -20.6072, lng: -41.1867 },
    { name: 'Domingos Martins', lat: -20.3631, lng: -40.6631 },
    { name: 'Itapemirim', lat: -21.0108, lng: -40.8339 },
    { name: 'Venda Nova do Imigrante', lat: -20.3333, lng: -41.1333 },
    { name: 'Afonso Cláudio', lat: -20.0778, lng: -41.1258 },
    { name: 'Santa Maria de Jetibá', lat: -20.0258, lng: -40.7458 },
    { name: 'João Neiva', lat: -19.7578, lng: -40.3858 },
    { name: 'Conceição da Barra', lat: -18.5928, lng: -39.7333 },
    { name: 'Mimoso do Sul', lat: -21.0639, lng: -41.3667 },
    { name: 'Guaçuí', lat: -20.7742, lng: -41.6789 },
    { name: 'Iúna', lat: -20.3500, lng: -41.5333 },
    { name: 'Muniz Freire', lat: -20.4667, lng: -41.4167 },
    { name: 'Piúma', lat: -20.8333, lng: -40.7333 },
    { name: 'Presidente Kennedy', lat: -21.0939, lng: -41.0500 },
    { name: 'Rio Novo do Sul', lat: -20.8597, lng: -40.9333 },
    { name: 'Vargem Alta', lat: -20.6708, lng: -41.0097 },
    { name: 'Vila Pavão', lat: -18.6167, lng: -40.6167 },
    { name: 'Barra de São Francisco', lat: -18.7528, lng: -40.8908 },
    { name: 'Nova Venécia', lat: -18.7128, lng: -40.4008 },
    { name: 'Ecoporanga', lat: -18.3728, lng: -40.8308 }
  ];
  
  let closest = null;
  let minDistance = Infinity;
  
  for (const mun of municipalities) {
    const distance = Math.sqrt(
      Math.pow(lat - mun.lat, 2) + Math.pow(lng - mun.lng, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closest = mun.name;
    }
  }
  
  return minDistance < 0.5 ? closest : null;
}

// Detectar tipo
function detectType(entity) {
  const text = `${entity.name}`.toLowerCase();
  
  if (text.includes('ponto de cultura') || text.includes('pontão')) return 'ponto_cultura';
  if (text.includes('cineclube') || text.includes('cine ')) return 'cineclube';
  if (text.includes('rádio') || text.includes('radio')) return 'radio_comunitaria';
  if (text.includes('coletivo') || text.includes('artista')) return 'artista_coletivo';
  
  return 'associacao_cultural';
}

// Detectar categoria
function detectCategory(entity, type) {
  const text = `${entity.name}`.toLowerCase();
  
  const keywords = {
    'teatro': 'Teatro',
    'dança': 'Dança', 'danca': 'Dança',
    'música': 'Música', 'musica': 'Música',
    'capoeira': 'Capoeira',
    'cinema': 'Cinema', 'cineclube': 'Cinema',
    'congo': 'Folclore', 'jongo': 'Folclore', 'folia': 'Folclore', 'caxambu': 'Folclore',
    'banda': 'Música', 'coral': 'Música',
    'arte': 'Artes Visuais', 'pintura': 'Artes Visuais',
    'artesanato': 'Artesanato',
    'literatura': 'Literatura', 'biblioteca': 'Literatura'
  };
  
  for (const [keyword, category] of Object.entries(keywords)) {
    if (text.includes(keyword)) return category;
  }
  
  const defaults = {
    'ponto_cultura': 'Cultura Popular',
    'cineclube': 'Cinema',
    'radio_comunitaria': 'Comunicação',
    'artista_coletivo': 'Artes Visuais',
    'associacao_cultural': 'Cultura Popular'
  };
  
  return defaults[type] || 'Cultura Popular';
}

// Importar
async function importFromJSON() {
  console.log('🚀 Importando dados do arquivo JSON...\n');
  
  try {
    // Ler arquivo JSON
    const jsonData = readFileSync('./mapa-cultural-data.json', 'utf8');
    const entities = JSON.parse(jsonData);
    
    console.log(`✅ ${entities.length} entidades encontradas no arquivo\n`);
    
    let imported = 0;
    let duplicates = 0;
    let errors = 0;
    let noMunicipality = 0;
    
    for (const entity of entities) {
      try {
        const name = entity.name?.trim();
        const lat = parseFloat(entity.location?.lat || entity.location?.latitude);
        const lng = parseFloat(entity.location?.lng || entity.location?.longitude);
        
        if (!name) {
          console.log(`⏭️  Pulando: sem nome`);
          errors++;
          continue;
        }
        
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
          console.log(`⏭️  Pulando: ${name} (sem coordenadas)`);
          errors++;
          continue;
        }
        
        const municipality = getMunicipalityFromCoords(lat, lng);
        
        if (!municipality) {
          console.log(`⚠️  Município não identificado: ${name} (lat: ${lat}, lng: ${lng})`);
          noMunicipality++;
          continue;
        }
        
        // Verificar se município existe no banco
        const municipalityExists = await prisma.municipality.findFirst({
          where: { name: municipality }
        });
        
        if (!municipalityExists) {
          console.log(`⚠️  Município não cadastrado: ${municipality} (${name})`);
          errors++;
          continue;
        }
        
        const type = detectType(entity);
        const category = detectCategory(entity, type);
        
        // Verificar duplicata
        const existing = await prisma.entity.findFirst({
          where: {
            name: name,
            municipality: municipality,
            type: type
          }
        });
        
        if (existing) {
          console.log(`⏭️  Duplicado: ${name} (${municipality})`);
          duplicates++;
          continue;
        }
        
        // Importar
        await prisma.entity.create({
          data: {
            name: name,
            type: type,
            category: category,
            municipality: municipality,
            region: municipalityExists.region,
            lat: lat,
            lng: lng,
            phone: entity.telefonePublico || null,
            email: entity.emailPublico || null,
            website: entity.site || null,
            description: entity.shortDescription || entity.longDescription || null,
            status: 'pending'
          }
        });
        
        console.log(`✅ ${name} → ${municipality} (${type} / ${category})`);
        imported++;
        
      } catch (error) {
        console.error(`❌ Erro: ${entity.name}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 RESUMO:');
    console.log(`✅ Importadas: ${imported}`);
    console.log(`⏭️  Duplicadas: ${duplicates}`);
    console.log(`⚠️  Município não identificado: ${noMunicipality}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📝 Total processadas: ${entities.length}\n`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

importFromJSON();
