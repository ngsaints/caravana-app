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
const SCRAPER_CONFIG_PATH = path.join(__dirname, '../../src/scraper', 'config.json');

// Função de backup automático
function autoBackup() {
  try {
    const DB_PATH = path.join(__dirname, '../../prisma/dev.db');
    const BACKUP_DIR = path.join(__dirname, '../../backups');
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupPath = path.join(BACKUP_DIR, `auto-${timestamp}.db`);
    
    if (fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, backupPath);
      console.log(`[BACKUP] ✅ Backup automático: auto-${timestamp}.db`);
      
      // Limpar backups antigos (manter últimos 20)
      const backups = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('auto-') && f.endsWith('.db'))
        .map(f => ({
          name: f,
          path: path.join(BACKUP_DIR, f),
          time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);
      
      if (backups.length > 20) {
        backups.slice(20).forEach(backup => fs.unlinkSync(backup.path));
      }
    }
  } catch (error) {
    console.error('[BACKUP] Erro:', error.message);
  }
}

// Backup a cada 1 hora
setInterval(autoBackup, 60 * 60 * 1000);
// Backup inicial após 5 segundos
setTimeout(autoBackup, 5000);

// Helper para buscar tokens do banco de dados
async function getTokensFromDB() {
  const apifyConfig = await prisma.config.findUnique({ where: { key: 'APIFY_TOKEN' } });
  const geminiConfig = await prisma.config.findUnique({ where: { key: 'GEMINI_TOKENS' } });
  
  let geminiTokens: string[] = [];
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

app.patch('/api/entities/:id', async (req, res) => {
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
      prisma.entity.count(),
      prisma.municipality.count(),
      prisma.entity.findMany()
    ]);

    const byType = {};
    const byRegion = {};
    const byStatus = {};

    entities.forEach(e => {
      byType[e.type] = (byType[e.type] || 0) + 1;
      byRegion[e.region] = (byRegion[e.region] || 0) + 1;
      byStatus[e.status] = (byStatus[e.status] || 0) + 1;
    });

    res.json({
      entityCount,
      municipalityCount,
      byType: Object.entries(byType).map(([type, _count]) => ({ type, _count })),
      byRegion: Object.entries(byRegion).map(([region, _count]) => ({ region, _count })),
      byStatus: Object.entries(byStatus).map(([status, _count]) => ({ status, _count }))
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

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
    
    let geminiTokens: string[] = [];
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
app.post('/api/scraper/configure', async (req, res) => {
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
    let tokensToSave: string[] = [];
    if (geminiToken && geminiToken.trim()) {
      tokensToSave = [geminiToken.trim()];
    }
    if (geminiTokens && Array.isArray(geminiTokens) && geminiTokens.length > 0) {
      tokensToSave = geminiTokens.filter((t: string) => t && t.trim());
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

app.post('/api/scraper/run-apify', async (req, res) => {
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
      { text: 'casa de cultura', type: 'associacao_cultural', category: 'Casa de Cultura' },
      { text: 'centro de cultura', type: 'associacao_cultural', category: 'Centro Cultural' }
    ];

    // Limitar queries para teste (pegar apenas as primeiras 5)
    const limitedQueries = searchQueries.slice(0, 5);

    const maxMunicipalities = 5;
    let munCount = 0;
    const allRecords: any[] = [];

    console.log(`[APIFY] Iniciando scraper: ${maxMunicipalities} municípios x ${limitedQueries.length} queries = ${maxMunicipalities * limitedQueries.length} buscas`);

    let totalSearches = 0;
    const expectedSearches = maxMunicipalities * limitedQueries.length;

    for (const region of municipalitiesData.regions) {
      if (munCount >= maxMunicipalities) break;
      
      for (const mun of region.municipalities) {
        if (munCount >= maxMunicipalities) break;
        munCount++;

        for (const query of limitedQueries) {
          const queryText = typeof query === 'string' ? query : (query.text || query.query);
          
          try {
            totalSearches++;
            console.log(`[APIFY ${totalSearches}/${expectedSearches}] ${queryText} em ${mun.name}...`);

            // Parâmetros conforme documentação do Google Maps Scraper
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
              
              for (const item of items as any[]) {
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

            // Delay entre requisições para evitar rate limiting
            await new Promise(r => setTimeout(r, 2000));
          } catch (e: any) {
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

app.post('/api/scraper/enrich', async (req, res) => {
  try {
    const config = await getTokensFromDB();
    const tokens = config.GEMINI_TOKENS || [];
    
    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Token Gemini não configurado' });
    }

    // Buscar entidades que precisam de enriquecimento
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
      take: 30 // Reduzido para 30 para evitar timeout
    });

    console.log(`[ENRICH] Enriquecendo ${pendingEntities.length} entidades...`);

    let tokenIndex = 0;
    let updated = 0;
    let failed = 0;

    for (const entity of pendingEntities) {
      const token = tokens[tokenIndex % tokens.length];
      tokenIndex++;

      try {
        // Prompt otimizado para extrair informações estruturadas
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
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${token}`,
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
          const errorText = await response.text();
          console.error(`[ENRICH] Erro HTTP ${response.status} para ${entity.name}: ${errorText}`);
          
          // Se for erro de quota, extrair tempo de retry e esperar
          if (errorText.includes('quota') || errorText.includes('RESOURCE_EXHAUSTED')) {
            try {
              const errorData = JSON.parse(errorText);
              const retryDelay = errorData.error?.details?.find((d: any) => d['@type']?.includes('RetryInfo'))?.retryDelay;
              
              if (retryDelay) {
                const seconds = parseInt(retryDelay.replace('s', '')) || 60;
                console.log(`[ENRICH] Quota excedida. Aguardando ${seconds}s antes de continuar...`);
                await new Promise(r => setTimeout(r, seconds * 1000));
                
                // Tentar novamente a mesma entidade
                tokenIndex--; // Voltar para mesma entidade
                continue;
              }
            } catch (parseError) {
              // Se não conseguir parsear, esperar 60s
              console.log(`[ENRICH] Quota excedida. Aguardando 60s...`);
              await new Promise(r => setTimeout(r, 60000));
              tokenIndex--; // Voltar para mesma entidade
              continue;
            }
          }
          
          // Se for erro de quota/expired/leaked, pular para próximo token
          if (errorText.includes('expired') || errorText.includes('leaked') || errorText.includes('denied')) {
            console.log(`[ENRICH] Token ${tokenIndex % tokens.length} inválido, tentando próximo...`);
          }
          
          failed++;
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!text) {
          console.log(`[ENRICH] Sem resposta para ${entity.name}`);
          failed++;
          continue;
        }

        // Tentar extrair JSON da resposta
        let enrichedData: any = {};
        
        try {
          // Remover markdown code blocks se existirem
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            enrichedData = JSON.parse(jsonStr);
          }
        } catch (parseError) {
          // Se falhar o parse JSON, tentar extrair manualmente
          console.log(`[ENRICH] Falha ao parsear JSON para ${entity.name}, tentando extração manual`);
          
          // Extrair website
          const websiteMatch = text.match(/(?:website|site|url)["']?\s*:\s*["']([^"'\n]+)["']/i);
          if (websiteMatch) enrichedData.website = websiteMatch[1];
          
          // Extrair email
          const emailMatch = text.match(/(?:email|e-mail)["']?\s*:\s*["']?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']?/i);
          if (emailMatch) enrichedData.email = emailMatch[1];
          
          // Extrair telefone
          const phoneMatch = text.match(/(?:phone|telefone|tel)["']?\s*:\s*["']?([0-9\s\(\)\-+]{8,})["']?/i);
          if (phoneMatch) enrichedData.phone = phoneMatch[1].trim();
          
          // Extrair descrição
          const descMatch = text.match(/(?:description|descrição|descricao)["']?\s*:\s*["']([^"'\n]{20,200})["']/i);
          if (descMatch) enrichedData.description = descMatch[1];
        }

        // Preparar dados para atualização
        const updateData: any = {};
        
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

        // Atualizar apenas se houver dados novos
        if (Object.keys(updateData).length > 0) {
          await prisma.entity.update({
            where: { id: entity.id },
            data: updateData
          });
          updated++;
          console.log(`[ENRICH] ✓ ${entity.name}: ${Object.keys(updateData).join(', ')}`);
        } else {
          console.log(`[ENRICH] - ${entity.name}: nenhum dado novo encontrado`);
        }

        // Delay entre requisições para evitar rate limit
        await new Promise(r => setTimeout(r, 2000));
        
      } catch (e: any) {
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

app.post('/api/scraper/run-gemini', async (req, res) => {
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
      // Associações Culturais
      { text: 'centro cultural', type: 'associacao_cultural', category: 'Centro Cultural' },
      { text: 'associação cultural', type: 'associacao_cultural', category: 'Associação Cultural' },
      { text: 'casa de cultura', type: 'associacao_cultural', category: 'Casa de Cultura' },
      { text: 'espaço cultural', type: 'associacao_cultural', category: 'Espaço Cultural' },
      { text: 'instituto cultural', type: 'associacao_cultural', category: 'Instituto Cultural' },
      
      // Pontos de Cultura
      { text: 'ponto de cultura', type: 'ponto_cultura', category: 'Ponto de Cultura' },
      { text: 'pontão de cultura', type: 'ponto_cultura', category: 'Pontão de Cultura' },
      
      // Rádios Comunitárias
      { text: 'rádio comunitária', type: 'radio_comunitaria', category: 'Rádio Comunitária' },
      { text: 'rádio FM comunitária', type: 'radio_comunitaria', category: 'Rádio FM' },
      
      // Cineclubes
      { text: 'cineclube', type: 'cineclube', category: 'Cineclube' },
      { text: 'cinema comunitário', type: 'cineclube', category: 'Cinema Comunitário' },
      
      // Artistas e Coletivos
      { text: 'coletivo cultural', type: 'artista_coletivo', category: 'Coletivo Cultural' },
      { text: 'coletivo de arte', type: 'artista_coletivo', category: 'Coletivo de Arte' },
      { text: 'grupo de teatro', type: 'artista_coletivo', category: 'Teatro' },
      { text: 'grupo de dança', type: 'artista_coletivo', category: 'Dança' },
      { text: 'banda de música', type: 'artista_coletivo', category: 'Música' },
      
      // Específicos
      { text: 'escola de música', type: 'associacao_cultural', category: 'Música' },
      { text: 'escola de arte', type: 'associacao_cultural', category: 'Artes Visuais' },
      { text: 'capoeira', type: 'associacao_cultural', category: 'Capoeira' },
      { text: 'artesanato', type: 'associacao_cultural', category: 'Artesanato' },
      { text: 'patrimônio cultural', type: 'associacao_cultural', category: 'Patrimônio Cultural' },
      { text: 'museu', type: 'associacao_cultural', category: 'Museu' },
      { text: 'biblioteca comunitária', type: 'associacao_cultural', category: 'Literatura' },
      { text: 'teatro municipal', type: 'associacao_cultural', category: 'Teatro' },
      { text: 'galeria de arte', type: 'associacao_cultural', category: 'Artes Visuais' }
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
            generationConfig: {
              temperature: 0.4,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048
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
          // Prompt otimizado para extrair dados estruturados
          const prompt = `Liste TODAS as ${query.text} em ${mun.name}, Espírito Santo, Brasil.

Para cada local encontrado, forneça as informações no formato:
NOME | ENDEREÇO | TELEFONE | LATITUDE | LONGITUDE

Exemplo:
Centro Cultural ABC | Rua das Flores, 123 | (27) 3333-4444 | -20.3155 | -40.3128

Liste apenas locais reais e verificados. Se não souber a coordenada exata, use a coordenada do município.`;

          const data = await callGemini(prompt, mun.lat, mun.lng, tokenIdx);

          if (data.error) {
            console.error(`Erro token ${tokenIdx}: ${data.error.message}`);
            // Marcar token como esgotado se: quota excedida, expirado, ou leaked
            if (data.error.message?.includes('quota') || 
                data.error.message?.includes('exceeded') || 
                data.error.message?.includes('RESOURCE_EXHAUSTED') ||
                data.error.message?.includes('expired') ||
                data.error.message?.includes('leaked')) {
              tokenQuotaHit.set(tokenIdx, true);
              tokenCooldowns.set(tokenIdx, Date.now() + 60000);
              console.log(`Token ${tokenIdx} marcado como esgotado/inválido`);
            }
            continue;
          }

          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

          if (!text || text.length < 10) {
            console.log(`[GEMINI] Sem resultados para ${query.text} em ${mun.name}`);
            continue;
          }

          // Parsing melhorado - aceitar múltiplos formatos
          const lines = text.split('\n').filter((l: string) => l.trim());

          for (const line of lines) {
            // Ignorar linhas de cabeçalho ou explicações
            if (line.toLowerCase().includes('exemplo') || 
                line.toLowerCase().includes('formato') ||
                line.toLowerCase().includes('lista') ||
                line.length < 10) {
              continue;
            }

            let name = '', address = '', phone = '', lat = mun.lat, lng = mun.lng;

            // Tentar formato com pipe |
            if (line.includes('|')) {
              const parts = line.split('|').map((p: string) => p.trim());
              name = parts[0] || '';
              address = parts[1] || '';
              phone = parts[2] || '';
              
              // Tentar extrair coordenadas
              if (parts[3] && !isNaN(parseFloat(parts[3]))) {
                lat = parseFloat(parts[3]);
              }
              if (parts[4] && !isNaN(parseFloat(parts[4]))) {
                lng = parseFloat(parts[4]);
              }
            } 
            // Tentar formato com bullet points ou números
            else if (line.match(/^[\d\-\*\•\→]\s*(.+)/)) {
              const match = line.match(/^[\d\-\*\•\→]\s*(.+)/);
              if (match) {
                name = match[1].trim();
                
                // Tentar extrair endereço do nome
                const addressMatch = name.match(/(.+?)\s*[-–—]\s*(.+)/);
                if (addressMatch) {
                  name = addressMatch[1].trim();
                  address = addressMatch[2].trim();
                }
              }
            }
            // Formato livre - pegar primeira parte como nome
            else {
              name = line.split(/[-–—,]/)[0].trim();
            }

            // Validar e limpar nome
            name = name.replace(/^[\d\.\)\-\*\•\→]+\s*/, '').trim();
            
            // Filtros de qualidade
            if (!name || name.length < 3 || name.length > 100) continue;
            if (name.toLowerCase().includes('exemplo')) continue;
            if (name.toLowerCase().includes('formato')) continue;
            if (name.match(/^[0-9\s\-\(\)]+$/)) continue; // Apenas números

            // Adicionar resultado
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

          console.log(`[GEMINI] ✓ ${query.text} em ${mun.name}: ${lines.length} resultados processados`);

          await new Promise(r => setTimeout(r, 2500)); // Aumentado delay para evitar rate limit
        } catch (e: any) {
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

// Endpoint para backup manual
app.post('/api/backup', (req, res) => {
  try {
    autoBackup();
    res.json({ success: true, message: 'Backup criado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao criar backup' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
