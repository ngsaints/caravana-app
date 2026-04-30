import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
