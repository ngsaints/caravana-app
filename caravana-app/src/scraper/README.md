# Scraper - Caravana da Cultura ES

Scraper para coletar dados de organizações culturais no Espírito Santo usando Apify.

## Fontes

- **SECULT ES** - Secretaria de Cultura do Espírito Santo
- **MinC** - Ministério da Cultura (Pontos de Cultura)
- **ANATEL** - Rádios Comunitárias
- **Wikipedia** - Listas de rádios e associações
- **Google Maps** - Busca por organizações culturais

## Instalação

```bash
cd scraper
npm install
```

## Configuração

1. Crie uma conta em [Apify](https://apify.com)
2. Obtenha seu API token em https://console.apify.com/settings
3. Configure a variável de ambiente:
```bash
export APIFY_TOKEN="seu_token_aqui"
```

## Execução

```bash
npm start
```

## Saída

Os dados serão salvos em `output/cultural_entities.csv` com as colunas:

| Campo | Descrição |
|-------|-----------|
| Nome | Nome da organização |
| Tipo | radio_comunitaria, associacao_cultural, ponto_cultura, cineclube, artista_coletivo |
| Categoria | Categoria específica |
| Município | Município do ES |
| Região | Região do ES |
| Endereço | Endereço completo |
| Telefone | Telefone de contato |
| Email | E-mail |
| Website | Site da organização |
| Fonte | Origem dos dados |
| Data de Descoberta | Data da coleta |

## Estrutura dos Tipos

```javascript
const TIPO_MAP = {
    'radio_comunitaria': 'Rádio Comunitária',
    'associacao_cultural': 'Associação Cultural',
    'ponto_cultura': 'Ponto de Cultura',
    'cineclube': 'Cineclube',
    'artista_coletivo': 'Artista/Coletivo'
};
```

## Região do ES

```javascript
const REGIOES_ES = {
    'Grande Vitória': ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Fundão', 'Guarapari'],
    'Norte do ES': ['São Mateus', 'Linhares', 'Aracruz', 'Conceição da Barra', 'Jaguaré', 'Pinheiros'],
    'Sul do ES': ['Cachoeiro de Itapemirim', 'Marataízes', 'Anchieta', 'Presidente Kennedy'],
    'Central': ['Colatina', 'Nova Venécia', 'São Gabriel da Palha'],
    'Serrana': ['Domingos Martins', 'Santa Leopoldina', 'Itarana', 'Venda Nova do Imigrante', 'Mantenópolis', 'Castelo', 'Alegre']
};
```

## Deploy no Apify

1. Faça upload da pasta `scraper` para o Apify
2. Configure o input JSON:
```json
{
    "maxConcurrency": 5,
    "maxRequestRetries": 2
}
```
3. Execute o actor

## Limites

- O scraping pode ser limitado por rate limiting
- Alguns sites podem bloquear bots
- Dados podem precisar de validação manual após coleta
