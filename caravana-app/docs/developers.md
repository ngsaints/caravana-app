# Caravana da Cultura - Documentação para Devs e IAs

## Visão Geral

Este projeto é uma aplicação React/TypeScript que exibe um mapa interativo de associações culturais do estado do Espírito Santo. O frontend utiliza **Vite**, **React**, **TypeScript** e **Leaflet** para mapeamento.

## Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Mapeamento**: Leaflet + react-leaflet
- **Styling**: CSS puro com variáveis CSS (design system personalizado)
- **Fonts**: Google Fonts (Inter, Playfair Display)

## Estrutura do Projeto

```
caravana-app/
├── src/
│   ├── components/     # Componentes React reutilizáveis
│   │   ├── Header.tsx
│   │   ├── FilterSection.tsx
│   │   ├── AssociationsTable.tsx
│   │   └── Footer.tsx
│   ├── data/           # Dados estáticos e tipos
│   │   └── municipalities.ts
│   ├── types/          # Definições TypeScript
│   │   └── index.ts
│   ├── styles/         # CSS global
│   │   └── App.css
│   ├── App.tsx         # Componente principal
│   └── main.tsx        # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Comandos

### Desenvolvimento
```bash
cd caravana-app
npm install
npm run dev
```

### Build para Produção
```bash
npm run build
```
Output em `dist/`

### Preview do Build
```bash
npm run preview
```

## Variáveis de Ambiente

Este projeto não requer variáveis de ambiente no momento.

## API e Dados

Os dados são **estáticos** (mockados) em `src/data/municipalities.ts`. Para integrar uma API real:
1. Adicione um serviço em `src/services/`
2. Use `useEffect` + `useState` para buscar dados
3. Atualize o componente `AssociationsTable`

## Deploy com Systemd

Consulte `docs/systemd-deployment.md` para instruções completas de deploy com systemd e nginx.

## Notas para IAs

- Ao fazer modificações, mantenha a consistência com o design system (variáveis CSS em `App.css`)
- Para adicionar novos municípios, edite `src/data/municipalities.ts`
- Para adicionar filtros, edite `src/components/FilterSection.tsx`
- Leaflet é carregado via CDN no CSS, não precisa de configuração extra