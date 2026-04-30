# 🤖 Configuração do Scraper - Caravana da Cultura

Este documento explica como configurar e usar os scrapers automáticos para coletar dados de organizações culturais.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Apify - Google Maps Scraper](#apify---google-maps-scraper)
3. [Gemini AI - Maps Enrichment](#gemini-ai---maps-enrichment)
4. [Como Usar](#como-usar)

---

## 🎯 Visão Geral

O projeto possui dois métodos de coleta automática de dados:

| Método | Fonte | Custo | Qualidade | Velocidade |
|--------|-------|-------|-----------|------------|
| **Apify** | Google Maps API | Pago ($) | Alta ⭐⭐⭐⭐⭐ | Rápida 🚀 |
| **Gemini AI** | Google Maps + IA | Grátis/Pago | Média ⭐⭐⭐ | Lenta 🐢 |

---

## 🗺️ Apify - Google Maps Scraper

### O que é?

O **Google Maps Scraper** da Apify extrai dados de negócios do Google Maps de forma automatizada e confiável.

### Actor ID

```
compass/crawler-google-places
```

### Como Obter Token

1. Acesse [Apify.com](https://apify.com)
2. Crie uma conta gratuita
3. Vá em **Settings** → **Integrations**
4. Copie seu **API Token**

### Plano Gratuito

- **$5 de crédito grátis** por mês
- Aproximadamente **500-1000 lugares** por mês
- Ideal para testar o sistema

### Dados Extraídos

✅ **Nome do local** (title)  
✅ **Endereço completo** (address)  
✅ **Coordenadas GPS** (location.lat, location.lng)  
✅ **Telefone** (phone, phoneUnformatted)  
✅ **Website** (website)  
✅ **Categoria** (categoryName)  
✅ **Avaliação** (totalScore)  
✅ **Número de avaliações** (reviewsCount)  
✅ **Horário de funcionamento** (openingHours)  
✅ **Descrição** (description)

### Parâmetros de Busca

```javascript
{
  searchStringsArray: ["centro cultural em Vitória, Espírito Santo, Brasil"],
  locationQuery: "Vitória, Espírito Santo, Brasil",
  maxCrawledPlacesPerSearch: 20,  // Máximo de resultados por busca
  language: "pt",                   // Idioma português
  countryCode: "br",                // Brasil
  skipClosedPlaces: false,          // Incluir lugares fechados
  maxReviews: 0,                    // Não extrair reviews (economiza créditos)
  maxImages: 1                      // Apenas 1 imagem por lugar
}
```

### Termos de Busca Configurados

O scraper busca automaticamente por:

- 🏛️ Centro cultural
- 🏘️ Centro comunitário
- 🎭 Associação cultural
- 🎨 Espaço cultural
- 🏠 Casa de cultura
- 🏢 Instituto cultural
- 🏛️ Fundação cultural
- 🖼️ Galeria de arte
- 🏛️ Museu
- 🎭 Teatro municipal
- 📻 Rádio comunitária
- 📡 Rádio FM comunitária
- 🎯 Ponto de cultura
- 📚 Ponto de memória
- 🎬 Cineclube
- 🎨 Coletivo artístico
- 🎪 Coletivo cultural
- 🎺 Banda municipal
- 🎻 Orquestra
- 🎵 Escola de música
- 🎨 Escola de arte
- 🥋 Capoeira
- 🏘️ Quilombo
- 🏛️ Patrimônio histórico
- 📚 Centro de referência cultural

### Limitações

- **120 resultados por área** sem geolocalização customizada
- **Rate limiting**: 2 segundos entre cada busca
- **Custo**: ~$0.01 por 10 lugares extraídos

---

## 🤖 Gemini AI - Maps Enrichment

### O que é?

Usa a **API Gemini 2.5 Flash** com integração ao Google Maps para buscar e enriquecer dados.

### Como Obter Token

1. Acesse [Google AI Studio](https://aistudio.google.com/apikey)
2. Crie uma **API Key** gratuita
3. Copie o token

### Plano Gratuito

- **1500 requisições por dia** (grátis)
- Ideal para enriquecimento de dados existentes
- Pode usar **múltiplos tokens** para aumentar limite

### Funcionalidades

1. **Busca de Locais**: Encontra organizações culturais
2. **Enriquecimento**: Adiciona descrições e informações faltantes

### Limitações

- ⚠️ **Menos preciso** que Apify
- ⚠️ **Mais lento** (2-3 segundos por requisição)
- ⚠️ **Quota diária limitada**
- ✅ **Gratuito** para uso moderado

---

## 🚀 Como Usar

### 1. Acessar Painel Admin

1. Abra a aplicação: `http://localhost:5173`
2. Clique em **ADMIN** no menu
3. Faça login com a senha: `caravana2024`

### 2. Configurar Tokens

Na seção **Configuração de Scrapers**:

```
┌─────────────────────────────────────┐
│  Token Apify (opcional)             │
│  [___________________________]      │
│                                     │
│  Token Gemini (opcional)            │
│  [___________________________]      │
│                                     │
│  [Salvar Configuração]              │
└─────────────────────────────────────┘
```

### 3. Executar Scraper Apify

1. Clique em **Executar Scraper Apify**
2. Aguarde a execução (pode levar 5-10 minutos)
3. Veja o progresso no console do servidor
4. Resultados aparecem como **pendentes** na tabela

### 4. Executar Scraper Gemini

1. Defina o número de municípios (padrão: 5)
2. Clique em **Executar Scraper Gemini**
3. Aguarde a execução
4. Resultados aparecem como **pendentes**

### 5. Enriquecer Dados

1. Clique em **Enriquecer com Gemini**
2. O sistema adiciona descrições aos locais sem informação
3. Atualiza até 50 entidades por execução

### 6. Aprovar/Rejeitar Entidades

Na tabela de entidades pendentes:

- ✅ **Aprovar**: Torna a entidade visível no mapa
- ❌ **Rejeitar**: Remove a entidade
- 🗑️ **Deletar**: Remove permanentemente

---

## 📊 Exemplo de Resultado

```json
{
  "name": "Centro Cultural de Vitória",
  "type": "associacao_cultural",
  "category": "Centro Cultural",
  "municipality": "Vitória",
  "region": "Grande Vitória",
  "lat": -20.3155,
  "lng": -40.3128,
  "address": "Rua da Cultura, 123 - Centro, Vitória - ES",
  "phone": "(27) 3333-4444",
  "website": "https://centroculturalvitoria.com.br",
  "description": "Espaço dedicado à promoção da cultura capixaba",
  "status": "pending"
}
```

---

## 💡 Dicas

### Para Melhor Qualidade

1. ✅ Use **Apify** para coleta inicial (mais preciso)
2. ✅ Use **Gemini** para enriquecer dados faltantes
3. ✅ Revise manualmente antes de aprovar
4. ✅ Execute em horários de baixo uso (noite/madrugada)

### Para Economizar Créditos

1. 💰 Limite `maxCrawledPlacesPerSearch` para 10-15
2. 💰 Desative `maxReviews` (não precisamos de reviews)
3. 💰 Use `maxImages: 1` (apenas 1 imagem)
4. 💰 Execute apenas para municípios prioritários

### Para Evitar Duplicatas

O sistema automaticamente:
- ✅ Verifica duplicatas por **nome + município + tipo**
- ✅ Ignora entidades já existentes
- ✅ Normaliza nomes para comparação

---

## 🔧 Troubleshooting

### Erro: "Actor was not found"

**Causa**: ID do actor incorreto  
**Solução**: Verifique se está usando `compass/crawler-google-places`

### Erro: "Token não configurado"

**Causa**: Token não foi salvo  
**Solução**: Configure o token no painel admin e clique em "Salvar"

### Erro: "Quota exceeded"

**Causa**: Limite diário do Gemini atingido  
**Solução**: Aguarde 24h ou adicione mais tokens Gemini

### Nenhum resultado encontrado

**Causa**: Termos de busca muito específicos  
**Solução**: Ajuste os termos em `municipalities.json`

---

## 📚 Referências

- [Apify Google Maps Scraper](https://apify.com/compass/crawler-google-places)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Google Maps Platform](https://developers.google.com/maps)

---

## 🆘 Suporte

Problemas? Abra uma issue no GitHub ou entre em contato com a equipe de desenvolvimento.
