import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Setup Hostinger - Caravana Cultural\n');

const prisma = new PrismaClient();

async function setup() {
  try {
    // Verificar se as tabelas existem
    console.log('🔍 Verificando banco de dados...');
    
    try {
      await prisma.entity.count();
      console.log('✅ Banco de dados já configurado!');
      
      const entityCount = await prisma.entity.count();
      const municipalityCount = await prisma.municipality.count();
      
      console.log(`\n📊 Estatísticas:`);
      console.log(`   Entidades: ${entityCount}`);
      console.log(`   Municípios: ${municipalityCount}`);
      
    } catch (error) {
      console.log('⚠️  Tabelas não encontradas. Criando...\n');
      
      // Executar migrations
      console.log('📦 Executando migrations...');
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      
      // Verificar se precisa popular municípios
      const munCount = await prisma.municipality.count();
      
      if (munCount === 0) {
        console.log('\n🌱 Populando municípios...');
        
        const municipalities = [
          { name: 'Vitória', lat: -20.3155, lng: -40.3128, region: 'Região Imediata de Vitória' },
          { name: 'Vila Velha', lat: -20.3297, lng: -40.2925, region: 'Região Imediata de Vitória' },
          { name: 'Serra', lat: -20.1287, lng: -40.3075, region: 'Região Imediata de Vitória' },
          { name: 'Cariacica', lat: -20.2619, lng: -40.4177, region: 'Região Imediata de Vitória' },
          { name: 'Guarapari', lat: -20.6686, lng: -40.4988, region: 'Região Imediata de Vitória' },
          { name: 'Viana', lat: -20.3909, lng: -40.5619, region: 'Região Imediata de Vitória' },
          { name: 'Anchieta', lat: -20.8056, lng: -40.6414, region: 'Região Imediata de Vitória' },
          { name: 'Fundão', lat: -19.9361, lng: -40.4067, region: 'Região Imediata de Vitória' },
          { name: 'Alfredo Chaves', lat: -20.6369, lng: -40.7536, region: 'Região Imediata de Vitória' },
          { name: 'Piúma', lat: -20.8458, lng: -40.7278, region: 'Região Imediata de Vitória' },
          { name: 'São Mateus', lat: -18.7157, lng: -39.8578, region: 'Região Imediata de São Mateus' },
          { name: 'Conceição da Barra', lat: -18.4974, lng: -39.7394, region: 'Região Imediata de São Mateus' },
          { name: 'Jaguaré', lat: -18.9642, lng: -40.1617, region: 'Região Imediata de São Mateus' },
          { name: 'Colatina', lat: -19.5396, lng: -40.6306, region: 'Região Imediata de Colatina' },
          { name: 'Baixo Guandu', lat: -19.0611, lng: -41.0139, region: 'Região Imediata de Colatina' },
          { name: 'São Gabriel da Palha', lat: -18.7178, lng: -40.5375, region: 'Região Imediata de Colatina' },
          { name: 'Marilândia', lat: -19.4092, lng: -40.4814, region: 'Região Imediata de Colatina' },
          { name: 'Governador Lindenberg', lat: -19.1867, lng: -40.7394, region: 'Região Imediata de Colatina' },
          { name: 'Águia Branca', lat: -18.9822, lng: -40.9444, region: 'Região Imediata de Colatina' },
          { name: 'Alto Rio Novo', lat: -19.0592, lng: -40.8189, region: 'Região Imediata de Colatina' },
          { name: 'Mantenópolis', lat: -18.8622, lng: -41.1303, region: 'Região Imediata de Colatina' },
          { name: 'Pancas', lat: -18.4386, lng: -40.9611, region: 'Região Imediata de Colatina' },
          { name: 'São Domingos do Norte', lat: -19.1778, lng: -40.5956, region: 'Região Imediata de Colatina' },
          { name: 'São Roque do Canaã', lat: -19.3033, lng: -40.6406, region: 'Região Imediata de Colatina' },
          { name: 'Vila Valério', lat: -18.9464, lng: -40.7908, region: 'Região Imediata de Colatina' },
          { name: 'Itaguaçu', lat: -19.5508, lng: -40.8572, region: 'Região Imediata de Colatina' },
          { name: 'Linhares', lat: -19.3908, lng: -40.0723, region: 'Norte do ES' },
          { name: 'Aracruz', lat: -19.8225, lng: -40.2738, region: 'Norte do ES' },
          { name: 'Cachoeiro de Itapemirim', lat: -20.8486, lng: -41.1129, region: 'Sul do ES' },
          { name: 'Marataízes', lat: -21.0404, lng: -40.8333, region: 'Sul do ES' },
          { name: 'Domingos Martins', lat: -20.3633, lng: -40.6628, region: 'Serrana' },
          { name: 'Santa Leopoldina', lat: -20.1664, lng: -40.5334, region: 'Serrana' }
        ];
        
        for (const mun of municipalities) {
          await prisma.municipality.create({ data: mun });
        }
        
        console.log(`✅ ${municipalities.length} municípios criados`);
      }
      
      console.log('\n✅ Banco de dados configurado com sucesso!');
    }
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setup();
