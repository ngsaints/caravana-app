# Caravana da Cultura - Espírito Santo

Mapa interativo das organizações culturais do estado do Espírito Santo.

## 🎯 Visão Geral

Plataforma web para mapear, catalogar e visualizar entidades culturais do Espírito Santo, incluindo:
- 🎭 Associações Culturais
- 📻 Rádios Comunitárias  
- 🎨 Pontos de Cultura
- 🎬 Cineclubes
- 🎪 Artistas e Coletivos

## 🚀 Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Express.js + Prisma ORM
- **Banco de Dados:** SQLite
- **Mapas:** Leaflet + React-Leaflet
- **Scraping:** Apify + Gemini AI

## ⚡ Quick Start

```bash
cd caravana-app
npm install
npm run db:push    # Criar banco de dados
npm run seed       # Popular com dados iniciais
npm run server     # Iniciar backend (porta 3002)
npm run dev        # Iniciar frontend (porta 5173)
```

Acesse: **http://localhost:5173**

## 📝 Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Frontend dev server (Vite) |
| `npm run build` | Build de produção |
| `npm run server` | Backend API (porta 3002) |
| `npm run server:dev` | Backend com hot reload |
| `npm run seed` | Popular banco com dados |
| `npm run db:push` | Sincronizar schema com DB |
| `npm run db:studio` | Abrir Prisma Studio |

## 🗺️ API Endpoints

### Entidades

- `GET /api/entities` - Listar entidades (com filtros)
- `GET /api/entities/:id` - Buscar entidade por ID
- `POST /api/entities` - Criar entidade
- `DELETE /api/entities/:id` - Deletar entidade
- `GET /api/entities/export` - Exportar CSV

### Estatísticas

- `GET /api/stats` - Estatísticas gerais
- `GET /api/municipalities` - Listar municípios

### Scraper (Admin)

- `GET /api/scraper/status` - Status da configuração
- `POST /api/scraper/configure` - Configurar tokens
- `POST /api/scraper/run-apify` - Executar scraper Apify
- `POST /api/scraper/run-gemini` - Executar scraper Gemini
- `POST /api/scraper/enrich` - Enriquecer dados com IA

### Filtros para /api/entities

```
?type=associacao_cultural
&category=Música
&municipality=Vitória
&region=Grande Vitória
&search=nome
&status=active
```

## 🗄️ Modelo de Dados

### Entity

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador |
| name | String | Nome da entidade |
| type | String | Tipo (radio_comunitaria, associacao_cultural, ponto_cultura, cineclube, artista_coletivo) |
| category | String | Categoria específica |
| municipality | String | Município |
| region | String | Região |
| lat/lng | Float | Coordenadas |
| address | String? | Endereço |
| phone | String? | Telefone |
| email | String? | Email |
| website | String? | Website |
| socialMedia | String? | Redes sociais |
| description | String? | Descrição |
| services | String? | Serviços oferecidos |
| foundedYear | Int? | Ano de fundação |
| status | String | active/inactive/pending |

## 🎨 Tipos de Entidades

1. **Rádio Comunitária** 🔴 - Rádios educativas e comunitárias
2. **Associação Cultural** 🟣 - Grupos de dança, teatro, música, etc.
3. **Ponto de Cultura** 🟢 - Equipamentos culturais via Lei Rouanet
4. **Cineclube** 🟠 - Grupos de cinema
5. **Artista/Coletivo** 🔵 - Artistas individuais ou coletivos

## 🗺️ Regiões do ES

- **Grande Vitória** - Vitória, Vila Velha, Serra, Cariacica, Fundão, Guarapari
- **Norte do ES** - São Mateus, Linhares, Aracruz, etc.
- **Sul do ES** - Cachoeiro de Itapemirim, Marataízes, etc.
- **Central** - Colatina, Nova Venécia, etc.
- **Serrana** - Domingos Martins, Alegre, Castelo, etc.

## 📁 Estrutura do Projeto

```
caravana-app/
├── src/
│   ├── components/      # Componentes React
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── FilterSection.tsx
│   │   ├── AssociationsTable.tsx
│   │   ├── EntityForm.tsx
│   │   ├── AdminPanel.tsx
│   │   └── LoginPage.tsx
│   ├── hooks/
│   │   └── useApi.ts            # Hooks para API
│   ├── server/                  # Backend Express
│   │   ├── index.ts             # API routes
│   │   ├── db.ts                # Prisma client
│   │   └── seed.ts              # Seed data
│   ├── styles/
│   │   └── App.css
│   └── types/
├── prisma/
│   ├── schema.prisma            # Schema do banco
│   └── dev.db                   # SQLite database
├── docs/
│   ├── SCRAPER_SETUP.md         # Guia de configuração do scraper
│   └── plano-coleta-dados.md
└── .env.example                 # Exemplo de variáveis de ambiente
```

## 🤖 Scraper Automático

O projeto inclui scrapers para coletar dados automaticamente:

### Apify (Recomendado)
- ✅ Alta precisão
- ✅ Dados completos do Google Maps
- 💰 $5 grátis/mês (~500-1000 lugares)

### Gemini AI
- ✅ Gratuito (1500 req/dia)
- ✅ Enriquecimento de dados
- ⚠️ Menos preciso

**Documentação completa:** [docs/SCRAPER_SETUP.md](docs/SCRAPER_SETUP.md)

## 🔐 Painel Admin

Acesse: `http://localhost:5173/#/admin`  
Senha padrão: `caravana2024`

Funcionalidades:
- ✅ Aprovar/rejeitar entidades pendentes
- 🗑️ Deletar entidades
- 🤖 Executar scrapers automáticos
- 📥 Exportar dados em CSV
- ⚙️ Configurar tokens de API

## 🌍 Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
# API Base URL
VITE_API_URL=http://localhost:3002/api
```

Para produção, deixe vazio ou configure o IP do servidor.

## 🚀 Deploy

### Backend (Systemd)

```ini
[Unit]
Description=Caravana API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/path/to/caravana-app
ExecStart=/usr/bin/node src/server/index.ts
Restart=always

[Install]
WantedBy=multi-user.target
```

### Frontend (Build)

```bash
npm run build
# Arquivos em dist/ prontos para deploy
```

## 📊 Funcionalidades

### Mapa Interativo
- 🗺️ Visualização de todas as entidades
- 📍 Marcadores coloridos por tipo
- 🔍 Zoom e navegação
- 🛰️ Modo satélite
- 📋 Popup com detalhes completos

### Filtros Avançados
- 🔍 Busca por nome
- 📂 Filtro por tipo
- 🏷️ Filtro por categoria
- 📍 Filtro por município
- 🗺️ Filtro por região

### Cadastro Público
- ➕ Formulário de cadastro
- ✅ Validação de dados
- 📍 Seleção de coordenadas no mapa
- ⏳ Status pendente até aprovação

### Painel Administrativo
- 👁️ Visualizar entidades pendentes
- ✅ Aprovar/rejeitar cadastros
- 🗑️ Deletar entidades
- 🤖 Executar scrapers
- 📥 Exportar dados

## 🧪 Testes

```bash
# Testar API
curl http://localhost:3002/api/health

# Testar entidades
curl http://localhost:3002/api/entities?status=active

# Testar estatísticas
curl http://localhost:3002/api/stats
```

## 📄 Licença

MIT

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:
- 📧 Email: suporte@caravanacultura.es.gov.br
- 🐛 Issues: [GitHub Issues](https://github.com/ngsaints/caravana-app/issues)

---

Desenvolvido com ❤️ para a cultura capixaba
