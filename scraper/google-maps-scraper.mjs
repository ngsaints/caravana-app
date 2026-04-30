import { ApifyClient } from 'apify-client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, 'config.json');
const municipalitiesPath = path.join(__dirname, 'municipalities.json');

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error('Configure seu APIFY_TOKEN no painel admin primeiro!');
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!config.APIFY_TOKEN || config.APIFY_TOKEN === 'YOUR_API_TOKEN_HERE') {
    throw new Error('Configure seu APIFY_TOKEN no painel admin primeiro!');
  }
  return config;
}

function loadMunicipalities() {
  return JSON.parse(fs.readFileSync(municipalitiesPath, 'utf8'));
}

const REGION_MAPPING = {
  'Vitória': 'Região Imediata de Vitória',
  'Vila Velha': 'Região Imediata de Vitória',
  'Serra': 'Região Imediata de Vitória',
  'Cariacica': 'Região Imediata de Vitória',
  'Guarapari': 'Região Imediata de Vitória',
  'Viana': 'Região Imediata de Vitória',
  'Anchieta': 'Região Imediata de Vitória',
  'Fundão': 'Região Imediata de Vitória',
  'Alfredo Chaves': 'Região Imediata de Vitória',
  'Piúma': 'Região Imediata de Vitória',
  'São Mateus': 'Região Imediata de São Mateus',
  'Conceição da Barra': 'Região Imediata de São Mateus',
  'Jaguaré': 'Região Imediata de São Mateus',
  'Boa Esperança': 'Região Imediata de São Mateus',
  'Montanha': 'Região Imediata de São Mateus',
  'Mucurici': 'Região Imediata de São Mateus',
  'Pedro Canário': 'Região Imediata de São Mateus',
  'Pinheiros': 'Região Imediata de São Mateus',
  'Ponto Belo': 'Região Imediata de São Mateus',
  'Colatina': 'Região Imediata de Colatina',
  'Baixo Guandu': 'Região Imediata de Colatina',
  'São Gabriel da Palha': 'Região Imediata de Colatina',
  'Marilândia': 'Região Imediata de Colatina',
  'Governador Lindenberg': 'Região Imediata de Colatina',
  'Águia Branca': 'Região Imediata de Colatina',
  'Alto Rio Novo': 'Região Imediata de Colatina',
  'Mantenópolis': 'Região Imediata de Colatina',
  'Pancas': 'Região Imediata de Colatina',
  'São Domingos do Norte': 'Região Imediata de Colatina',
  'São Roque do Canaã': 'Região Imediata de Colatina',
  'Vila Valério': 'Região Imediata de Colatina',
  'Itaguaçu': 'Região Imediata de Colatina'
};

function getTypeFromQuery(query) {
  const lower = query.toLowerCase();
  if (lower.includes('rádio') || lower.includes('radio')) return 'radio_comunitaria';
  if (lower.includes('ponto de cultura')) return 'ponto_cultura';
  if (lower.includes('cineclube') || lower.includes('cinema')) return 'cineclube';
  if (lower.includes('artista') || lower.includes('coletivo')) return 'artista_coletivo';
  if (lower.includes('centro cultural')) return 'associacao_cultural';
  if (lower.includes('associação') || lower.includes('associacao')) return 'associacao_cultural';
  return 'associacao_cultural';
}

function getCategory(query, name) {
  const lower = query.toLowerCase();
  const nameLower = (name || '').toLowerCase();

  if (lower.includes('rádio') || lower.includes('radio')) return 'Comunicação';
  if (lower.includes('cineclube') || lower.includes('cinema')) return 'Cinema';
  if (lower.includes('arte') || nameLower.includes('arte')) return 'Artes Visuais';
  if (lower.includes('dança') || lower.includes('danca')) return 'Dança';
  if (lower.includes('música') || lower.includes('musica')) return 'Música';
  if (lower.includes('teatro')) return 'Teatro';
  if (lower.includes('capoeira')) return 'Capoeira';
  if (lower.includes('hip hop') || lower.includes('hiphop')) return 'Hip Hop';
  if (lower.includes('quilombola') || lower.includes('quilombo')) return 'Patrimônio Cultural';
  if (lower.includes('literatura') || lower.includes('livro')) return 'Literatura';
  if (lower.includes('artesanato')) return 'Artesanato';
  if (lower.includes('patrimônio') || lower.includes('patrimonio')) return 'Patrimônio Cultural';
  if (lower.includes('food') || lower.includes('restaurante') || nameLower.includes('restaurante')) return 'Gastronomia';
  if (lower.includes('museu')) return 'Museu';
  if (lower.includes('galeria')) return 'Galeria';
  return 'Cultura';
}

function isBrazilianEntity(item) {
  const country = (item.countryCode || '').toUpperCase();
  const state = (item.state || '').toUpperCase();
  const city = (item.city || '').toUpperCase();
  const address = (item.address || '').toUpperCase();

  if (country !== 'BR') return false;

  const esIndicators = [
    'ESPÍRITO SANTO', 'ESPIRITO SANTO',
    'VITÓRIA', 'VILA VELHA', 'SERRA', 'CARIACICA', 'GUARAPARI',
    'VIANA', 'ANCHIETA', 'FUNDÃO', 'ALFREDO CHAVES', 'PIÚMA',
    'SÃO MATEUS', 'CONCEIÇÃO DA BARRA', 'JAGUARÉ', 'BOA ESPERANÇA',
    'MONTANHA', 'MUCURICI', 'PEDRO CANÁRIO', 'PINHEIROS', 'PONTO BELO',
    'COLATINA', 'BAIXO GUANDU', 'SÃO GABRIEL DA PALHA', 'MARILÂNDIA',
    'GOVERNADOR LINDENBERG', 'ÁGUIA BRANCA', 'ALTO RIO NOVO', 'MANTENÓPOLIS',
    'PANCAS', 'SÃO DOMINGOS DO NORTE', 'SÃO ROQUE DO CANAÃ', 'VILA VALÉRIO',
    'ITAGUAÇU'
  ];

  if (state === 'ES' || state === 'ESPÍRITO SANTO') return true;

  const fullText = `${address} ${city} ${state}`.toUpperCase();
  for (const indicator of esIndicators) {
    if (fullText.includes(indicator)) return true;
  }

  return false;
}

function formatOpeningHours(hours) {
  if (!hours) return '';
  if (typeof hours === 'string') return hours;
  if (Array.isArray(hours)) {
    return hours.map(h => `${h.day}: ${h.hours}`).join('; ');
  }
  return String(hours);
}

function isCulturalEntity(name, category, description) {
  if (!name) return false;
  const text = `${name} ${category} ${description}`.toLowerCase();

  const culturalKeywords = [
    'associação', 'association', 'cultural', 'cultura', 'rádio', 'radio',
    'comunitária', 'community', 'ponto de cultura', 'cineclube', 'film club',
    'centro cultural', 'theater', 'teatro', 'museu', 'museum', 'galeria',
    'gallery', 'arte', 'art', 'música', 'music', 'dança', 'dance',
    'capoeira', 'hip hop', 'coletivo', 'collective', 'artist', 'artista',
    'quilombo', 'patrimônio', 'heritage', 'patrimonial', 'banda', 'orquestra',
    'grupo', 'group', 'escola', 'school', 'sindicato', 'federacao', 'federação',
    'instituto', 'instituto', 'fundacao', 'fundação', 'ongs', 'ong', 'entidade'
  ];

  for (const keyword of culturalKeywords) {
    if (text.includes(keyword)) return true;
  }

  const excludeKeywords = ['restaurante', 'restaurant', 'lanchonete', 'pizzaria', 'bar', 'pub',
    'hotel', 'hostel', 'pousada', 'mercado', 'supermercado', 'farmacia', 'loja',
    'shop', 'store', 'boutique', 'jewelry', 'joalheria', 'banco', 'bank'];
  for (const exclude of excludeKeywords) {
    if (text.includes(exclude)) return false;
  }

  return text.length > 5;
}

function escapeCSV(str) {
  if (!str) return '';
  const escaped = String(str).replace(/"/g, '""');
  return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"') ? `"${escaped}"` : escaped;
}

async function runScraperForQuery(client, query, municipality) {
  const input = {
    searchStringsArray: [`${query} ${municipality} Espírito Santo`],
    locationQuery: `${municipality}, Espírito Santo, Brazil`,
    maxCrawledPlacesPerSearch: 30,
    language: 'pt-BR',
    countryCode: 'BR',
    skipClosedPlaces: false,
    scrapePlaceDetailPage: true,
    scrapeReviewsPersonalData: false,
    maxReviews: 5,
    maxImages: 3,
    includeWebResults: false
  };

  try {
    const run = await client.actor('nwua9Gu5YrADL7KDj').call(input);
    
    if (run.status === 'SUCCEEDED') {
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      return items;
    }
  } catch (e) {
    console.error(`   ❌ Erro: ${e.message}`);
  }
  return [];
}

function extractEntityData(item, query, municipality) {
  const type = getTypeFromQuery(query);
  const category = getCategory(query, item.name);
  const region = REGION_MAPPING[municipality] || municipality;

  let lat = 0, lng = 0;
  if (item.location?.lat) lat = parseFloat(item.location.lat);
  if (item.location?.lng) lng = parseFloat(item.location.lng);
  if (!lat && item.latitude) lat = parseFloat(item.latitude);
  if (!lng && item.longitude) lng = parseFloat(item.longitude);

  if (!lat || !lng) {
    const mun = loadMunicipalities().regions
      .flatMap(r => r.municipalities)
      .find(m => m.name === municipality);
    if (mun) {
      lat = mun.lat;
      lng = mun.lng;
    }
  }

  const addressParts = [];
  if (item.street) addressParts.push(item.street);
  if (item.address && !addressParts.includes(item.address)) addressParts.push(item.address);
  if (item.fullAddress && !addressParts.includes(item.fullAddress)) addressParts.push(item.fullAddress);
  if (item.streetAddress && !addressParts.includes(item.streetAddress)) addressParts.push(item.streetAddress);
  const address = addressParts.slice(0, 2).join(', ');

  const phone = item.phone || item.phoneUnformatted || item.whatsApp || '';

  const website = item.website || item.orderUrl || '';

  const description = item.description || item.about || item.intro || '';

  const servicesText = item.additionalInfo
    ? Object.entries(item.additionalInfo)
        .map(([key, values]) => {
          if (Array.isArray(values)) {
            const enabled = values.filter(v => {
              const val = Object.values(v)[0];
              return val === true;
            }).map(v => Object.keys(v)[0]).join(', ');
            return enabled ? `${key}: ${enabled}` : '';
          }
          return '';
        }).filter(Boolean).join('; ')
    : '';

  return {
    name: item.title || item.name || '',
    type,
    category,
    municipality,
    region,
    address,
    lat,
    lng,
    phone,
    email: item.emails?.[0] || '',
    website,
    description: description.substring(0, 300),
    services: servicesText.substring(0, 200),
    opening_hours: formatOpeningHours(item.openingHours),
    closed: item.permanentlyClosed || item.temporarilyClosed || false,
    rating: item.totalScore || '',
    reviewsCount: item.reviewsCount || '',
    imagesCount: item.imagesCount || '',
    source: 'Google Maps (Apify)',
    scraped_at: item.scrapedAt || new Date().toISOString()
  };
}

function saveToCSV(records, filename) {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, filename);
  const header = 'Nome,Tipo,Categoria,Município,Região,Endereço,Latitude,Longitude,Telefone,Website,Email,Descrição,Serviços,Horário,Aberto/Fechado,Avaliação,Reviews,Imagens,Fonte,Data\n';

  const rows = records.map(r => [
    escapeCSV(r.name),
    escapeCSV(r.type),
    escapeCSV(r.category),
    escapeCSV(r.municipality),
    escapeCSV(r.region),
    escapeCSV(r.address),
    r.lat || '',
    r.lng || '',
    escapeCSV(r.phone),
    escapeCSV(r.website),
    escapeCSV(r.email),
    escapeCSV(r.description),
    escapeCSV(r.services),
    escapeCSV(r.opening_hours),
    r.closed ? 'Fechado' : 'Aberto',
    r.rating || '',
    r.reviewsCount || '',
    r.imagesCount || '',
    escapeCSV(r.source),
    r.scraped_at
  ].join(',')).join('\n');

  fs.writeFileSync(outputFile, header + rows);
  return outputFile;
}

export async function runScraper() {
  const config = loadConfig();
  const data = loadMunicipalities();
  const client = new ApifyClient({ token: config.APIFY_TOKEN });

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Caravana da Cultura - Scraper de Organizações Culturais  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const allRecords = [];
  const searchQueries = data.searchQueries;
  const municipalities = data.regions.flatMap(r => r.municipalities);

  console.log(`📍 Total de municípios: ${municipalities.length}`);
  console.log(`🔍 Total de buscas: ${municipalities.length * searchQueries.length}\n`);

  let searchIndex = 0;
  for (const region of data.regions) {
    for (const mun of region.municipalities) {
      for (const query of searchQueries) {
        searchIndex++;
        console.log(`[${searchIndex}/${municipalities.length * searchQueries.length}] ${query} em ${mun.name}...`);

        const items = await runScraperForQuery(client, query, mun.name);

        for (const item of items) {
          if (!isBrazilianEntity(item)) {
            console.log(`   ⛔ Ignorado (não é Brasil): ${item.title || item.name || 'Sem nome'}`);
            continue;
          }

          if (!isCulturalEntity(item.title || item.name, item.categoryName, item.description)) {
            console.log(`   ⛔ Ignorado (não é cultural): ${item.title || item.name || 'Sem nome'}`);
            continue;
          }

          const entity = extractEntityData(item, query, mun.name);
          if (entity.name && entity.name.length > 2) {
            allRecords.push(entity);
            console.log(`   ✅ Adicionado: ${entity.name}`);
          }
        }

        console.log(`   📍 ${items.length} encontrados (${allRecords.slice(-10).length} novos)`);

        if (searchIndex < municipalities.length * searchQueries.length) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 RESULTADO FINAL`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   Total de registros: ${allRecords.length}`);
  console.log(`   Removendo duplicatas...`);

  const unique = [];
  const seen = new Set();
  for (const r of allRecords) {
    const key = (r.name + r.municipality + r.type).toLowerCase().replace(/\s+/g, ' ').trim();
    if (!seen.has(key) && r.name && r.name.length > 2) {
      seen.add(key);
      unique.push(r);
    }
  }

  console.log(`   Registros únicos: ${unique.length}\n`);

  if (unique.length > 0) {
    const filename = `cultural_entities_${Date.now()}.csv`;
    const filepath = saveToCSV(unique, filename);

    console.log('   📁 Arquivos gerados:');
    console.log(`      • ${filepath}`);
    console.log(`\n✅ Scraping concluído!`);

    return filepath;
  }

  console.log('⚠️ Nenhum registro encontrado');
  return null;
}

export function getStatus() {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return {
      configured: !!(config.APIFY_TOKEN && config.APIFY_TOKEN !== 'YOUR_API_TOKEN_HERE'),
      lastUpdated: config.lastUpdated || null
    };
  } catch {
    return { configured: false, lastUpdated: null };
  }
}

export function saveToken(token) {
  const config = { 
    APIFY_TOKEN: token, 
    lastUpdated: new Date().toISOString() 
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return config;
}