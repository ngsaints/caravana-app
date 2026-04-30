# Caravana da Cultura - Espírito Santo

Mapa interativo das organizações culturais do estado do Espírito Santo.

## Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Express.js + Prisma ORM
- **Banco de Dados:** SQLite
- **Mapas:** Leaflet + React-Leaflet

## Quick Start

```bash
cd caravana-app
npm install
npm run db:push    # Criar banco de dados
npm run seed       # Popular com dados iniciais
npm run server     # Iniciar backend (porta 3002)
npm run dev        # Iniciar frontend (porta 5173)
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Frontend dev server |
| `npm run build` | Build de produção |
| `npm run server` | Backend API (porta 3002) |
| `npm run seed` | Popular banco com dados |
| `npm run db:push` | Sincronizar schema com DB |
| `npm run db:studio` | Abrir Prisma Studio |

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/entities` - Listar entidades (com filtros)
- `GET /api/entities/:id` - Buscar entidade por ID
- `POST /api/entities` - Criar entidade
- `GET /api/municipalities` - Listar municípios
- `GET /api/stats` - Estatísticas

### Filtros para /api/entities

```
?type=associacao_cultural
&category=Música
&municipality=Vitória
&region=Grande Vitória
&search=nome
&status=active
```

## Modelo de Dados

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

## Tipos de Entidades

1. **Rádio Comunitária** - Rádios educativas e comunitárias
2. **Associação Cultural** - Grupos de dança, teatro, música, etc.
3. **Ponto de Cultura** - Equipamentos culturais via Lei Rouanet
4. **Cineclube** - Grupos de cinema
5. **Artista/Coletivo** - Artistas individuais ou coletivos

## Regiões do ES

- Grande Vitória (Vitória, Vila Velha, Serra, Cariacica, Fundão, Guarapari)
- Norte do ES (São Mateus, Linhares, Aracruz, etc.)
- Sul do ES (Cachoeiro de Itapemirim, Marataízes, etc.)
- Central (Colatina, Nova Venécia, etc.)
- Serrana (Domingos Martins, Alegre, Castelo, etc.)

## Estrutura do Projeto

```
caravana-app/
├── src/
│   ├── components/      # Componentes React
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── FilterSection.tsx
│   │   ├── AssociationsTable.tsx
│   │   └── EntityForm.tsx      # Formulário de cadastro
│   ├── hooks/
│   │   └── useApi.ts            # Hooks para API
│   ├── server/                  # Backend Express
│   │   ├── index.ts             # API routes
│   │   └── db.ts                # Prisma client
│   ├── styles/
│   │   └── App.css
│   └── types/
├── prisma/
│   ├── schema.prisma            # Schema do banco
│   └── dev.db                   # SQLite database
└── docs/
    ├── plano-coleta-dados.md    # Plano de coleta
    └── ...
```

## Deploy

### Backend (Systemd)

```ini
[Unit]
Description=Caravana API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/path/to/caravana-app
ExecStart=/root/.nvm/versions/node/v24.15.0/bin/node src/server/index.ts
Restart=always

[Install]
WantedBy=multi-user.target
```

## Licença

MIT
