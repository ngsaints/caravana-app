#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN = process.env.APIFY_TOKEN || 'YOUR_APIFY_TOKEN_HERE';
const ACTOR_ID = 'nwua9Gu5YrADL7KDj';

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'municipalities.json'), 'utf8'));
const municipalities = data.regions.flatMap(r => r.municipalities);
const queries = ['centro cultural', 'associação cultural', 'espaço cultural', 'centro comunitário', 'instituto cultural', 'fundação cultural'];

async function callActor(query, municipality) {
  const input = {
    searchStringsArray: [`${query} ${municipality} Espírito Santo`],
    locationQuery: `${municipality}, Espírito Santo, Brazil`,
    maxCrawledPlacesPerSearch: 25,
    language: 'pt-BR',
    countryCode: 'BR',
    skipClosedPlaces: false,
    scrapePlaceDetailPage: true,
    scrapeReviewsPersonalData: false,
    maxReviews: 0,
    maxImages: 0
  };

  const url = `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${TOKEN}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  const result = await response.json();
  return result.data?.id;
}

async function getRunResults(runId) {
  await new Promise(r => setTimeout(r, 15000));

  const url = `https://api.apify.com/v2/acts/${ACTOR_ID}/runs/${runId}/dataset/items?token=${TOKEN}&format=json`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Scraper: Centro Culturais do Espírito Santo              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const allRecords = [];
  let searchIndex = 0;
  const total = municipalities.length * queries.length;

  for (const mun of municipalities) {
    for (const query of queries) {
      searchIndex++;
      console.log(`[${searchIndex}/${total}] ${query} em ${mun.name}...`);

      const runId = await callActor(query, mun.name);
      if (runId) {
        const items = await getRunResults(runId);
        console.log(`   → ${items.length} resultados`);

        for (const item of items) {
          const name = item.title || item.name || '';
          if (name && name.length > 2) {
            allRecords.push({
              name,
              type: 'associacao_cultural',
              category: 'Centro Cultural',
              municipality: mun.name,
              address: item.address || item.fullAddress || '',
              phone: item.phone || '',
              website: item.website || '',
              lat: item.location?.lat || mun.lat,
              lng: item.location?.lng || mun.lng,
              source: 'Google Maps (Apify)',
              scraped_at: new Date().toISOString()
            });
          }
        }
      } else {
        console.log(`   → Erro ao iniciar`);
      }

      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log(`\nTotal coletado: ${allRecords.length}`);

  if (allRecords.length > 0) {
    const outFile = path.join(outputDir, `centros_culturais_es_${Date.now()}.csv`);
    const header = 'Nome,Tipo,Categoria,Município,Endereço,Telefone,Website,Lat,Lng,Fonte,Data\n';
    const rows = allRecords.map(r =>
      `"${r.name}","${r.type}","${r.category}","${r.municipality}","${r.address}","${r.phone}","${r.website}",${r.lat},${r.lng},"${r.source}","${r.scraped_at}"`
    ).join('\n');

    fs.writeFileSync(outFile, header + rows);
    console.log(`Salvo em: ${outFile}`);
  }

  console.log('\n✅ Concluído!');
}

main().catch(console.error);