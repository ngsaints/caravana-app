#!/usr/bin/env node

import https from 'https';
import http from 'http';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const OUTPUT_DIR = './output';
const OUTPUT_FILE = `${OUTPUT_DIR}/cultural_entities.csv`;

const REGIOES_ES = {
    'Vitória': 'Grande Vitória',
    'Vila Velha': 'Grande Vitória',
    'Serra': 'Grande Vitória',
    'Cariacica': 'Grande Vitória',
    'Fundão': 'Grande Vitória',
    'Guarapari': 'Grande Vitória',
    'São Mateus': 'Norte do ES',
    'Linhares': 'Norte do ES',
    'Aracruz': 'Norte do ES',
    'Conceição da Barra': 'Norte do ES',
    'Jaguaré': 'Norte do ES',
    'Pinheiros': 'Norte do ES',
    'Cachoeiro de Itapemirim': 'Sul do ES',
    'Marataízes': 'Sul do ES',
    'Anchieta': 'Sul do ES',
    'Presidente Kennedy': 'Sul do ES',
    'Jerônimo Monteiro': 'Sul do ES',
    'Colatina': 'Central',
    'Nova Venécia': 'Central',
    'São Gabriel da Palha': 'Central',
    'Domingos Martins': 'Serrana',
    'Santa Leopoldina': 'Serrana',
    'Itarana': 'Serrana',
    'Venda Nova do Imigrante': 'Serrana',
    'Mantenópolis': 'Serrana',
    'Castelo': 'Serrana',
    'Alegre': 'Serrana'
};

function getRegion(municipality) {
    return REGIOES_ES[municipality] || 'Desconhecida';
}

function getType(text) {
    const lower = text.toLowerCase();
    if (lower.includes('rádio') || lower.includes('radio')) return 'radio_comunitaria';
    if (lower.includes('ponto de cultura') || lower.includes('ponto de memória')) return 'ponto_cultura';
    if (lower.includes('cineclube') || lower.includes('cine')) return 'cineclube';
    if (lower.includes('artista') || lower.includes('coletivo')) return 'artista_coletivo';
    return 'associacao_cultural';
}

function escapeCSV(str) {
    if (!str) return '';
    const escaped = String(str).replace(/"/g, '""');
    return escaped.includes(',') || escaped.includes('\n') ? `"${escaped}"` : escaped;
}

function saveCSV(records) {
    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const header = 'Nome,Tipo,Categoria,Município,Região,Endereço,Telefone,Email,Website,Fonte\n';
    const rows = records.map(r => [
        escapeCSV(r.name),
        escapeCSV(r.type),
        escapeCSV(r.category),
        escapeCSV(r.municipality),
        escapeCSV(r.region),
        escapeCSV(r.address),
        escapeCSV(r.phone),
        escapeCSV(r.email),
        escapeCSV(r.website),
        escapeCSV(r.source)
    ].join(',')).join('\n');

    writeFileSync(OUTPUT_FILE, header + rows);
    console.log(`Salvo ${records.length} registros em ${OUTPUT_FILE}`);
}

async function fetch(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'pt-BR,pt;q=0.9'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

async function scrapeWikipedia() {
    console.log('Buscando no Wikipedia...');
    const records = [];

    const pages = [
        {
            url: 'https://pt.wikipedia.org/wiki/Lista_de_r%C3%A1dios_comunit%C3%A1rias_do_Brasil',
            type: 'radio_comunitaria'
        },
        {
            url: 'https://pt.wikipedia.org/wiki/Cultura_do_Esp%C3%ADrito_Santo',
            type: 'associacao_cultural'
        }
    ];

    for (const page of pages) {
        try {
            console.log(`  Acessando ${page.url}...`);
            const html = await fetch(page.url);

            const radioRegex = /Rádio[^<]{0,200}/gi;
            const matches = html.match(radioRegex) || [];

            for (const match of matches.slice(0, 30)) {
                const nameMatch = match.match(/Rádio[^,.\n]+/);
                if (nameMatch) {
                    let name = nameMatch[0].trim();
                    if (name.length > 5) {
                        records.push({
                            name: name.substring(0, 100),
                            type: page.type,
                            category: '',
                            municipality: 'Espírito Santo',
                            region: 'ES',
                            address: '',
                            phone: '',
                            email: '',
                            website: '',
                            source: 'Wikipedia'
                        });
                    }
                }
            }
        } catch (e) {
            console.log(`  Erro: ${e.message}`);
        }
    }

    return records;
}

async function scrapeSECULT() {
    console.log('Buscando na SECULT ES...');
    const records = [];

    try {
        const html = await fetch('https://secult.es.gov.br/tdah/cultura');
        console.log('  SECULT: ' + html.length + ' bytes');
    } catch (e) {
        console.log(`  Erro: ${e.message}`);
    }

    return records;
}

async function main() {
    console.log('=== Caravana da Cultura - Scraper ===\n');

    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const allRecords = [];

    console.log('Iniciando scraping...\n');

    const wikiRecords = await scrapeWikipedia();
    allRecords.push(...wikiRecords);
    console.log('');

    const secultRecords = await scrapeSECULT();
    allRecords.push(...secultRecords);
    console.log('');

    console.log(`Total coletado: ${allRecords.length} registros`);

    if (allRecords.length > 0) {
        saveCSV(allRecords);
        console.log('\nScraping concluído!');
    } else {
        console.log('\nNenhum dado coletado. Verifique sua conexão.');
    }
}

main().catch(console.error);
