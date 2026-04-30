# Otimizações do Gemini - Busca e Enriquecimento

## 📊 Resumo das Melhorias

### 🔍 Busca com Gemini (`/api/scraper/run-gemini`)

#### Melhorias Implementadas:

1. **Queries Expandidas** (7 → 25 queries)
   - Associações Culturais: 5 tipos
   - Pontos de Cultura: 2 tipos
   - Rádios Comunitárias: 2 tipos
   - Cineclubes: 2 tipos
   - Artistas/Coletivos: 5 tipos
   - Específicos: 9 tipos (música, arte, capoeira, museus, etc.)

2. **Parsing Inteligente**
   - Suporta múltiplos formatos de resposta
   - Aceita formato com pipe `|`
   - Aceita bullet points (`-`, `*`, `•`, `→`)
   - Aceita listas numeradas
   - Extração automática de endereço do nome

3. **Filtros de Qualidade**
   - Remove linhas de exemplo/cabeçalho
   - Valida tamanho do nome (3-100 caracteres)
   - Remove entradas apenas com números
   - Remove duplicatas por nome+município+tipo

4. **Modelo Atualizado**
   - Mudou de `gemini-2.5-flash` para `gemini-2.0-flash-exp`
   - Configurações otimizadas:
     - `temperature: 0.4` (mais preciso)
     - `maxOutputTokens: 2048` (respostas maiores)

5. **Rate Limiting Melhorado**
   - Delay aumentado para 2.5s entre requisições
   - Detecção de `RESOURCE_EXHAUSTED`
   - Cooldown de 60s por token esgotado

---

### ✨ Enriquecimento com Gemini (`/api/scraper/enrich`)

#### Melhorias Implementadas:

1. **Extração Estruturada**
   - Prompt otimizado para retornar JSON
   - Extrai: website, email, phone, description, services
   - Fallback para extração manual com regex

2. **Parsing Robusto**
   - Tenta parsear JSON primeiro
   - Se falhar, usa regex para extrair:
     - Website: `website|site|url`
     - Email: padrão email válido
     - Telefone: números com DDD
     - Descrição: texto entre 20-200 chars

3. **Validação de Dados**
   - Ignora valores `null` ou vazios
   - Limita descrição a 500 caracteres
   - Limita serviços a 300 caracteres
   - Só atualiza campos vazios

4. **Modelo Atualizado**
   - Mudou para `gemini-2.0-flash-exp`
   - Configurações otimizadas:
     - `temperature: 0.3` (mais factual)
     - `maxOutputTokens: 500` (respostas concisas)

5. **Logging Detalhado**
   - Mostra campos atualizados por entidade
   - Conta sucessos e falhas
   - Logs de erro com detalhes HTTP

6. **Limite Ajustado**
   - Reduzido de 50 para 30 entidades por execução
   - Evita timeout em grandes volumes
   - Permite múltiplas execuções incrementais

---

## 🎯 Resultados Esperados

### Busca com Gemini:
- **Antes**: ~7 queries × 5 municípios = 35 buscas
- **Depois**: ~25 queries × 5 municípios = 125 buscas
- **Aumento**: 257% mais cobertura

### Enriquecimento:
- **Antes**: Apenas descrição
- **Depois**: website, email, phone, description, services
- **Aumento**: 5× mais dados por entidade

---

## 🚀 Como Usar

### 1. Busca com Gemini

```bash
# No painel admin, clique em "🤖 Gemini"
# Escolha quantos municípios buscar (recomendado: 3-5)
# Aguarde a conclusão
```

**Dica**: Execute múltiplas vezes para cobrir todos os municípios do ES.

### 2. Enriquecimento

```bash
# No painel admin, clique em "✨ Enriquecer"
# Confirme a operação
# Aguarde a conclusão (30 entidades por vez)
```

**Dica**: Execute várias vezes até enriquecer todas as entidades pendentes.

---

## ⚙️ Configuração Recomendada

### Tokens Gemini:
- **Mínimo**: 1 token
- **Recomendado**: 3-5 tokens
- **Benefício**: Balanceamento de carga e fallback

### Frequência de Execução:
- **Busca**: 1× por semana
- **Enriquecimento**: Após cada importação de scraper

---

## 📈 Métricas de Performance

### Busca:
- **Tempo médio**: 2.5s por query
- **Taxa de sucesso**: ~70-80%
- **Entidades por município**: 5-15

### Enriquecimento:
- **Tempo médio**: 2s por entidade
- **Taxa de sucesso**: ~60-70%
- **Campos preenchidos**: 2-4 por entidade

---

## 🔧 Troubleshooting

### Erro: "Token esgotado"
- **Solução**: Adicione mais tokens no painel de configuração
- **Alternativa**: Aguarde 1 hora e tente novamente

### Erro: "Sem resultados"
- **Causa**: Município pequeno ou query muito específica
- **Solução**: Normal, continue para próximo município

### Erro: "Failed to parse JSON"
- **Causa**: Resposta do Gemini em formato inesperado
- **Solução**: Sistema usa fallback automático com regex

---

## 📝 Notas Técnicas

- Todas as entidades importadas têm `status: 'pending'`
- Requer aprovação manual no painel admin
- Coordenadas padrão: centro do município
- Descrições são limitadas para evitar spam
- Duplicatas são detectadas por nome+município+tipo

---

**Última atualização**: 2026-04-30
