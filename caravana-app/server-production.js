import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

const SCRAPER_DIR = path.join(__dirname, 'src/scraper');

// Helper para buscar tokens do banco de dados
async function getTokensFromDB() {
  const apifyConfig = await prisma.config.findUnique({ where: { key: 'APIFY_TOKEN' } });
  const geminiConfig = await prisma.config.findUnique({ where: { key: 'GEMINI_TOKENS' } });
  
  let geminiTokens = [];
  if (geminiConfig?.value) {
    try {
      geminiTokens = JSON.parse(geminiConfig.value);
    } catch {
      geminiTokens = [];
    }
  }
  
  return {
    APIFY_TOKEN: apifyConfig?.value || '',
    GEMINI_TOKENS: geminiTokens
  };
}

console.log('🚀 Iniciando servidor...');
console.log('📁 Diretório:', __dirname);
console.log('🔌 Porta:', PORT);

app.use(cors({
  origin: '*', // Permite todos os domínios (necessário para embed)
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Headers para permitir iframe em outros sites
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  next();
});

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware de autenticação
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  
  const token = authHeader.substring(7);
  
  // Verificar se o token é válido (senha hash)
  const validToken = Buffer.from('caravana2024').toString('base64');
  
  if (token !== validToken) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  next();
}

// Rota de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    // Buscar senha do banco de dados
    const passwordConfig = await prisma.config.findUnique({ 
      where: { key: 'ADMIN_PASSWORD' } 
    });
    
    const adminPassword = passwordConfig?.value || 'caravana2024';
    
    if (password === adminPassword) {
      // Gerar token
      const token = Buffer.from(password).toString('base64');
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: 'Senha incorreta' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// API Routes
app.get('/api/entities', async (req, res) => {
  try {
    const { search, category, municipality, region, type, status } = req.query;
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category) where.category = category;
    if (municipality) where.municipality = municipality;
    if (region) where.region = region;
    if (type) where.type = type;
    if (status) where.status = status;

    const entities = await prisma.entity.findMany({ where, orderBy: { name: 'asc' } });
    res.json(entities);
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({ error: 'Failed to fetch entities' });
  }
});

// Buscar entidade por ID (público) - DEVE VIR ANTES DAS ROTAS PROTEGIDAS
app.get('/api/entities/:id', async (req, res) => {
  try {
    const entity = await prisma.entity.findUnique({
      where: { id: req.params.id }
    });
    if (!entity) {
      return res.status(404).json({ error: 'Entity not found' });
    }
    res.json(entity);
  } catch (error) {
    console.error('Error fetching entity:', error);
    res.status(500).json({ error: 'Failed to fetch entity' });
  }
});

// Exportar CSV (público) - DEVE VIR ANTES DAS ROTAS PROTEGIDAS
app.get('/api/entities/export', async (req, res) => {
  try {
    const entities = await prisma.entity.findMany({ where: { status: 'active' } });

    const csvRows = [
      'Nome,Tipo,Categoria,Município,Região,Endereço,Latitude,Longitude,Telefone,Website,Email,Descrição,Serviços,Ano de Fundação,Status'
    ];

    for (const e of entities) {
      const row = [
        `"${(e.name || '').replace(/"/g, '""')}"`,
        e.type || '',
        e.category || '',
        e.municipality || '',
        e.region || '',
        `"${(e.address || '').replace(/"/g, '""')}"`,
        e.lat || '',
        e.lng || '',
        e.phone || '',
        e.website || '',
        e.email || '',
        `"${(e.description || '').replace(/"/g, '""')}"`,
        `"${(e.services || '').replace(/"/g, '""')}"`,
        e.foundedYear || '',
        e.status || ''
      ];
      csvRows.push(row.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=caravana_cultural_entities.csv');
    res.send(csvRows.join('\n'));
  } catch (error) {
    console.error('Error exporting entities:', error);
    res.status(500).json({ error: 'Failed to export entities' });
  }
});

// Criar nova entidade (PÚBLICO - permite cadastro sem login)
app.post('/api/entities', async (req, res) => {
  try {
    const data = req.body;
    
    // Verificar se já existe uma entidade com o mesmo nome, município e tipo
    const existing = await prisma.entity.findFirst({
      where: {
        name: data.name,
        municipality: data.municipality,
        type: data.type
      }
    });
    
    if (existing) {
      return res.status(409).json({ 
        error: 'Entidade duplicada', 
        message: `Já existe uma entidade com o nome "${data.name}" em ${data.municipality} do tipo ${data.type}`,
        existingId: existing.id
      });
    }
    
    const entity = await prisma.entity.create({
      data: {
        name: data.name,
        type: data.type,
        category: data.category,
        municipality: data.municipality,
        region: data.region,
        lat: data.lat,
        lng: data.lng,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        socialMedia: data.socialMedia,
        description: data.description,
        services: data.services,
        foundedYear: data.foundedYear,
        status: data.status || 'pending'
      }
    });
    res.status(201).json(entity);
  } catch (error) {
    console.error('Error creating entity:', error);
    res.status(500).json({ error: 'Failed to create entity' });
  }
});

// Deletar entidade (protegido)
app.delete('/api/entities/:id', requireAuth, async (req, res) => {
  try {
    await prisma.entity.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting entity:', error);
    res.status(500).json({ error: 'Failed to delete entity' });
  }
});

// Atualizar status da entidade (protegido)
app.patch('/api/entities/:id', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const entity = await prisma.entity.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(entity);
  } catch (error) {
    console.error('Error updating entity:', error);
    res.status(500).json({ error: 'Failed to update entity' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const [entityCount, municipalityCount, byStatus, byType] = await Promise.all([
      prisma.entity.count(),
      prisma.entity.findMany({ distinct: ['municipality'], select: { municipality: true } }),
      prisma.entity.groupBy({ by: ['status'], _count: true }),
      prisma.entity.groupBy({ by: ['type'], _count: true })
    ]);

    res.json({
      entityCount,
      municipalityCount: municipalityCount.length,
      byStatus,
      byType
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/municipalities', async (req, res) => {
  try {
    const municipalities = await prisma.entity.findMany({
      distinct: ['municipality'],
      select: { municipality: true, region: true, lat: true, lng: true }
    });
    res.json(municipalities);
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    res.status(500).json({ error: 'Failed to fetch municipalities' });
  }
});

// Rotas do Scraper
app.get('/api/scraper/status', async (req, res) => {
  try {
    const apifyConfig = await prisma.config.findUnique({ where: { key: 'APIFY_TOKEN' } });
    const geminiConfig = await prisma.config.findUnique({ where: { key: 'GEMINI_TOKENS' } });
    
    const hasApify = !!(apifyConfig?.value && apifyConfig.value !== 'YOUR_API_TOKEN_HERE');
    const hasGemini = !!(geminiConfig?.value);
    
    let geminiTokenCount = 0;
    if (geminiConfig?.value) {
      try {
        const tokens = JSON.parse(geminiConfig.value);
        geminiTokenCount = Array.isArray(tokens) ? tokens.length : 0;
      } catch {
        geminiTokenCount = 0;
      }
    }
    
    res.json({
      configured: hasApify || hasGemini,
      hasApify,
      hasGemini,
      geminiTokenCount,
      lastUpdated: geminiConfig?.updatedAt || apifyConfig?.updatedAt || null
    });
  } catch (error) {
    console.error('Error fetching scraper status:', error);
    res.json({ configured: false, hasApify: false, hasGemini: false, lastUpdated: null });
  }
});

app.get('/api/scraper/config', async (req, res) => {
  try {
    const apifyConfig = await prisma.config.findUnique({ where: { key: 'APIFY_TOKEN' } });
    const geminiConfig = await prisma.config.findUnique({ where: { key: 'GEMINI_TOKENS' } });
    
    let geminiTokens = [];
    if (geminiConfig?.value) {
      try {
        geminiTokens = JSON.parse(geminiConfig.value);
      } catch {
        geminiTokens = [];
      }
    }
    
    res.json({
      apifyToken: apifyConfig?.value || '',
      geminiTokens: geminiTokens
    });
  } catch (error) {
    console.error('Error fetching scraper config:', error);
    res.json({ apifyToken: '', geminiTokens: [] });
  }
});

// Configurar tokens do scraper (protegido)
app.post('/api/scraper/configure', requireAuth, async (req, res) => {
  try {
    const { apifyToken, geminiToken, geminiTokens } = req.body;
    
    // Salvar token Apify
    if (apifyToken && apifyToken.trim()) {
      await prisma.config.upsert({
        where: { key: 'APIFY_TOKEN' },
        update: { value: apifyToken.trim() },
        create: { key: 'APIFY_TOKEN', value: apifyToken.trim() }
      });
    }
    
    // Salvar tokens Gemini
    let tokensToSave = [];
    if (geminiToken && geminiToken.trim()) {
      tokensToSave = [geminiToken.trim()];
    }
    if (geminiTokens && Array.isArray(geminiTokens) && geminiTokens.length > 0) {
      tokensToSave = geminiTokens.filter(t => t && t.trim());
    }
    
    if (tokensToSave.length > 0) {
      await prisma.config.upsert({
        where: { key: 'GEMINI_TOKENS' },
        update: { value: JSON.stringify(tokensToSave) },
        create: { key: 'GEMINI_TOKENS', value: JSON.stringify(tokensToSave) }
      });
    }
    
    console.log(`[CONFIG] Salvos: Apify=${!!apifyToken}, Gemini=${tokensToSave.length} tokens`);
    res.json({ success: true, geminiTokenCount: tokensToSave.length });
  } catch (error) {
    console.error('Error saving config:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// Executar scraper Apify (protegido)
app.post('/api/scraper/run-apify', requireAuth, async (req, res) => {
  try {
    const config = await getTokensFromDB();
    
    if (!config.APIFY_TOKEN || config.APIFY_TOKEN === 'YOUR_API_TOKEN_HERE') {
      return res.status(400).json({ error: 'Token Apify não configurado' });
    }

    const { ApifyClient } = await import('apify-client');
    const apifyClient = new ApifyClient({ token: config.APIFY_TOKEN });

    const municipalitiesData = JSON.parse(fs.readFileSync(path.join(SCRAPER_DIR, 'municipalities.json'), 'utf8'));

    const searchQueries = municipalitiesData.searchQueries || [
      { text: 'centro cultural', type: 'associacao_cultural', category: 'Centro Cultural' },
      { text: 'centro comunitário', type: 'associacao_cultural', category: 'Centro Comunitário' },
      { text: 'associação cultural', type: 'associacao_cultural', category: 'Associação Cultural' },
      { text: 'espaço cultural', type: 'associacao_cultural', category: 'Espaço Cultural' },
      { text: 'casa de cultura', type: 'associacao_cultural', category: 'Casa de Cultura' }
    ];

    const limitedQueries = searchQueries.slice(0, 5);
    const maxMunicipalities = 5;
    let munCount = 0;
    const allRecords = [];

    console.log(`[APIFY] Iniciando scraper: ${maxMunicipalities} municípios x ${limitedQueries.length} queries`);

    for (const region of municipalitiesData.regions) {
      if (munCount >= maxMunicipalities) break;
      
      for (const mun of region.municipalities) {
        if (munCount >= maxMunicipalities) break;
        munCount++;

        for (const query of limitedQueries) {
          const queryText = typeof query === 'string' ? query : (query.text || query.query);
          
          try {
            console.log(`[APIFY] ${queryText} em ${mun.name}...`);

            const input = {
              searchStringsArray: [`${queryText} em ${mun.name}, Espírito Santo, Brasil`],
              locationQuery: `${mun.name}, Espírito Santo, Brasil`,
              maxCrawledPlacesPerSearch: 20,
              language: 'pt-BR',
              countryCode: 'br',
              skipClosedPlaces: false,
              includeWebResults: false,
              maxReviews: 0,
              maxImages: 1,
              exportPlaceUrls: false,
              scrapeDirectories: false
            };

            const run = await apifyClient.actor('compass/crawler-google-places').call(input);

            if (run.status === 'SUCCEEDED') {
              const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
              
              const queryType = typeof query === 'string' ? 'associacao_cultural' : query.type;
              const queryCategory = typeof query === 'string' ? 'Cultura' : query.category;
              
              console.log(`  ✓ Encontrados ${items.length} resultados`);
              
              for (const item of items) {
                const title = item.title || item.name || '';
                const address = item.address || '';
                
                if (title && title.length > 2) {
                  allRecords.push({
                    name: title,
                    type: queryType,
                    category: queryCategory,
                    municipality: mun.name,
                    region: region.name,
                    lat: item.location?.lat || mun.lat,
                    lng: item.location?.lng || mun.lng,
                    address,
                    phone: item.phone || item.phoneUnformatted || '',
                    website: item.website || '',
                    email: item.email || '',
                    description: item.description || `Encontrado via Google Maps em ${mun.name}`,
                    status: 'pending'
                  });
                }
              }
            }

            await new Promise(r => setTimeout(r, 2000));
          } catch (e) {
            console.error(`Erro Apify "${queryText}" em ${mun.name}: ${e.message}`);
          }
        }
      }
    }

    const unique = [];
    const seen = new Set();
    for (const r of allRecords) {
      const key = (r.name + r.municipality + r.type).toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seen.has(key) && r.name && r.name.length > 2) {
        seen.add(key);
        unique.push(r);
      }
    }

    let imported = 0;
    let skipped = 0;
    for (const entity of unique) {
      try {
        const existing = await prisma.entity.findFirst({
          where: {
            name: entity.name,
            municipality: entity.municipality,
            type: entity.type
          }
        });
        if (existing) {
          skipped++;
          continue;
        }
        await prisma.entity.create({ data: entity });
        imported++;
      } catch (e) {
        // duplicado ignorado
      }
    }

    console.log(`Apify scraper: ${unique.length} encontrados, ${imported} importados, ${skipped} duplicados`);
    res.json({ success: true, totalFound: unique.length, imported, skipped });
  } catch (error) {
    console.error('Error running Apify scraper:', error);
    res.status(500).json({ error: 'Failed to run Apify scraper' });
  }
});

// Enriquecer entidades com Gemini (protegido)
app.post('/api/scraper/enrich', requireAuth, async (req, res) => {
  try {
    const config = await getTokensFromDB();
    const tokens = config.GEMINI_TOKENS || [];
    
    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Token Gemini não configurado' });
    }

    const pendingEntities = await prisma.entity.findMany({
      where: {
        OR: [
          { description: null },
          { description: '' },
          { website: null },
          { website: '' },
          { phone: null },
          { phone: '' },
          { email: null },
          { email: '' }
        ]
      },
      take: 30
    });

    console.log(`[ENRICH] Enriquecendo ${pendingEntities.length} entidades...`);

    let tokenIndex = 0;
    let updated = 0;
    let failed = 0;

    for (const entity of pendingEntities) {
      const token = tokens[tokenIndex % tokens.length];
      tokenIndex++;

      try {
        const prompt = `Busque informações sobre "${entity.name}" localizado em ${entity.municipality}, ${entity.region}, Espírito Santo, Brasil.

Forneça as informações no seguinte formato JSON:
{
  "website": "URL do site oficial (se existir)",
  "email": "email de contato (se existir)",
  "phone": "telefone com DDD (se existir)",
  "description": "Descrição curta e objetiva em até 200 caracteres sobre o que é e o que faz",
  "services": "Principais serviços ou atividades oferecidas"
}

Se não encontrar alguma informação, use null. Seja preciso e objetivo.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${token}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                topK: 20,
                topP: 0.8,
                maxOutputTokens: 500
              }
            })
          }
        );

        if (!response.ok) {
          failed++;
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!text) {
          failed++;
          continue;
        }

        let enrichedData = {};
        
        try {
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            enrichedData = JSON.parse(jsonStr);
          }
        } catch (parseError) {
          console.log(`[ENRICH] Falha ao parsear JSON para ${entity.name}`);
        }

        const updateData = {};
        
        if (!entity.website && enrichedData.website && enrichedData.website !== 'null') {
          updateData.website = enrichedData.website.trim();
        }
        
        if (!entity.email && enrichedData.email && enrichedData.email !== 'null') {
          updateData.email = enrichedData.email.trim();
        }
        
        if (!entity.phone && enrichedData.phone && enrichedData.phone !== 'null') {
          updateData.phone = enrichedData.phone.trim();
        }
        
        if (!entity.description && enrichedData.description && enrichedData.description !== 'null') {
          updateData.description = enrichedData.description.substring(0, 500).trim();
        }
        
        if (!entity.services && enrichedData.services && enrichedData.services !== 'null') {
          updateData.services = enrichedData.services.substring(0, 300).trim();
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.entity.update({
            where: { id: entity.id },
            data: updateData
          });
          updated++;
          console.log(`[ENRICH] ✓ ${entity.name}: ${Object.keys(updateData).join(', ')}`);
        }

        await new Promise(r => setTimeout(r, 2000));
        
      } catch (e) {
        console.error(`[ENRICH] Erro ao enriquecer ${entity.name}: ${e.message}`);
        failed++;
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    console.log(`[ENRICH] Concluído: ${updated} atualizadas, ${failed} falharam`);
    res.json({ success: true, updated, failed, total: pendingEntities.length });
  } catch (error) {
    console.error('Error enriching entities:', error);
    res.status(500).json({ error: 'Failed to enrich entities' });
  }
});

// Executar scraper Gemini (protegido)
app.post('/api/scraper/run-gemini', requireAuth, async (req, res) => {
  try {
    const { maxMunicipalities = 5 } = req.body;

    const config = await getTokensFromDB();
    const tokens = config.GEMINI_TOKENS || [];
    
    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Configure pelo menos um token Gemini primeiro' });
    }

    const PROGRESS_FILE = path.join(SCRAPER_DIR, 'gemini_progress.json');
    const RESULTS_FILE = path.join(SCRAPER_DIR, 'gemini_results.json');

    let progress = { lastRegionIdx: 0, lastMunIdx: 0, lastQueryIdx: 0 };
    let existingResults = [];

    if (fs.existsSync(PROGRESS_FILE)) {
      progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
    if (fs.existsSync(RESULTS_FILE)) {
      existingResults = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    }

    const tokenQuotaHit = new Map();
    for (let i = 0; i < tokens.length; i++) {
      tokenQuotaHit.set(i, false);
    }

    const municipalitiesData = JSON.parse(fs.readFileSync(path.join(SCRAPER_DIR, 'municipalities.json'), 'utf8'));

    const searchQueries = municipalitiesData.searchQueries?.map(q => ({
      text: q.query || q.text || q,
      type: q.type || 'associacao_cultural',
      category: q.category || 'Cultura'
    })) || [
      { text: 'centro cultural', type: 'associacao_cultural', category: 'Centro Cultural' },
      { text: 'associação cultural', type: 'associacao_cultural', category: 'Associação Cultural' },
      { text: 'ponto de cultura', type: 'ponto_cultura', category: 'Ponto de Cultura' },
      { text: 'rádio comunitária', type: 'radio_comunitaria', category: 'Rádio Comunitária' },
      { text: 'cineclube', type: 'cineclube', category: 'Cineclube' }
    ];

    let municipalitiesToSearch = [];
    for (let ri = progress.lastRegionIdx; ri < municipalitiesData.regions.length; ri++) {
      const region = municipalitiesData.regions[ri];
      for (let mi = (ri === progress.lastRegionIdx ? progress.lastMunIdx : 0); mi < region.municipalities.length; mi++) {
        if (municipalitiesToSearch.length >= maxMunicipalities) break;
        municipalitiesToSearch.push({ region, mun: region.municipalities[mi] });
      }
      if (municipalitiesToSearch.length >= maxMunicipalities) break;
    }

    const allRecords = [...existingResults];

    const getAvailableToken = () => {
      for (let i = 0; i < tokens.length; i++) {
        if (!tokenQuotaHit.get(i)) return i;
      }
      return null;
    };

    let searchIdx = 0;
    for (const { region, mun } of municipalitiesToSearch) {
      for (const query of searchQueries) {
        searchIdx++;
        const tokenIdx = getAvailableToken();
        if (tokenIdx === null) {
          console.log(`[GEMINI] Todos os tokens esgotados`);
          break;
        }

        console.log(`[GEMINI ${searchIdx}] ${query.text} em ${mun.name}...`);

        try {
          const prompt = `Liste TODAS as ${query.text} em ${mun.name}, Espírito Santo, Brasil.

Para cada local encontrado, forneça as informações no formato:
NOME | ENDEREÇO | TELEFONE | LATITUDE | LONGITUDE

Liste apenas locais reais e verificados.`;

          const token = tokens[tokenIdx];
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${token}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.4,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 2048
                }
              })
            }
          );

          const data = await response.json();

          if (data.error) {
            console.error(`Erro token ${tokenIdx}: ${data.error.message}`);
            if (data.error.message?.includes('quota') || data.error.message?.includes('exceeded')) {
              tokenQuotaHit.set(tokenIdx, true);
            }
            continue;
          }

          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

          if (!text || text.length < 10) {
            continue;
          }

          const lines = text.split('\n').filter(l => l.trim());

          for (const line of lines) {
            if (line.toLowerCase().includes('exemplo') || line.length < 10) {
              continue;
            }

            let name = '', address = '', phone = '', lat = mun.lat, lng = mun.lng;

            if (line.includes('|')) {
              const parts = line.split('|').map(p => p.trim());
              name = parts[0] || '';
              address = parts[1] || '';
              phone = parts[2] || '';
              
              if (parts[3] && !isNaN(parseFloat(parts[3]))) {
                lat = parseFloat(parts[3]);
              }
              if (parts[4] && !isNaN(parseFloat(parts[4]))) {
                lng = parseFloat(parts[4]);
              }
            } else {
              name = line.split(/[-–—,]/)[0].trim();
            }

            name = name.replace(/^[\d\.\)\-\*\•\→]+\s*/, '').trim();
            
            if (!name || name.length < 3 || name.length > 100) continue;

            allRecords.push({
              name: name,
              type: query.type,
              category: query.category || 'Cultura',
              municipality: mun.name,
              region: region.name,
              lat: lat,
              lng: lng,
              address: address || '',
              phone: phone || '',
              website: '',
              description: `Encontrado via Gemini: ${query.text} em ${mun.name}`,
              status: 'pending'
            });
          }

          await new Promise(r => setTimeout(r, 2500));
        } catch (e) {
          console.error(`Erro na busca ${query.text} em ${mun.name}: ${e.message}`);
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    const unique = [];
    const seen = new Set();
    for (const r of allRecords) {
      const key = (r.name + r.municipality + r.type).toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seen.has(key) && r.name && r.name.length > 2) {
        seen.add(key);
        unique.push(r);
      }
    }

    let imported = 0;
    let skipped = 0;
    for (const entity of unique) {
      try {
        const existing = await prisma.entity.findFirst({
          where: {
            name: entity.name,
            municipality: entity.municipality,
            type: entity.type
          }
        });
        if (existing) {
          skipped++;
          continue;
        }
        await prisma.entity.create({ data: entity });
        imported++;
      } catch (e) {
        // duplicado ignorado
      }
    }

    if (fs.existsSync(PROGRESS_FILE)) fs.unlinkSync(PROGRESS_FILE);
    if (fs.existsSync(RESULTS_FILE)) fs.unlinkSync(RESULTS_FILE);

    console.log(`Gemini scraper: ${unique.length} encontrados, ${imported} importados, ${skipped} duplicados`);
    res.json({ success: true, totalFound: unique.length, imported, skipped, searched: municipalitiesToSearch.length });
  } catch (error) {
    console.error('Error running Gemini scraper:', error);
    res.status(500).json({ error: 'Failed to run Gemini scraper' });
  }
});

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Todas as outras rotas retornam o index.html (para SPA routing)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`📍 API: http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 Frontend: http://0.0.0.0:${PORT}`);
});
