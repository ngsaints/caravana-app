# Plano de Ação - Coleta de Dados da Caravana da Cultura ES

## 1. Contexto

O projeto **Caravana da Cultura - Espírito Santo** possui agora uma infraestrutura completa de banco de dados georreferenciado com informações detalhadas sobre:
- Rádios Comunitárias
- Associações Culturais
- Pontos de Cultura e Memória
- Cineclubes
- Artistas e Coletivos

## 2. Infraestrutura Implementada

### Banco de Dados
- **SQLite** com **Prisma ORM**
- API REST completa (Express.js)
- Porta do servidor: **3002**

### Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check |
| GET | `/api/entities` | Lista entidades (com filtros) |
| GET | `/api/entities/:id` | Busca por ID |
| POST | `/api/entities` | Cria nova entidade |
| GET | `/api/municipalities` | Lista municípios |
| GET | `/api/stats` | Estatísticas |

### Dados Atuais
- **28 municípios** do ES cadastrados
- **25 entidades culturais** de exemplo
- 5 tipos de entidades
- 8+ categorias

## 3. Modelo de Dados

```typescript
interface Entity {
  id: string;
  name: string;
  type: 'radio_comunitaria' | 'associacao_cultural' |
        'ponto_cultura' | 'cineclube' | 'artista_coletivo';
  category: string;
  municipality: string;
  region: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: string;
  description?: string;
  services?: string;
  foundedYear?: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}
```

## 4. Categorias por Tipo

| Tipo | Categorias |
|------|------------|
| Rádio Comunitária | Educação, Entretenimento, Informação |
| Associação Cultural | Música, Dança, Teatro, Artes Visuais, Artesanato, Patrimônio Cultural, Literatura, Capoeira |
| Ponto de Cultura | Teatro, Dança, Música, Capoeira, Hip Hop, Cultura Popular, Patrimônio Cultural |
| Cineclube | Sessões Regulares, Festival, Ambulante |
| Artista/Coletivo | Música, Dança, Teatro, Performance, Artes Visuais, Audiovisual, Hip Hop, Grafite |

## 5. Fontes de Dados para Expansão

### Fontes Primárias (oficiais)
- [x] SECULT/ES - Secretaria de Cultura do Espírito Santo
- [x] MinC - Ministério da Cultura (Pontos de Cultura)
- [ ] ANATEL - Rádios Comunitárias licenciadas
- [ ] IBGE - Cidades e regiões

### Fontes Secundárias
- [ ] Sites das prefeituras municipais
- [ ] Redes sociais (Instagram, Facebook)
- [ ] Editais e convênios publicados
- [ ] Associações e federações culturais

## 6. Metodologia de Coleta

### Fase 1: Pesquisa Desktop (Semana 1-2)
1. Listar todas as entidades conhecidas via fontes secundárias
2. Compilar em planilha piloto
3. Validar existência e dados básicos

### Fase 2: Formulário de Cadastro (Semana 3)
1. Formulário web já implementado (`EntityForm.tsx`)
2. Divulgar via redes sociais e parceiros
3. Permitir auto-cadastro das entidades

### Fase 3: Validação e Verificação (Semana 4-6)
1. Contato direto por telefone/email
2. Verificação de dados geográficos
3. Complementação de informações faltantes

### Fase 4: Integração e Publicação (Semana 7-8)
1. Exportar dados para formato JSON
2. Integrar ao sistema
3. Publicar online

## 7. Como Adicionar Dados

### Via API (programático)
```bash
curl -X POST http://localhost:3002/api/entities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nova Associação",
    "type": "associacao_cultural",
    "category": "Música",
    "municipality": "Vitória",
    "region": "Grande Vitória",
    "lat": -20.3155,
    "lng": -40.3128
  }'
```

### Via Seed (bulk)
Editar `src/server/seed.ts` e rodar:
```bash
npm run seed
```

### Via Interface Web
1. Acessar `http://localhost:5173`
2. Clicar em "CADASTRE SUA ENTIDADE"
3. Preencher formulário

## 8. Responsabilidades

| Função | Responsável |
|--------|-------------|
| Coordenação Geral | Lyara Apostolico |
| Coleta de Dados | Equipe voluntária |
| Desenvolvimento | Equipe técnica |
| Validação | Parceiros locais |

## 9. Cronograma

| Semana | Atividade |
|--------|-----------|
| 1-2 | Pesquisa desktop e compilação inicial |
| 3 | Formulário de cadastro ativo |
| 4-5 | Coleta ativa e verificação |
| 6 | Tratamento e limpeza dos dados |
| 7-8 | Integração técnica e testes |
| 9 | Lançamento da base atualizada |

## 10. Próximos Passos Imediatos

1. [x] Infraestrutura técnica implementada
2. [x] 25 entidades de exemplo cadastradas
3. [ ] Definir equipe de coleta
4. [ ] Identificar parceiros institucionais (SECULT, CDL, SESC)
5. [ ] Validar dados existentes com responsáveis locais
6. [ ] Divulgar formulário de cadastramento

## 11. Comandos Úteis

```bash
# Popular banco com dados iniciais
npm run seed

# Ver estatísticas
curl http://localhost:3002/api/stats

# Listar entidades
curl http://localhost:3002/api/entities

# Listar municípios
curl http://localhost:3002/api/municipalities

# Filtrar por tipo
curl "http://localhost:3002/api/entities?type=radio_comunitaria"

# Filtrar por município
curl "http://localhost:3002/api/entities?municipality=Vitória"
```

---

*Documento criado em: 2026-04-29*
*Atualizado em: 2026-04-29*
*Projeto: Caravana da Cultura - Espírito Santo*
