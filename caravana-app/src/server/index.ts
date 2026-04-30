import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();

const SCRAPER_DIR = path.join(__dirname, '../../src/scraper');
const SCRAPER_CONFIG_PATH = path.join(SCRAPER_DIR, 'config.json');

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

app.get('/api/entities', async (req, res) => {
  try {
    const { type, category, municipality, region, status, search } = req.query;

    const where = {};

    if (type) where.type = type;
    if (category) where.category = category;
    if (municipality) where.municipality = municipality;
    if (region) where.region = region;
    if (status) where.status = status;
    if (search) {
      where.name = { contains: String(search) };
    }

    const entities = await prisma.entity.findMany({ where });
    res.json(entities);
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({ error: 'Failed to fetch entities' });
  }
});

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

app.post('/api/entities', async (req, res) => {
  try {
    const data = req.body;
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

app.delete('/api/entities/:id', async (req, res) => {
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

app.get('/api/municipalities', async (req, res) => {
  try {
    const municipalities = await prisma.municipality.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(municipalities);
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    res.status(500).json({ error: 'Failed to fetch municipalities' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const [entityCount, municipalityCount, entities] = await Promise.all([
      prisma.entity.count({ where: { status: 'active' } }),
      prisma.municipality.count(),
      prisma.entity.findMany({ where: { status: 'active' } })
    ]);

    const byType = {};
    const byRegion = {};

    entities.forEach(e => {
      byType[e.type] = (byType[e.type] || 0) + 1;
      byRegion[e.region] = (byRegion[e.region] || 0) + 1;
    });

    res.json({
      entityCount,
      municipalityCount,
      byType: Object.entries(byType).map(([type, _count]) => ({ type, _count })),
      byRegion: Object.entries(byRegion).map(([region, _count]) => ({ region, _count }))
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/scraper/status', (req, res) => {
  try {
    if (!fs.existsSync(SCRAPER_CONFIG_PATH)) {
      return res.json({ configured: false, lastUpdated: null });
    }
    const config = JSON.parse(fs.readFileSync(SCRAPER_CONFIG_PATH, 'utf8'));
    const hasApify = !!(config.APIFY_TOKEN && config.APIFY_TOKEN !== 'YOUR_API_TOKEN_HERE');
    const hasGemini = !!(config.GEMINI_TOKENS && config.GEMINI_TOKENS.length > 0) || !!(config.GEMINI_TOKEN && config.GEMINI_TOKEN !== 'YOUR_API_TOKEN_HERE');
    res.json({
      configured: hasApify || hasGemini,
      hasApify,
      hasGemini,
      lastUpdated: config.lastUpdated || null
    });
  } catch {
    res.json({ configured: false, lastUpdated: null });
  }
});

app.post('/api/scraper/configure', (req, res) => {
  try {
    const { apifyToken, geminiToken, geminiTokens } = req.body;
    const config: any = {
      lastUpdated: new Date().toISOString()
    };
    if (apifyToken && apifyToken.trim()) {
      config.APIFY_TOKEN = apifyToken.trim();
    }
    if (geminiToken && geminiToken.trim()) {
      config.GEMINI_TOKENS = [geminiToken.trim()];
    }
    if (geminiTokens && Array.isArray(geminiTokens) && geminiTokens.length > 0) {
      config.GEMINI_TOKENS = geminiTokens.filter((t: string) => t && t.trim());
    }
    fs.writeFileSync(SCRAPER_CONFIG_PATH, JSON.stringify(config, null, 2));
    res.json({ success: true, lastUpdated: config.lastUpdated });
  } catch (error) {
    console.error('Error saving config:', error);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

app.post('/api/scraper/run-apify', async (req, res) => {
  try {
    if (!fs.existsSync(SCRAPER_CONFIG_PATH)) {
      return res.status(400).json({ error: 'Configure os tokens primeiro' });
    }
    const config = JSON.parse(fs.readFileSync(SCRAPER_CONFIG_PATH, 'utf8'));
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
      { text: 'casa de cultura', type: 'associacao_cultural', category: 'Casa de Cultura' },
      { text: 'centro de cultura', type: 'associacao_cultural', category: 'Centro Cultural' }
    ];

    const maxMunicipalities = 5;
    let munCount = 0;

    for (const region of municipalitiesData.regions) {
      if (munCount >= maxMunicipalities) break;
      
      for (const mun of region.municipalities) {
        if (munCount >= maxMunicipalities) break;
        munCount++;

        for (const query of searchQueries) {
          try {
            const queryText = typeof query === 'string' ? query : query.query;
            console.log(`[APIFY] ${queryText} em ${mun.name}...`);

            const input = {
              searchStringsArray: [`${queryText} ${mun.name} Espírito Santo`],
              locationQuery: `${mun.name}, Espírito Santo, Brazil`,
              maxCrawledPlacesPerSearch: 15,
              language: 'pt-BR',
              countryCode: 'BR',
              skipClosedPlaces: true,
              scrapePlaceDetailPage: true,
              scrapeReviewsPersonalData: false,
              maxReviews: 0,
              maxImages: 0
            };

            const run = await apifyClient.actor('nwua9Gu5YrADL7KDj').call(input);

            if (run.status === 'SUCCEEDED') {
              const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
              
              const queryType = typeof query === 'string' ? 'associacao_cultural' : query.type;
              const queryCategory = typeof query === 'string' ? 'Cultura' : query.category;
              
              for (const item of items as any[]) {
                const title = item.title || item.name || '';
                const address = item.address || item.fullAddress || item.streetAddress || '';
                
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
                    description: `Encontrado via Apify em ${mun.name}`,
                    status: 'pending'
                  });
                }
              }
            }

            await new Promise(r => setTimeout(r, 3000));
          } catch (e: any) {
            console.error(`Erro Apify ${query} em ${mun.name}: ${e.message}`);
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

app.post('/api/scraper/enrich', async (req, res) => {
  try {
    if (!fs.existsSync(SCRAPER_CONFIG_PATH)) {
      return res.status(400).json({ error: 'Configure os tokens primeiro' });
    }
    const config = JSON.parse(fs.readFileSync(SCRAPER_CONFIG_PATH, 'utf8'));
    const tokens = config.GEMINI_TOKENS || (config.GEMINI_TOKEN ? [config.GEMINI_TOKEN] : []);
    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Token Gemini não configurado' });
    }

    const pendingEntities = await prisma.entity.findMany({
      where: {
        OR: [
          { description: null },
          { description: '' },
          { website: null },
          { website: '' }
        ]
      },
      take: 50
    });

    let tokenIndex = 0;
    let updated = 0;

    for (const entity of pendingEntities) {
      const token = tokens[tokenIndex % tokens.length];
      tokenIndex++;

      try {
        const prompt = `Informações sobre ${entity.name} em ${entity.municipality}, Espírito Santo, Brasil. Forneça: website oficial, email, telefone, e uma descrição curta (max 200 caracteres).`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${token}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              tools: [{ googleMaps: {} }],
              toolConfig: {
                retrievalConfig: {
                  latLng: { latitude: entity.lat, longitude: entity.lng }
                }
              }
            })
          }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const updateData: any = {};
        if (!entity.description && text) {
          updateData.description = text.substring(0, 500);
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.entity.update({
            where: { id: entity.id },
            data: updateData
          });
          updated++;
        }

        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        console.error(`Erro ao enriquecer ${entity.name}: ${e.message}`);
      }
    }

    res.json({ success: true, updated });
  } catch (error) {
    console.error('Error enriching entities:', error);
    res.status(500).json({ error: 'Failed to enrich entities' });
  }
});

app.post('/api/scraper/run-gemini', async (req, res) => {
  try {
    const { maxMunicipalities = 5 } = req.body;

    if (!fs.existsSync(SCRAPER_CONFIG_PATH)) {
      return res.status(400).json({ error: 'Configure os tokens primeiro' });
    }
    const config = JSON.parse(fs.readFileSync(SCRAPER_CONFIG_PATH, 'utf8'));
    const tokens = config.GEMINI_TOKENS || (config.GEMINI_TOKEN ? [config.GEMINI_TOKEN] : []);
    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Configure pelo menos um token Gemini primeiro' });
    }

    const PROGRESS_FILE = path.join(SCRAPER_DIR, 'gemini_progress.json');
    const RESULTS_FILE = path.join(SCRAPER_DIR, 'gemini_results.json');

    let progress = { lastRegionIdx: 0, lastMunIdx: 0, lastQueryIdx: 0 };
    let existingResults: any[] = [];

    if (fs.existsSync(PROGRESS_FILE)) {
      progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
    if (fs.existsSync(RESULTS_FILE)) {
      existingResults = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    }

    const tokenCooldowns: Map<number, number> = new Map();
    const tokenQuotaHit: Map<number, boolean> = new Map();

    for (let i = 0; i < tokens.length; i++) {
      tokenQuotaHit.set(i, false);
    }

    const municipalitiesData = JSON.parse(fs.readFileSync(path.join(SCRAPER_DIR, 'municipalities.json'), 'utf8'));

    const searchQueries = municipalitiesData.searchQueries?.map((q: any) => ({
      text: q.query || q.text || q,
      type: q.type || 'associacao_cultural',
      category: q.category || 'Cultura'
    })) || [
      { text: 'centro cultural', type: 'associacao_cultural', category: 'Centro Cultural' },
      { text: 'centro comunitário', type: 'associacao_cultural', category: 'Centro Comunitário' },
      { text: 'associação cultural', type: 'associacao_cultural', category: 'Associação Cultural' },
      { text: 'espaço cultural', type: 'associacao_cultural', category: 'Espaço Cultural' },
      { text: 'casa de cultura', type: 'associacao_cultural', category: 'Casa de Cultura' },
      { text: 'instituto cultural', type: 'associacao_cultural', category: 'Instituto Cultural' },
      { text: 'galeria de arte', type: 'associacao_cultural', category: 'Galeria de Arte' }
    ];

    let municipalitiesToSearch: any[] = [];
    for (let ri = progress.lastRegionIdx; ri < municipalitiesData.regions.length; ri++) {
      const region = municipalitiesData.regions[ri];
      for (let mi = (ri === progress.lastRegionIdx ? progress.lastMunIdx : 0); mi < region.municipalities.length; mi++) {
        if (municipalitiesToSearch.length >= maxMunicipalities) break;
        municipalitiesToSearch.push({ region, mun: region.municipalities[mi] });
      }
      if (municipalitiesToSearch.length >= maxMunicipalities) break;
    }

    const totalSearches = municipalitiesToSearch.length * searchQueries.length;
    let processedSearches = 0;
    const allRecords = [...existingResults];

    const getAvailableToken = (): number | null => {
      for (let i = 0; i < tokens.length; i++) {
        if (tokenQuotaHit.get(i)) continue;
        const cooldown = tokenCooldowns.get(i) || 0;
        if (Date.now() >= cooldown) return i;
      }
      return null;
    };

    const callGemini = async (prompt: string, lat: number, lng: number, tokenIdx: number) => {
      const token = tokens[tokenIdx];
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: { latitude: lat, longitude: lng }
              }
            }
          })
        }
      );
      return response.json();
    };

    let searchIdx = 0;
    outerLoop:
    for (const { region, mun } of municipalitiesToSearch) {
      for (const query of searchQueries) {
        searchIdx++;
        const tokenIdx = getAvailableToken();
        if (tokenIdx === null) {
          console.log(`[GEMINI] Todos os tokens esgotados. Parando em ${searchIdx}/${totalSearches}`);
          fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ lastRegionIdx: 0, lastMunIdx: searchIdx, lastQueryIdx: 0 }));
          fs.writeFileSync(RESULTS_FILE, JSON.stringify(allRecords));
          return res.json({
            success: true,
            partial: true,
            message: `Parou em ${searchIdx}/${totalSearches} - tokens esgotados. Rode novamente para continuar.`,
            totalFound: allRecords.length,
            imported: 0,
            skipped: 0
          });
        }

        console.log(`[GEMINI ${searchIdx}/${totalSearches}] ${query.text} em ${mun.name} (token ${tokenIdx})...`);

        try {
          const prompt = `Liste todas as ${query.text} em ${mun.name}, Espírito Santo, Brasil. Para cada uma, forneça: nome completo, endereço, telefone se disponível. Formato: um resultado por linha, separando campos com |`;

          const data = await callGemini(prompt, mun.lat, mun.lng, tokenIdx);

          if (data.error) {
            console.error(`Erro token ${tokenIdx}: ${data.error.message}`);
            if (data.error.message?.includes('quota') || data.error.message?.includes('exceeded')) {
              tokenQuotaHit.set(tokenIdx, true);
              tokenCooldowns.set(tokenIdx, Date.now() + 60000);
              console.log(`Token ${tokenIdx} marcado como esgotado`);
            }
            continue;
          }

          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

          const lines = text.split('\n').filter((l: string) => l.trim() && l.includes('|'));

          for (const line of lines) {
            const parts = line.split('|').map((p: string) => p.trim());
            if (parts.length >= 1 && parts[0] && parts[0].length > 2) {
              allRecords.push({
                name: parts[0],
                type: query.type,
                category: query.category || 'Cultura',
                municipality: mun.name,
                region: region.name,
                lat: parts[3] || mun.lat,
                lng: parts[4] || mun.lng,
                address: parts[1] || '',
                phone: parts[2] || '',
                website: '',
                description: `Encontrado via Gemini Maps em ${mun.name}`,
                status: 'pending'
              });
            }
          }

          await new Promise(r => setTimeout(r, 2000));
        } catch (e: any) {
          console.error(`Erro na busca ${query.text} em ${mun.name}: ${e.message}`);
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

app.post('/api/entities/import', async (req, res) => {
  try {
    const { entities } = req.body;
    if (!entities || !Array.isArray(entities)) {
      return res.status(400).json({ error: 'Array de entidades é obrigatório' });
    }

    const created = [];
    for (const entity of entities) {
      try {
        const createdEntity = await prisma.entity.create({
          data: {
            name: entity.name,
            type: entity.type || 'associacao_cultural',
            category: entity.category || 'Cultura',
            municipality: entity.municipality,
            region: entity.region,
            lat: entity.lat || 0,
            lng: entity.lng || 0,
            address: entity.address,
            phone: entity.phone,
            email: entity.email,
            website: entity.website,
            description: entity.description,
            services: entity.services,
            status: 'pending'
          }
        });
        created.push(createdEntity);
      } catch (e) {
        console.error(`Error creating entity ${entity.name}:`, e.message);
      }
    }

    res.json({ success: true, imported: created.length, total: entities.length });
  } catch (error) {
    console.error('Error importing entities:', error);
    res.status(500).json({ error: 'Failed to import entities' });
  }
});

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

const PORT = Number(process.env.PORT) || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
