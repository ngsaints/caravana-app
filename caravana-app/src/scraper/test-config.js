#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, 'config.json');
const municipalitiesPath = path.join(__dirname, 'municipalities.json');

async function main() {
  console.log('=== Teste: Verificar Configuração do Scraper ===\n');

  if (!fs.existsSync(configPath)) {
    console.error('❌ config.json não encontrado');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  console.log('📋 Configuração atual:');
  console.log(`  - APIFY_TOKEN: ${config.APIFY_TOKEN ? '✓ configurado' : '✗ não configurado'}`);
  console.log(`  - GEMINI_TOKENS: ${config.GEMINI_TOKENS?.length || 0} chave(s)`);
  console.log(`  - Last Updated: ${config.lastUpdated || 'nunca'}\n`);

  if (!config.APIFY_TOKEN || config.APIFY_TOKEN === 'YOUR_API_TOKEN_HERE') {
    console.log('⚠️  ATENÇÃO: Token Apify não está configurado!');
    console.log('   O scraper Apify não funcionará sem o token.\n');
  }

  if (!fs.existsSync(municipalitiesPath)) {
    console.error('❌ municipalities.json não encontrado');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf8'));
  const municipalities = data.regions.flatMap(r => r.municipalities);

  console.log('📍 Dados dos municípios:');
  console.log(`  - Regiões: ${data.regions.length}`);
  console.log(`  - Municípios: ${municipalities.length}`);
  console.log(`  - Queries: ${data.centroCulturalQueries?.length || data.searchQueries?.length || 0}\n`);

  console.log('🔍 Queries de Centro Cultural:');
  const queries = data.centroCulturalQueries || data.searchQueries || [];
  queries.slice(0, 5).forEach(q => console.log(`  - ${q}`));
  if (queries.length > 5) console.log(`  ... e mais ${queries.length - 5}`);

  console.log('\n📊 Cálculo de scrapes:');
  console.log(`  - Municipalities: ${municipalities.length}`);
  console.log(`  - Queries por município: ${queries.length}`);
  console.log(`  - Total de buscas: ${municipalities.length * queries.length}`);

  console.log('\n✅ Verificação completa');
}

main().catch(console.error);