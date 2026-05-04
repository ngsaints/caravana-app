# 📥 Como Importar Dados do Mapa Cultural

## 🎯 Passo a Passo:

### 1. Copiar os dados do navegador

1. Abra o site: https://culturaviva.cultura.gov.br/busca/##(global:(enabled:(agent:!t),filterEntity:agent,viewMode:map),agent:(keyword:'',location:(lat:'-20.2976',lng:'-40.2958',zoom:7)))

2. Abra o **DevTools** (F12)

3. Vá na aba **Console**

4. Cole este código e pressione Enter:

```javascript
copy(JSON.stringify(entities, null, 2))
```

5. Os dados foram copiados para sua área de transferência!

### 2. Salvar os dados em um arquivo

1. Crie um arquivo chamado `mapa-cultural-data.json` na pasta `caravana-app/`

2. Cole o conteúdo copiado no arquivo

3. Salve o arquivo

### 3. Rodar o script de importação

```bash
cd caravana-app
node import-from-json.mjs
```

## 📋 O que o script faz:

✅ Lê o arquivo JSON  
✅ Extrai: nome, lat, lng, telefone, email, site, descrição  
✅ Identifica o município pelas coordenadas (proximidade)  
✅ Detecta o tipo automaticamente (ponto_cultura, cineclube, etc)  
✅ Detecta a categoria por palavras-chave  
✅ Verifica duplicatas (nome + município + tipo)  
✅ Importa apenas novos registros  
✅ Todas entidades ficam com `status: 'pending'` (aguardando aprovação)  

## ⚠️ Importante:

- Entidades **sem coordenadas** são puladas
- Entidades com coordenadas **fora do ES** são puladas
- Entidades **duplicadas** são puladas
- Todas entidades importadas ficam **pendentes** até você aprovar no admin

## 🔍 Verificar antes de importar:

Se quiser ver um preview dos dados antes de importar, você pode abrir o arquivo `mapa-cultural-data.json` e verificar se tem essa estrutura:

```json
[
  {
    "id": 13154,
    "name": "Circo Teatro Capixaba",
    "location": {
      "lat": "-20.582773515220218",
      "lng": "-41.760149002075195"
    },
    "telefonePublico": "(27) 99999-9999",
    "emailPublico": "contato@exemplo.com",
    "site": "https://exemplo.com",
    "shortDescription": "Descrição da entidade"
  }
]
```

## 🚀 Após importar:

1. Faça login como admin no sistema
2. Vá no painel administrativo
3. Revise as entidades pendentes
4. Aprove ou rejeite cada uma
5. As aprovadas aparecerão no mapa!
