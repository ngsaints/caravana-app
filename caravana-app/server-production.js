import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

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

// Buscar entidade por ID (público)
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

// Criar nova entidade (protegido)
app.post('/api/entities', requireAuth, async (req, res) => {
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

// Exportar CSV
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
