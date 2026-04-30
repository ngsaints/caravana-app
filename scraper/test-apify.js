#!/usr/bin/env node

import { ApifyClient } from 'apify-client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRAPER_DIR = path.join('/root/Projeto 08 - Maps/scraper');
const configPath = path.join(SCRAPER_DIR, 'config.json');

async function main() {
  console.log('=== Teste do Scraper de Centro Culturais do ES ===\n');

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  if (!config.APIFY_TOKEN || config.APIFY_TOKEN === 'YOUR_API_TOKEN_HERE') {
    console.error('❌ Token Apify não configurado em config.json');
    process.exit(1);
  }

  const municipalitiesData = JSON.parse(fs.readFileSync(path.join(SCRAPER_DIR, 'municipalities.json'), 'utf8'));
  const client = new ApifyClient({ token: config.APIFY_TOKEN });

  const searchQueries = [
    { text: 'centro cultural', type: 'associacao_cultural', category: 'Centro Cultural' },
    { text: 'associação cultural', type: 'associacao_cultural', category: 'Associação Cultural' }
  ];

  const testMun = municipalitiesData.regions[0].municipalities[0];
  
  console.log(`Testando com município: ${testMun.name}`);
  console.log(`Queries: ${searchQueries.map(q => q.text).join(', ')}\n`);

  for (const query of searchQueries) {
    console.log(`→ Buscando: "${query.text} ${testMun.name} Espírito Santo"`);

    const input = {
      searchStringsArray: [`${query.text} ${testMun.name} Espírito Santo`],
      locationQuery: `${testMun.name}, Espírito Santo, Brazil`,
      maxCrawledPlacesPerSearch: 5,
      language: 'pt-BR',
      countryCode: 'BR'
    };

    try {
      const run = await client.actor('nwua9Gu5YrADL7KDj').call(input);

      console.log(`  Status: ${run.status}`);

      if (run.status === 'SUCCEEDED') {
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        console.log(`  Resultados: ${items.length}`);
        
        for (const item of items.slice(0, 3)) {
          console.log(`    - ${item.title || item.name || 'Sem nome'}`);
        }
      } else if (run.status === 'FAILED') {
        console.log(`  ❌ Falhou: ${run.error?.message || 'Unknown error'}`);
      }
    } catch (e) {
      console.log(`  ❌ Erro: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n✅ Teste concluído');
}

main().catch(console.error);