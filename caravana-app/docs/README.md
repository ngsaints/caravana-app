# Documentação - Caravana da Cultura

## Índice

1. [Visão Geral](#visão-geral)
2. [Guia Rápido](#guia-rápido)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Configuração de Desenvolvimento](#configuração-de-desenvolvimento)
6. [Build e Deploy](#build-e-deploy)
7. [Notas para Agentes IA](#notas-para-agentes-ia)

---

## Visão Geral

**Caravana da Cultura** é uma aplicação React/TypeScript que exibe um mapa interativo de associações culturais do estado do Espírito Santo. O projeto é puramente frontend com dados estáticos (mockados).

**Status atual**: Produção no ar via systemd em `http://94.141.97.178:8080`

---

## Guia Rápido

```bash
# Development
cd caravana-app
npm install
npm run dev

# Build
npm run build

# Update production
sudo cp -r dist/* /var/www/caravana/
```

---

## Estrutura do Projeto

```
Projeto 08 - Maps/
├── caravana-app/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── Header.tsx
│   │   │   ├── FilterSection.tsx
│   │   │   ├── AssociationsTable.tsx
│   │   │   └── Footer.tsx
│   │   ├── data/             # Dados estáticos
│   │   │   └── municipalities.ts
│   │   ├── types/            # Definições TypeScript
│   │   │   └── index.ts
│   │   ├── styles/           # CSS global
│   │   │   └── App.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/              # Arquivos públicos (logo, favicon)
│   ├── docs/                # Documentação
│   ├── dist/                # Build de produção
│   └── package.json
├── docs/                    # Documentação raiz do projeto
│   ├── developers.md
│   ├── agents.md
│   └── systemd-deployment.md
└── refe.md                  # HTML original (referência)
```

---

## Stack Tecnológico

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18+ | UI framework |
| TypeScript | 5+ | Tipagem |
| Vite | 8+ | Build tool |
| Leaflet | 1.9+ | Mapas |
| react-leaflet | 4+ | React bindings para Leaflet |
| Python | 3.13 | Servidor HTTP (produção) |

---

## Configuração de Desenvolvimento

### 1. Instalar dependências

```bash
cd caravana-app
npm install
```

### 2. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

O servidor inicia em `http://localhost:5173`

### 3. Comandos disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build local |
| `npm run lint` | Linting (se configurado) |

---

## Build e Deploy

### Build de Produção

```bash
cd caravana-app
npm run build
```

Output em `dist/`

### Deploy em Produção (Systemd + Python HTTP Server)

O servidor atual está rodando em `http://94.141.97.178:8080` via systemd.

**Arquivo de serviço**: `/etc/systemd/system/caravana.service`

**Gerenciamento**:
```bash
# Status
sudo systemctl status caravana

# Iniciar/Parar/Reiniciar
sudo systemctl start caravana
sudo systemctl stop caravana
sudo systemctl restart caravana

# Logs
sudo journalctl -u caravana -f
```

### Atualizar Produção

```bash
# 1. Fazer build
cd caravana-app && npm run build

# 2. Copiar para produção
sudo cp -r dist/* /var/www/caravana/

# 3. Reiniciar serviço (se necessário)
sudo systemctl restart caravana
```

### Diretórios em Produção

| Caminho | Descrição |
|---------|-----------|
| `/var/www/caravana/` | Raiz do site (contém index.html, assets/) |
| `/var/log/caravana.log` | Logs do servidor Python |
| `/etc/systemd/system/caravana.service` | Unit file do systemd |

---

## Notas para Agentes IA

### Regras Gerais

1. **Antes de modificar código**, leia `docs/developers.md`
2. **Para deploy**, leia `docs/systemd-deployment.md`
3. **Sempre** execute `npm run build` antes de considerar pronto

### Design System

- Cores em `src/styles/App.css` (variáveis CSS)
- Paleta: Roxo (#3B2369, #5A3D8A), Verde (#0D5C4A, #1A7A63), Laranja (#E87A2E)
- Não use `!important`

### Estrutura de Componentes

- Localização: `src/components/`
- Nomes: PascalCase (ex: `FilterSection.tsx`)
- Props: interfaces definidas no arquivo ou em `src/types/`

### Dados

- Locação: `src/data/municipalities.ts`
- Tipos: `src/types/index.ts`
- Nunca hardcode - use os arquivos de dados

### Quando em Dúvida

- Mantenha simples
- Não adicione complexidade desnecessária
- Dados mockados são suficientes para protótipo