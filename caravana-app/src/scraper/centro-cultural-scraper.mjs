import { ApifyClient } from 'apify-client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRAPER_DIR = path.join('/root/Projeto 08 - Maps/scraper');
const configPath = path.join(SCRAPER_DIR, 'config.json');
const municipalitiesPath = path.join(SCRAPER_DIR, 'municipalities.json');

interface ScraperResult {
  name: string;
  type: string;
  category: string;
  municipality: string;
  region: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  website: string;
  source: string;
  scraped_at: string;
}

export async function runCentroCulturalScraper(options: {
  apifyToken?: string;
  maxMunicipalities?: number;
  onProgress?: (progress: { current: number; total: number; municipality: string; query: string }) => void;
} = {}): Promise<{ totalFound: number; imported: number; skipped: number; errors: string[] }> {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const apifyToken = options.apifyToken || config.APIFY_TOKEN;
  
  if (!apifyToken || apifyToken === 'YOUR_API_TOKEN_HERE') {
    throw new Error('Token Apify não configurado');
  }

  const municipalitiesData = JSON.parse(fs.readFileSync(municipalitiesPath, 'utf8'));
  
  const queries = [
    'centro cultural',
    'associação cultural',
    'espaço cultural',
    'centro comunitário',
    'casa de cultura'
  ];

  const client = new ApifyClient({ token: apifyToken });
  const allRecords: ScraperResult[] = [];
  const errors: string[] = [];

  const municipalities = municipalitiesData.regions
    .flatMap((r: any) => r.municipalities)
    .slice(0, options.maxMunicipalities || municipalitiesData.regions.flatMap((r: any) => r.municipalities).length);

  const totalSearches = municipalities.length * queries.length;
  let currentSearch = 0;

  for (const region of municipalitiesData.regions) {
    for (const mun of region.municipalities) {
      if (options.maxMunicipalities && municipalities.indexOf(mun) >= options.maxMunicipalities) break;

      for (const query of queries) {
        currentSearch++;
        
        if (options.onProgress) {
          options.onProgress({
            current: currentSearch,
            total: totalSearches,
            municipality: mun.name,
            query
          });
        }

        try {
          console.log(`[APIFY] ${currentSearch}/${totalSearches}: ${query} em ${mun.name}`);

          const input = {
            searchStringsArray: [`${query} ${mun.name} Espírito Santo`],
            locationQuery: `${mun.name}, Espírito Santo, Brazil`,
            maxCrawledPlacesPerSearch: 15,
            language: 'pt-BR',
            countryCode: 'BR',
            skipClosedPlaces: true,
            scrapePlaceDetailPage: true,
            scrapeReviewsPersonalData: false,
            maxReviews: 0,
            maxImages: 0
          };

          const run = await client.actor('nwua9Gu5YrADL7KDj').call(input);

          if (run.status === 'SUCCEEDED') {
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            
            for (const item of items as any[]) {
              const title = item.title || item.name || '';
              const address = item.address || item.fullAddress || item.streetAddress || '';
              
              if (title && title.length > 2) {
                allRecords.push({
                  name: title,
                  type: 'associacao_cultural',
                  category: 'Centro Cultural',
                  municipality: mun.name,
                  region: region.name,
                  lat: item.location?.lat || mun.lat,
                  lng: item.location?.lng || mun.lng,
                  address,
                  phone: item.phone || item.phoneUnformatted || '',
                  website: item.website || '',
                  source: 'Apify Google Maps Scraper - Centro Cultural',
                  scraped_at: new Date().toISOString()
                });
              }
            }
          }

          await new Promise(r => setTimeout(r, 3000));
        } catch (e: any) {
          console.error(`[APIFY] Erro: ${e.message}`);
          errors.push(`${query} em ${mun.name}: ${e.message}`);
        }
      }
    }
  }

  const unique = [];
  const seen = new Set();
  for (const r of allRecords) {
    const key = (r.name + r.municipality).toLowerCase().replace(/\s+/g, ' ').trim();
    if (!seen.has(key) && r.name && r.name.length > 2) {
      seen.add(key);
      unique.push(r);
    }
  }

  return {
    totalFound: unique.length,
    imported: 0,
    skipped: 0,
    errors
  };
}

export function getScraperConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return {
      configured: !!(config.APIFY_TOKEN && config.APIFY_TOKEN !== 'YOUR_API_TOKEN_HERE'),
      lastUpdated: config.lastUpdated || null
    };
  } catch {
    return { configured: false, lastUpdated: null };
  }
}

export function saveConfig(apifyToken: string, geminiTokens: string[] = []) {
  const config = {
    APIFY_TOKEN: apifyToken,
    GEMINI_TOKENS: geminiTokens,
    lastUpdated: new Date().toISOString()
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return config;
}