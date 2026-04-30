import { ApifyClient } from 'apify-client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Substitua pelo seu token Apify
const APIFY_TOKEN = process.env.APIFY_TOKEN || process.argv[2];

if (!APIFY_TOKEN || APIFY_TOKEN === 'YOUR_API_TOKEN_HERE') {
  console.error('❌ Token Apify não fornecido!');
  console.log('Uso: node recover-apify-data.mjs YOUR_APIFY_TOKEN');
  process.exit(1);
}

const client = new ApifyClient({ token: APIFY_TOKEN });

async function recoverData() {
  try {
    console.log('🔍 Buscando últimas execuções do Apify...\n');

    // Buscar TODAS as runs do actor (aumentado de 10 para 100)
    const runs = await client.actor('compass/crawler-google-places').runs().list({
      limit: 100,
      desc: true
    });

    console.log(`📊 Encontradas ${runs.items.length} execuções\n`);

    // Filtrar apenas runs bem-sucedidas
    const successfulRuns = runs.items.filter(run => run.status === 'SUCCEEDED');
    
    if (successfulRuns.length === 0) {
      console.log('❌ Nenhuma execução bem-sucedida encontrada');
      return;
    }

    console.log(`✅ ${successfulRuns.length} execuções bem-sucedidas encontradas:\n`);

    for (const run of successfulRuns) {
      const date = new Date(run.finishedAt).toLocaleString('pt-BR');
      const duration = run.stats?.runTimeSecs ? Math.round(run.stats.runTimeSecs / 60) : 'N/A';
      console.log(`  - Run ID: ${run.id}`);
      console.log(`    Data: ${date}`);
      console.log(`    Duração: ${duration} minutos`);
      console.log(`    Dataset: ${run.defaultDatasetId}\n`);
    }

    // Perguntar qual run recuperar (usar a mais recente por padrão)
    console.log(`🔄 Recuperando dados de TODAS as ${successfulRuns.length} execuções bem-sucedidas...\n`);

    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let totalRecords = 0;

    for (let i = 0; i < successfulRuns.length; i++) {
      const run = successfulRuns[i];
      console.log(`\n📦 [${i + 1}/${successfulRuns.length}] Processando run ${run.id}...`);

      try {
        // Buscar dados do dataset
        const dataset = await client.dataset(run.defaultDatasetId).listItems();
        const items = dataset.items;

        console.log(`   ${items.length} registros encontrados`);
        totalRecords += items.length;

        if (items.length === 0) continue;
        for (const item of items) {
          try {
            // Verificar se já existe
            const existing = await prisma.entity.findFirst({
              where: {
                name: item.title || item.name,
                municipality: item.city || item.municipality || 'Desconhecido'
              }
            });

            if (existing) {
              totalSkipped++;
              continue;
            }

            // Determinar tipo e categoria baseado nos dados
            let type = 'associacao_cultural';
            let category = 'Cultura';

            if (item.categoryName) {
              const cat = item.categoryName.toLowerCase();
              if (cat.includes('rádio') || cat.includes('radio')) {
                type = 'radio_comunitaria';
                category = 'Rádio Comunitária';
              } else if (cat.includes('cinema') || cat.includes('cineclube')) {
                type = 'cineclube';
                category = 'Cineclube';
              } else if (cat.includes('ponto de cultura')) {
                type = 'ponto_cultura';
                category = 'Ponto de Cultura';
              } else if (cat.includes('artista') || cat.includes('coletivo')) {
                type = 'artista_coletivo';
                category = 'Coletivo Cultural';
              }
            }

            // Criar entidade
            await prisma.entity.create({
              data: {
                name: item.title || item.name || 'Sem nome',
                type: type,
                category: category,
                municipality: item.city || item.municipality || 'Desconhecido',
                region: item.region || 'Grande Vitória',
                lat: item.location?.lat || item.latitude || -19.92,
                lng: item.location?.lng || item.longitude || -40.31,
                address: item.address || item.street || '',
                phone: item.phone || item.phoneNumber || '',
                email: item.email || '',
                website: item.website || item.url || '',
                description: item.description || `Encontrado via Apify em ${item.city || 'ES'}`,
                services: item.categories?.join(', ') || '',
                status: 'pending'
              }
            });

            totalImported++;

          } catch (error) {
            totalErrors++;
          }
        }

        console.log(`   ✓ Importadas: ${totalImported - (totalImported - items.length + totalSkipped)}, Duplicadas: ${totalSkipped - (totalSkipped - items.length)}`);

      } catch (error) {
        console.error(`   ✗ Erro ao processar run: ${error.message}`);
      }
    }

    console.log(`\n✅ Recuperação completa concluída!`);
    console.log(`   Total de registros encontrados: ${totalRecords}`);
    console.log(`   Total importadas: ${totalImported}`);
    console.log(`   Total duplicadas: ${totalSkipped}`);
    console.log(`   Total erros: ${totalErrors}`);

  } catch (error) {
    console.error('❌ Erro ao recuperar dados:', error.message);
    if (error.message.includes('401')) {
      console.error('Token Apify inválido ou expirado!');
    }
  } finally {
    await prisma.$disconnect();
  }
}

recoverData();
