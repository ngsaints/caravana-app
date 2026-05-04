// Script para VISUALIZAR os dados do Mapa Cultural ANTES de importar

// Mapear coordenadas para municípios (aproximação por proximidade)
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

// Detectar tipo baseado no nome
function detectType(entity) {
  const text = `${entity.name}`.toLowerCase();
  
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
    if (text.includes(keyword)) {
      return category;
    }
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

// Preview dos dados
async function previewMapaCultural() {
  console.log('🔍 PREVIEW - Dados do Mapa Cultural\n');
  console.log('=' .repeat(80));
  
  try {
    // API do Mapa Cultural - buscar agentes do Espírito Santo
    const url = 'https://culturaviva.cultura.gov.br/api/agent/find';
    const params = new URLSearchParams({
      '@select': 'id,name,shortDescription,longDescription,location,emailPublico,telefonePublico,site',
      'En_Estado': 'EQ(ES)',
      '@limit': '500'
    });
    
    console.log('📡 Buscando dados da API...\n');
    const response = await fetch(`${url}?${params.toString()}`);
    const text = await response.text();
    
    // Debug: mostrar início da resposta
    console.log('📄 Resposta da API (primeiros 200 chars):');
    console.log(text.substring(0, 200));
    console.log('\n');
    
    const data = JSON.parse(text);
    const entities = Array.isArray(data) ? data : (data.entities || []);
    
    console.log(`✅ ${entities.length} entidades encontradas\n`);
    console.log('=' .repeat(80));
    
    let valid = 0;
    let invalid = 0;
    let noCoords = 0;
    let noMunicipality = 0;
    
    const preview = [];
    
    for (const entity of entities.slice(0, 10)) { // Mostrar apenas 10 primeiros
      const name = entity.name?.trim();
      const lat = parseFloat(entity.location?.lat || entity.location?.latitude);
      const lng = parseFloat(entity.location?.lng || entity.location?.longitude);
      
      let municipality = null;
      let status = '✅';
      let issues = [];
      
      if (!name) {
        status = '❌';
        issues.push('SEM NOME');
        invalid++;
      }
      
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        status = '⚠️';
        issues.push('SEM COORDENADAS');
        noCoords++;
      } else {
        municipality = getMunicipalityFromCoords(lat, lng);
        if (!municipality) {
          status = '⚠️';
          issues.push('MUNICÍPIO NÃO IDENTIFICADO');
          noMunicipality++;
        } else {
          valid++;
        }
      }
      
      const type = detectType(entity);
      const category = detectCategory(entity, type);
      
      preview.push({
        status,
        name: name || 'SEM NOME',
        lat: lat || 'N/A',
        lng: lng || 'N/A',
        municipality: municipality || 'N/A',
        type,
        category,
        issues: issues.join(', ') || 'OK'
      });
    }
    
    // Mostrar preview
    console.log('\n📋 PREVIEW DOS PRIMEIROS 10 REGISTROS:\n');
    preview.forEach((item, i) => {
      console.log(`${i + 1}. ${item.status} ${item.name}`);
      console.log(`   📍 Lat: ${item.lat}, Lng: ${item.lng}`);
      console.log(`   🏙️  Município: ${item.municipality}`);
      console.log(`   🏷️  Tipo: ${item.type} | Categoria: ${item.category}`);
      console.log(`   ℹ️  Status: ${item.issues}`);
      console.log('');
    });
    
    console.log('=' .repeat(80));
    console.log('\n📊 ESTATÍSTICAS GERAIS:\n');
    console.log(`Total de entidades: ${entities.length}`);
    console.log(`✅ Válidas (com coordenadas e município): ${valid}`);
    console.log(`⚠️  Sem coordenadas: ${noCoords}`);
    console.log(`⚠️  Município não identificado: ${noMunicipality}`);
    console.log(`❌ Inválidas (sem nome): ${invalid}`);
    
    // Análise completa de municípios
    console.log('\n🏙️  DISTRIBUIÇÃO POR MUNICÍPIO (amostra de 50):\n');
    const municipalityCounts = {};
    
    for (const entity of entities.slice(0, 50)) {
      const lat = parseFloat(entity.location?.lat || entity.location?.latitude);
      const lng = parseFloat(entity.location?.lng || entity.location?.longitude);
      
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        const mun = getMunicipalityFromCoords(lat, lng);
        if (mun) {
          municipalityCounts[mun] = (municipalityCounts[mun] || 0) + 1;
        }
      }
    }
    
    Object.entries(municipalityCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([mun, count]) => {
        console.log(`   ${mun}: ${count} entidades`);
      });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Preview concluído! Revise os dados acima.');
    console.log('📝 Se estiver tudo OK, rode: node import-mapa-cultural.mjs\n');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Executar
previewMapaCultural();
