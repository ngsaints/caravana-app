import Apify from 'apify';
import * as cheerio from 'cheerio';
import { createObjectCsvWriter } from 'csv-writer';

const { sleep, log } = Apify.utils;

const CSV_WRITER = createObjectCsvWriter({
    path: './output/cultural_entities.csv',
    header: [
        { id: 'name', title: 'Nome' },
        { id: 'type', title: 'Tipo' },
        { id: 'category', title: 'Categoria' },
        { id: 'municipality', title: 'Município' },
        { id: 'region', title: 'Região' },
        { id: 'address', title: 'Endereço' },
        { id: 'phone', title: 'Telefone' },
        { id: 'email', title: 'Email' },
        { id: 'website', title: 'Website' },
        { id: 'source', title: 'Fonte' },
        { id: 'found_date', title: 'Data de Descoberta' }
    ],
    append: true
});

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

const TIPO_MAP = {
    'rádio': 'radio_comunitaria',
    'radio': 'radio_comunitaria',
    'community radio': 'radio_comunitaria',
    'associação': 'associacao_cultural',
    'association': 'associacao_cultural',
    'ponto de cultura': 'ponto_cultura',
    'ponto de memória': 'ponto_cultura',
    'cultura': 'ponto_cultura',
    'cineclube': 'cineclube',
    'film club': 'cineclube',
    'artista': 'artista_coletivo',
    'coletivo': 'artista_coletivo',
    'artist': 'artista_coletivo',
    'collective': 'artista_coletivo'
};

function getType(text) {
    const lower = text.toLowerCase();
    for (const [key, value] of Object.entries(TIPO_MAP)) {
        if (lower.includes(key)) return value;
    }
    return 'associacao_cultural';
}

function getRegion(municipality) {
    return REGIOES_ES[municipality] || 'Desconhecida';
}

async function saveToCSV(records) {
    try {
        await CSV_WRITER.writeRecords(records);
        log.info(`Salvo ${records.length} registros`);
    } catch (e) {
        log.error(`Erro ao salvar CSV: ${e.message}`);
    }
}

async function scrapeMincPontosDeCultura(requestQueue) {
    log.info('Scrapping Pontos de Cultura do MinC...');

    const sources = [
        'https://www.gov.br/mincerpt/pt-br/assuntos/cultura/pontos-de-cultura',
        'https://www.cultura.gov.br/acoes-e-programas/pontos-de-cultura'
    ];

    for (const url of sources) {
        try {
            const response = await Apify.call('url-to-text', { url });
            const $ = cheerio.load(response.data?.text || '');

            $('table, li, div').each((_, el) => {
                const text = $(el).text();
                if (text.includes('Espírito Santo') || text.includes('ES')) {
                    const name = $(el).find('a, strong, h3, h4').first().text().trim();
                    if (name && name.length > 3) {
                        requestQueue.addRequest({
                            url: url,
                            userData: {
                                name,
                                type: 'ponto_cultura',
                                source: 'MinC - Pontos de Cultura'
                            }
                        });
                    }
                }
            });
        } catch (e) {
            log.error(`Erro ao acessar ${url}: ${e.message}`);
        }
    }
}

async function scrapeAnatelRadios(requestQueue) {
    log.info('Scrapping Rádios Comunitárias da ANATEL...');

    const url = 'https://sistemas.anatel.gov.br/sacp/faces/oracle/webcenter/containerservice/RadioComunitariasList.xhtml';

    try {
        const response = await Apify.call('url-to-text', { url });
        const $ = cheerio.load(response.data?.text || '');

        $('table tbody tr, .radio-item').each((_, row) => {
            const cells = $(row).find('td');
            if (cells.length >= 3) {
                const name = $(cells[0]).text().trim();
                const municipality = $(cells[1]).text().trim();
                const freq = $(cells[2]).text().trim();

                if (name && municipality) {
                    requestQueue.addRequest({
                        url,
                        userData: {
                            name: `Rádio ${name}`,
                            type: 'radio_comunitaria',
                            category: municipality.includes('Educativa') ? 'Educação' : 'Entretenimento',
                            municipality: municipality.replace(/[^a-zA-Záéíóúâêîôûãõàèìòùäëïöü\s]/g, '').trim(),
                            source: 'ANATEL'
                        }
                    });
                }
            }
        });
    } catch (e) {
        log.error(`Erro ao acessar ANATEL: ${e.message}`);
    }
}

async function scrapeSECULT(requestQueue) {
    log.info('Scrapping SECULT ES...');

    const url = 'https://secult.es.gov.br';

    try {
        const response = await Apify.call('url-to-text', { url });
        const $ = cheerio.load(response.data?.text || '');

        const entities = [];

        $('a[href*="cultura"], a[href*="associacao"], a[href*="radio"], a[href*="cine"]').each((_, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();

            if (href && text && text.length > 3 && !href.startsWith('#')) {
                entities.push({
                    url: href.startsWith('http') ? href : `${url}${href}`,
                    userData: {
                        name: text,
                        type: getType(text),
                        source: 'SECULT ES'
                    }
                });
            }
        });

        for (const entity of entities.slice(0, 50)) {
            requestQueue.addRequest(entity);
        }
    } catch (e) {
        log.error(`Erro ao acessar SECULT: ${e.message}`);
    }
}

async function scrapeWikipedia(requestQueue) {
    log.info('Scrapping Wikipedia para lista de rádios e associações...');

    const pages = [
        { url: 'https://pt.wikipedia.org/wiki/Lista_de_r%C3%A1dios_comunit%C3%A1rias_do_Brasil', type: 'radio_comunitaria' },
        { url: 'https://pt.wikipedia.org/wiki/Cultura_do_Esp%C3%ADrito_Santo', type: 'associacao_cultural' }
    ];

    for (const page of pages) {
        try {
            const response = await Apify.call('url-to-text', { url: page.url });
            const $ = cheerio.load(response.data?.text || '');

            $('table tbody tr').each((_, row) => {
                const cells = $(row).find('td');
                if (cells.length >= 2) {
                    const name = $(cells[0]).text().trim();
                    const location = $(cells[1]).text().trim();

                    if (name && (location.includes('Espírito Santo') || location.includes('ES'))) {
                        let municipality = location.replace('Espírito Santo', '').replace('ES', '').trim();

                        for (const city of Object.keys(REGIOES_ES)) {
                            if (location.includes(city)) {
                                municipality = city;
                                break;
                            }
                        }

                        requestQueue.addRequest({
                            url: page.url,
                            userData: {
                                name,
                                type: page.type,
                                municipality,
                                region: getRegion(municipality),
                                source: 'Wikipedia'
                            }
                        });
                    }
                }
            });
        } catch (e) {
            log.error(`Erro ao acessar Wikipedia: ${e.message}`);
        }
    }
}

async function scrapeGoogleMaps(requestQueue) {
    log.info('Scrapping Google Maps para organizações culturais no ES...');

    const searchQueries = [
        'associação cultural Espírito Santo',
        'rádio comunitária Espírito Santo',
        'ponto de cultura Espírito Santo',
        'cineclube Espírito Santo',
        'coletivo artístico Espírito Santo'
    ];

    for (const query of searchQueries) {
        try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + ' ES')}&hl=pt-BR`;

            const response = await Apify.call('url-to-text', {
                url: searchUrl,
                headers: {
                    'Accept-Language': 'pt-BR,pt;q=0.9'
                }
            });

            const $ = cheerio.load(response.data?.text || '');

            $('div.g, div[data-ved]').each((_, el) => {
                const nameEl = $(el).find('h3, [role="heading"]').first();
                const name = nameEl.text().trim();

                if (name && name.length > 2) {
                    requestQueue.addRequest({
                        url: searchUrl,
                        userData: {
                            name,
                            type: getType(query),
                            source: 'Google',
                            searchQuery: query
                        }
                    });
                }
            });
        } catch (e) {
            log.error(`Erro ao buscar no Google: ${e.message}`);
        }

        await sleep(2000);
    }
}

async function handlePage(pageData) {
    const { request, response, body } = pageData;
    const { userData } = request;

    const record = {
        name: userData.name || '',
        type: userData.type || 'associacao_cultural',
        category: userData.category || '',
        municipality: userData.municipality || '',
        region: userData.region || getRegion(userData.municipality),
        address: '',
        phone: '',
        email: '',
        website: '',
        source: userData.source || 'Unknown',
        found_date: new Date().toISOString().split('T')[0]
    };

    if (response?.headers?.['content-type']?.includes('text/html')) {
        const $ = cheerio.load(body?.toString() || '');

        const addressText = $('[class*="address"], [class*="endereço"], [itemprop="address"]').first().text().trim();
        if (addressText) record.address = addressText;

        const phoneText = $('[class*="phone"], [class*="telefone"], [itemprop="telephone"]').first().text().trim();
        if (phoneText) record.phone = phoneText;

        const emailText = $('[class*="email"], [itemprop="email"], a[href^="mailto:"]').first().text().trim();
        if (emailText) record.email = emailText;

        const websiteText = $('a[href^="http"]:not([href*="google"]):not([href*="facebook"])').first().attr('href');
        if (websiteText) record.website = websiteText;
    }

    log.info(`Processado: ${record.name} (${record.type})`);
    return record;
}

Apify.main(async () => {
    log.info('=== Caravana da Cultura Scraper ===');
    log.info('Iniciando coleta de dados...');

    const fs = await import('fs');
    if (!fs.existsSync('./output')) {
        fs.mkdirSync('./output', { recursive: true });
    }

    const requestQueue = await Apify.createRequestQueue();
    const records = [];

    await Promise.all([
        scrapeSECULT(requestQueue),
        scrapeWikipedia(requestQueue),
        scrapeGoogleMaps(requestQueue)
    ]);

    log.info(`Total de URLs na fila: ${await requestQueue.getLength()}`);

    const crawler = new Apify.CheerioCrawler({
        requestQueue,
        maxConcurrency: 5,
        maxRequestRetries: 2,

        async handlePage(pageData) {
            try {
                const record = await handlePage(pageData);
                if (record.name) {
                    records.push(record);
                }
            } catch (e) {
                log.error(`Erro ao processar página: ${e.message}`);
            }
        },

        async handleFailedRequest({ request, error }) {
            log.error(`Falha ao acessar ${request.url}: ${error.message}`);
        }
    });

    await crawler.run();

    if (records.length > 0) {
        await saveToCSV(records);
        log.info(`\n=== Результат ===`);
        log.info(`Total de registros coletados: ${records.length}`);
        log.info(`Arquivo CSV: ./output/cultural_entities.csv`);
    } else {
        log.info('Nenhum registro coletado');
    }

    log.info('Scraping завершен!');
});

export { getRegion, getType, REGIOES_ES };
