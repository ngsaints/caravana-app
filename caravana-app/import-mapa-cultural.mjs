import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeamento de tipos do Mapa Cultural para nosso sistema
const TYPE_MAPPING = {
  'Ponto de Cultura': 'ponto_cultura',
  'Pontão de Cultura': 'ponto_cultura',
  'Cineclube': 'cineclube',
  'Rádio Comunitária': 'radio_comunitaria',
  'default': 'associacao_cultural'
};

// Mapeamento de categorias baseado em palavras-chave
const CATEGORY_MAPPING = {
  'teatro': 'Teatro',
  'dança': 'Dança',
  'danca': 'Dança',
  'música': 'Música',
  'musica': 'Música',
  'capoeira': 'Capoeira',
  'cinema': 'Cinema',
  'cineclube': 'Cinema',
  'congo': 'Folclore',
  'jongo': 'Folclore',
  'folia': 'Folclore',
  'caxambu': 'Folclore',
  'banda': 'Música',
  'coral': 'Música',
  'arte': 'Artes Visuais',
  'pintura': 'Artes Visuais',
  'artesanato': 'Artesanato',
  'literatura': 'Literatura',
  'biblioteca': 'Literatura',
  'default': 'Cultura Popular'
};

// Mapear coordenadas para municípios (aproximação por proximidade)
function getMunicipalityFromCoords(lat, lng) {
  // Coordenadas centrais dos principais municípios do ES
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
  
  // Encontrar município mais próximo
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
  
  // Se a distância for muito grande (>0.5 graus ~55km), retornar null
  return minDistance < 0.5 ? closest : null;
}

// Normalizar nome do município
function normalizeMunicipality(name) {
  if (!name) return null;
  
  const normalized = name.trim();
  
  // Mapeamento de variações conhecidas
  const municipalityMap = {
    'Vitoria': 'Vitória',
    'Vila Velha': 'Vila Velha',
    'Serra': 'Serra',
    'Cariacica': 'Cariacica',
    'Cachoeiro de Itapemirim': 'Cachoeiro de Itapemirim',
    'Linhares': 'Linhares',
    'São Mateus': 'São Mateus',
    'Sao Mateus': 'São Mateus',
    'Colatina': 'Colatina',
    'Guarapari': 'Guarapari',
    'Aracruz': 'Aracruz',
    'Viana': 'Viana',
    'Nova Venécia': 'Nova Venécia',
    'Nova Venecia': 'Nova Venécia',
    'Barra de São Francisco': 'Barra de São Francisco',
    'Barra de Sao Francisco': 'Barra de São Francisco',
    'São Gabriel da Palha': 'São Gabriel da Palha',
    'Sao Gabriel da Palha': 'São Gabriel da Palha',
    'Castelo': 'Castelo',
    'Itapemirim': 'Itapemirim',
    'Alegre': 'Alegre',
    'Afonso Cláudio': 'Afonso Cláudio',
    'Afonso Claudio': 'Afonso Cláudio',
    'Conceição da Barra': 'Conceição da Barra',
    'Conceicao da Barra': 'Conceição da Barra',
    'Domingos Martins': 'Domingos Martins',
    'Ecoporanga': 'Ecoporanga',
    'Fundão': 'Fundão',
    'Fundao': 'Fundão',
    'Guaçuí': 'Guaçuí',
    'Guacui': 'Guaçuí',
    'Ibiraçu': 'Ibiraçu',
    'Ibiracu': 'Ibiraçu',
    'Iúna': 'Iúna',
    'Iuna': 'Iúna',
    'Jaguaré': 'Jaguaré',
    'Jaguare': 'Jaguaré',
    'Mimoso do Sul': 'Mimoso do Sul',
    'Montanha': 'Montanha',
    'Muniz Freire': 'Muniz Freire',
    'Piúma': 'Piúma',
    'Piuma': 'Piúma',
    'Presidente Kennedy': 'Presidente Kennedy',
    'Rio Novo do Sul': 'Rio Novo do Sul',
    'Santa Maria de Jetibá': 'Santa Maria de Jetibá',
    'Santa Maria de Jetiba': 'Santa Maria de Jetibá',
    'São José do Calçado': 'São José do Calçado',
    'Sao Jose do Calcado': 'São José do Calçado',
    'Vargem Alta': 'Vargem Alta',
    'Venda Nova do Imigrante': 'Venda Nova do Imigrante',
    'Vila Pavão': 'Vila Pavão',
    'Vila Pavao': 'Vila Pavão',
    'João Neiva': 'João Neiva',
    'Joao Neiva': 'João Neiva'
  };
  
  return municipalityMap[normalized] || normalized;
}

// Detectar tipo baseado no nome e descrição
function detectType(entity) {
  const text = `${entity.name} ${entity.shortDescription || ''}`.toLowerCase();
  
  if (text.includes('ponto de cultura') || text.includes('pontão')) {
    return 'ponto_cultura';
  }
  if (text.includes('cineclube') || text.includes('cine ')) {
    return 'cineclube';
  }
  if (text.includes('rádio') || text.includes('radio')) {
    return 'radio_comunitaria';
  }
  if (text.includes('coletivo') || text.includes('artista')) {
    return 'artista_coletivo';
  }
  
  return 'associacao_cultural';
}

// Detectar categoria baseado no nome e descrição
function detectCategory(entity, type) {
  const text = `${entity.name} ${entity.shortDescription || ''}`.toLowerCase();
  
  // Buscar palavras-chave
  for (const [keyword, category] of Object.entries(CATEGORY_MAPPING)) {
    if (text.includes(keyword)) {
      return category;
    }
  }
  
  // Categoria padrão por tipo
  const defaultCategories = {
    'ponto_cultura': 'Cultura Popular',
    'cineclube': 'Cinema',
    'radio_comunitaria': 'Comunicação',
    'artista_coletivo': 'Artes Visuais',
    'associacao_cultural': 'Cultura Popular'
  };
  
  return defaultCategories[type] || 'Cultura Popular';
}

// Importar entidades do Mapa Cultural
async function importFromMapaCultural() {
  console.log('🚀 Iniciando importação do Mapa Cultural...\n');
  
  try {
    // Buscar dados da API do Mapa Cultural (Espírito Santo)
    // Busca TODOS os agentes do ES (não só Pontos de Cultura)
    const url = 'https://culturaviva.cultura.gov.br/api/agent/find/?@select=id,name,shortDescription,longDescription,location,emailPublico,telefonePublico,site&En_Estado=EQ(ES)&@limit=500';
    
    console.log('📡 Buscando dados da API do Mapa Cultural...');
    const response = await fetch(url);
    const data = await response.json();
    
    // A API retorna um array ou objeto com metadata
    const entities = Array.isArray(data) ? data : (data.entities || []);
    
    console.log(`✅ ${entities.length} entidades encontradas\n`);
    
    let imported = 0;
    let duplicates = 0;
    let errors = 0;
    
    for (const entity of entities) {
      try {
        // Extrair dados
        const name = entity.name?.trim();
        const lat = parseFloat(entity.location?.lat || entity.location?.latitude) || null;
        const lng = parseFloat(entity.location?.lng || entity.location?.longitude) || null;
        
        // Tentar extrair município das coordenadas (aproximação)
        let municipality = null;
        
        if (lat && lng) {
          // Mapear coordenadas para municípios aproximados
          municipality = getMunicipalityFromCoords(lat, lng);
        }
        
        if (!name || !municipality) {
          console.log(`⏭️  Pulando: ${name || 'sem nome'} (dados incompletos)`);
          errors++;
          continue;
        }
        
        // Verificar se o município existe no nosso banco
        const municipalityExists = await prisma.municipality.findFirst({
          where: { name: municipality }
        });
        
        if (!municipalityExists) {
          console.log(`⚠️  Município não encontrado: ${municipality} (${name})`);
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
            address: entity.location?.En_Nome_Logradouro || null,
            phone: entity.telefonePublico || null,
            email: entity.emailPublico || null,
            website: entity.site || null,
            description: entity.shortDescription || entity.longDescription || null,
            status: 'pending' // Todas entidades importadas ficam pendentes
          }
        });
        
        console.log(`✅ Importado: ${name} (${municipality}) - ${type} / ${category}`);
        imported++;
        
      } catch (error) {
        console.error(`❌ Erro ao importar ${entity.name}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 RESUMO DA IMPORTAÇÃO:');
    console.log(`✅ Importadas: ${imported}`);
    console.log(`⏭️  Duplicadas: ${duplicates}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📝 Total processadas: ${entities.length}`);
    
  } catch (error) {
    console.error('❌ Erro na importação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
importFromMapaCultural();
