import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMunicipalities() {
  try {
    const count = await prisma.municipality.count();
    console.log(`Municipalities in database: ${count}`);
    
    if (count === 0) {
      console.log('No municipalities found. Need to run seed script.');
    } else {
      const municipalities = await prisma.municipality.findMany({
        take: 5,
        select: { name: true, region: true }
      });
      console.log('Sample municipalities:', municipalities);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMunicipalities();
