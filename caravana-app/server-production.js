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

app.use(cors());
app.use(express.json());

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
