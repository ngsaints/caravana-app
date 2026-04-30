import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, 'config.json');
const municipalitiesPath = path.join(__dirname, 'municipalities.json');

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    throw new Error('Configure seu GEMINI_API_KEY no painel admin primeiro!');
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!config.GEMINI_API_KEY || config.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
    throw new Error('Configure seu GEMINI_API_KEY no painel admin primeiro!');
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

const ES_MUNICIPALITIES_COORDS = {
  'Vitória': { lat: -20.3155, lng: -40.3128 },
  'Vila Velha': { lat: -20.3297, lng: -40.2925 },
  'Serra': { lat: -20.1287, lng: -40.3075 },
  'Cariacica': { lat: -20.2619, lng: -40.4177 },
  'Guarapari': { lat: -20.6686, lng: -40.4988 },
  'Viana': { lat: -20.3909, lng: -40.5619 },
  'Anchieta': { lat: -20.8056, lng: -40.6414 },
  'Fundão': { lat: -19.9361, lng: -40.4067 },
  'Alfredo Chaves': { lat: -20.6369, lng: -40.7536 },
  'Piúma': { lat: -20.8458, lng: -40.7278 },
  'São Mateus': { lat: -18.7157, lng: -39.8578 },
  'Conceição da Barra': { lat: -18.4974, lng: -39.7394 },
  'Jaguaré': { lat: -18.9642, lng: -40.1617 },
  'Boa Esperança': { lat: -18.5528, lng: -40.5972 },
  'Montanha': { lat: -18.1319, lng: -40.5378 },
  'Mucurici': { lat: -18.1461, lng: -40.2286 },
  'Pedro Canário': { lat: -18.0378, lng: -40.6581 },
  'Pinheiros': { lat: -18.4173, lng: -40.2155 },
  'Ponto Belo': { lat: -18.4269, lng: -40.4761 },
  'Colatina': { lat: -19.5396, lng: -40.6306 },
  'Baixo Guandu': { lat: -19.0611, lng: -41.0139 },
  'São Gabriel da Palha': { lat: -18.7178, lng: -40.5375 },
  'Marilândia': { lat: -19.4092, lng: -40.4814 },
  'Governador Lindenberg': { lat: -19.1867, lng: -40.7394 },
  'Águia Branca': { lat: -18.9822, lng: -40.9444 },
  'Alto Rio Novo': { lat: -19.0592, lng: -40.8189 },
  'Mantenópolis': { lat: -18.8622, lng: -41.1303 },
  'Pancas': { lat: -18.4386, lng: -40.9611 },
  'São Domingos do Norte': { lat: -19.1778, lng: -40.5956 },
  'São Roque do Canaã': { lat: -19.3033, lng: -40.6406 },
  'Vila Valério': { lat: -18.9464, lng: -40.7908 },
  'Itaguaçu': { lat: -19.5508, lng: -40.8572 }
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
    'instituto', 'fundacao', 'fundação', 'ongs', 'ong', 'entidade'
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

function isEspiritoSanto(text) {
  if (!text) return false;
  const upper = text.toUpperCase();

  const esIndicators = [
    'ESPÍRITO SANTO', 'ESPIRITO SANTO', 'ESPÍRITO', 'ESPIRITO',
    'VITÓRIA', 'VILA VELHA', 'SERRA', 'CARIACICA', 'GUARAPARI',
    'VIANA', 'ANCHIETA', 'FUNDÃO', 'ALFREDO CHAVES', 'PIÚMA',
    'SÃO MATEUS', 'CONCEIÇÃO DA BARRA', 'JAGUARÉ', 'BOA ESPERANÇA',
    'MONTANHA', 'MUCURICI', 'PEDRO CANÁRIO', 'PINHEIROS', 'PONTO BELO',
    'COLATINA', 'BAIXO GUANDU', 'SÃO GABRIEL DA PALHA', 'MARILÂNDIA',
    'GOVERNADOR LINDENBERG', 'ÁGUIA BRANCA', 'ALTO RIO NOVO', 'MANTENÓPOLIS',
    'PANCAS', 'SÃO DOMINGOS DO NORTE', 'SÃO ROQUE DO CANAÃ', 'VILA VALÉRIO',
    'ITAGUAÇU'
  ];

  for (const indicator of esIndicators) {
    if (upper.includes(indicator)) return true;
  }

  return false;
}

function escapeCSV(str) {
  if (!str) return '';
  const escaped = String(str).replace(/"/g, '""');
  return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"') ? `"${escaped}"` : escaped;
}

async function queryGeminiWithMaps(ai, query, municipality, coords) {
  const prompt = `Liste APENAS entidades culturais em ${municipality}, Espírito Santo, Brasil relacionadas a: "${query}".

Regras obrigatórias:
- A entidade DEVE estar no Espírito Santo, Brasil
- A entidade DEVE ser cultural (associação, centro cultural, rádio comunitária, ponto de cultura, cineclube, coletivo, galeria, museu, teatro, etc.)
- NÃO inclua restaurantes, bares, hotéis, farmácias, lojas, bancos ou qualquer comércio que não seja cultural
- NÃO inclua entidades fora do Espírito Santo

Para cada entidade, forneça EXATAMENTE este formato JSON:
[{"name": "Nome da Entidade", "address": "Endereço completo", "phone": "Telefone", "website": "Site", "rating": "4.5"}]

Responda APENAS com o JSON, sem texto adicional:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: coords.lat,
              longitude: coords.lng
            }
          }
        }
      }
    });

    const grounding = response.candidates?.[0]?.groundingMetadata;

    if (grounding?.groundingChunks) {
      console.log(`   📍 Fontes: ${grounding.groundingChunks.length}`);
      for (const chunk of grounding.groundingChunks) {
        if (chunk.maps?.title) {
          console.log(`      - ${chunk.maps.title}`);
        }
      }
    }

    const text = response.text || '';
    return parseGeminiResponse(text);
  } catch (e) {
    console.error(`   ❌ Erro Gemini: ${e.message}`);
    return [];
  }
}

function parseGeminiResponse(text) {
  let jsonMatch = text.match(/\[[\s\S]*?\]/);
  if (!jsonMatch) {
    const backtickMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (backtickMatch) jsonMatch = backtickMatch[1].match(/\[[\s\S]*?\]/);
  }

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          name: item.name || '',
          address: item.address || item.endereco || '',
          phone: item.phone || item.telefone || '',
          website: item.website || item.site || '',
          rating: item.rating || item.avaliacao || ''
        })).filter(item => item.name);
      }
    } catch (e) {
      console.log(`   ⚠️ Parse JSON falhou: ${e.message}`);
    }
  }

  return [];
}

function saveToCSV(records, filename) {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, filename);
  const header = 'Nome,Tipo,Categoria,Município,Região,Endereço,Latitude,Longitude,Telefone,Website,Avaliação,Fonte,Data\n';

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
    r.rating || '',
    'Gemini + Google Maps Grounding',
    r.scraped_at || new Date().toISOString()
  ].join(',')).join('\n');

  fs.writeFileSync(outputFile, header + rows);
  return outputFile;
}

export async function runGeminiScraper() {
  const config = loadConfig();
  const data = loadMunicipalities();
  const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Caravana da Cultura - Gemini Maps Grounding Scraper      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const allRecords = [];
  const queries = [
    'associação cultural',
    'centro cultural',
    'rádio comunitária',
    'ponto de cultura',
    'cineclube',
    'coletivo artístico',
    'galeria de arte',
    'museu',
    'teatro municipal',
    'espaço cultural'
  ];

  const municipalities = data.regions.flatMap(r => r.municipalities);

  console.log(`📍 Total de municípios: ${municipalities.length}`);
  console.log(`🔍 Queries por município: ${queries.length}\n`);

  let totalSearches = municipalities.length * queries.length;
  let searchIndex = 0;

  for (const mun of municipalities) {
    const coords = ES_MUNICIPALITIES_COORDS[mun.name] || { lat: -20, lng: -40 };
    const region = REGION_MAPPING[mun.name] || mun.name;

    const munData = data.regions
      .flatMap(r => r.municipalities)
      .find(m => m.name === mun.name);
    const fallbackCoords = munData ? { lat: munData.lat, lng: munData.lng } : coords;

    for (const query of queries) {
      searchIndex++;
      console.log(`[${searchIndex}/${totalSearches}] ${query} em ${mun.name}...`);

      await new Promise(r => setTimeout(r, 1500));

      const results = await queryGeminiWithMaps(ai, query, mun.name, fallbackCoords);

      if (results && results.length > 0) {
        console.log(`   ✅ ${results.length} resultados brutos`);

        for (const item of results) {
          const name = item.name?.trim() || '';
          const fullText = `${name} ${item.address || ''}`;

          if (!name || name.length < 3) {
            console.log(`   ⛔ Ignorado (nome inválido): ${name}`);
            continue;
          }

          if (!isEspiritoSanto(fullText)) {
            console.log(`   ⛔ Ignorado (não é ES): ${name}`);
            continue;
          }

          if (!isCulturalEntity(name, '', item.address || '')) {
            console.log(`   ⛔ Ignorado (não cultural): ${name}`);
            continue;
          }

          allRecords.push({
            name,
            type: getTypeFromQuery(query),
            category: getCategory(query, name),
            municipality: mun.name,
            region,
            address: item.address || '',
            lat: fallbackCoords.lat,
            lng: fallbackCoords.lng,
            phone: item.phone || '',
            website: item.website || '',
            rating: item.rating || '',
            scraped_at: new Date().toISOString()
          });
          console.log(`   ✅ Adicionado: ${name}`);
        }
      } else {
        console.log(`   ⚠️ Nenhum resultado válido`);
      }

      const progress = {
        current: searchIndex,
        total: totalSearches,
        lastMunicipality: mun.name,
        lastQuery: query,
        recordsFound: allRecords.length
      };
      fs.writeFileSync(
        path.join(__dirname, 'gemini_progress.json'),
        JSON.stringify(progress)
      );
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 RESULTADO FINAL`);
  console.log('═══════════════════════════════════════════════════════════════');

  const unique = [];
  const seen = new Set();
  for (const r of allRecords) {
    const key = (r.name + r.municipality + r.type).toLowerCase().replace(/\s+/g, ' ').trim();
    if (!seen.has(key) && r.name && r.name.length > 2) {
      seen.add(key);
      unique.push(r);
    }
  }

  console.log(`   Total coletado: ${allRecords.length}`);
  console.log(`   Únicos (dedup): ${unique.length}\n`);

  if (unique.length > 0) {
    const filename = `gemini_cultural_entities_${Date.now()}.csv`;
    const filepath = saveToCSV(unique, filename);

    fs.writeFileSync(
      path.join(__dirname, 'gemini_results.json'),
      JSON.stringify(unique, null, 2)
    );

    console.log('   📁 Arquivos gerados:');
    console.log(`      • ${filepath}`);
    console.log(`      • ${path.join(__dirname, 'gemini_results.json')}`);
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
      configured: !!(config.GEMINI_API_KEY && config.GEMINI_API_KEY !== 'YOUR_API_KEY_HERE'),
      lastUpdated: config.lastUpdated || null
    };
  } catch {
    return { configured: false, lastUpdated: null };
  }
}

export function saveApiKey(apiKey) {
  const config = {
    GEMINI_API_KEY: apiKey,
    lastUpdated: new Date().toISOString()
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return config;
}