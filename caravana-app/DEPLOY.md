# 🚀 Deploy na Hostinger - Caravana da Cultura ES

## ✅ IMPORTANTE - Configuração da URL da API

O projeto está configurado para usar **URL relativa** (`/api`) por padrão, o que significa que a API e o frontend devem rodar **na mesma porta/domínio**.

### ⚠️ Antes de fazer o build:

1. **Certifique-se que o arquivo `.env.local` NÃO tem `VITE_API_URL` definido**
2. Ou comente a linha: `# VITE_API_URL=http://localhost:3002/api`
3. Isso fará com que o build use `/api` (relativo) automaticamente

## 📋 Deploy na Hostinger - Passo a Passo

### 1. **Preparar os Arquivos Localmente**

```bash
# 1. Remover ou comentar VITE_API_URL no .env.local
# Edite caravana-app/.env.local e comente a linha:
# VITE_API_URL=http://localhost:3002/api

# 2. Fazer build
cd caravana-app
npm install
npm run build

# 3. Zipar a pasta inteira
cd ..
# No Windows: Clique direito > Enviar para > Pasta compactada
# Ou use: Compress-Archive -Path caravana-app -DestinationPath caravana-app.zip
```

### 2. **Upload na Hostinger**

1. Acesse o painel da Hostinger
2. Vá em **Websites** > Seu site > **Gerenciador de Arquivos**
3. Navegue até a pasta `Maps/`
4. Faça upload do arquivo `caravana-app.zip`
5. Extraia o arquivo

### 3. **Configurar o Aplicativo Node.js na Hostinger**

No painel da Hostinger, vá em **Websites** > **Aplicativos Node.js** e configure:

```
Framework preset: Express
Node version: 22.x
Root directory: Maps/caravana-app
Package manager: npm
Entry file: server-production.js
```

**NÃO configure a porta** - a Hostinger gerencia isso automaticamente via variável `PORT`.

### 4. **Variáveis de Ambiente (Opcional)**

Se precisar configurar tokens do scraper:

```env
APIFY_TOKEN=seu_token_aqui
GEMINI_API_KEY=sua_chave_aqui
```

### 5. **Deploy**

1. Clique em **Deploy** ou **Redeploy**
2. Aguarde o build terminar (pode levar 1-2 minutos)
3. Verifique os logs para confirmar que não há erros

### 6. **Verificar**

Acesse: `https://hotpink-viper-184207.hostingersite.com`

- ✅ Página inicial deve carregar
- ✅ Mapa deve aparecer com as entidades
- ✅ Filtros devem funcionar
- ✅ Admin deve funcionar em `/#/admin`

## 🔧 Estrutura do Servidor de Produção

O arquivo `server-production.js` faz:

1. **Serve a API** em `/api/*`
2. **Serve o frontend** (arquivos estáticos da pasta `dist/`)
3. **Roda na porta** definida pela variável `PORT` (Hostinger define automaticamente)

## 🐛 Troubleshooting

### ❌ Erro: "GET http://localhost:3002/api/entities net::ERR_CONNECTION_REFUSED"

**Causa**: O build foi feito com `VITE_API_URL=http://localhost:3002/api` no `.env.local`

**Solução**:
1. Edite `caravana-app/.env.local` e comente a linha:
   ```env
   # VITE_API_URL=http://localhost:3002/api
   ```
2. Faça novo build:
   ```bash
   npm run build
   ```
3. Faça upload da pasta `dist/` atualizada ou da pasta inteira zipada
4. Redeploy na Hostinger

### ❌ Erro: "Build failed"

Verifique os logs no painel da Hostinger. Erros comuns:

- **Entry file must have .js extension**: Certifique-se que o Entry file é `server-production.js`
- **Module not found**: O build instalará as dependências automaticamente

### ❌ Banco de dados vazio

O banco `prisma/dev.db` já está incluído no projeto com 364 entidades. Se estiver vazio:

1. Verifique se o arquivo `prisma/dev.db` foi enviado
2. Se necessário, restaure um backup:
   ```bash
   npm run db:restore
   ```

### ❌ Frontend carrega mas sem dados

Abra o **Console do navegador** (F12) e verifique:

- Se há erros de CORS
- Se as requisições para `/api/entities` estão funcionando
- Se o servidor está rodando corretamente

## 📊 Verificar Status

### No Console do Navegador (F12):

```javascript
// Testar API
fetch('/api/stats').then(r => r.json()).then(console.log)
fetch('/api/entities').then(r => r.json()).then(console.log)
```

### Logs da Hostinger:

Acesse **Websites** > **Aplicativos Node.js** > **Logs** para ver os logs do servidor.

## 🔄 Atualizar o Projeto

1. Faça as alterações localmente
2. Faça novo build: `npm run build`
3. Zipar e fazer upload
4. Redeploy na Hostinger

## 🗄️ Backup Automático

O sistema faz backup automático do banco de dados:
- **Frequência**: A cada 1 hora
- **Localização**: `backups/`
- **Retenção**: Últimos 20 backups

### Restaurar Backup:
```bash
npm run db:restore
```

## 🔗 URLs Importantes

- **Página Inicial**: `https://hotpink-viper-184207.hostingersite.com`
- **Admin**: `https://hotpink-viper-184207.hostingersite.com/#/admin`
- **Embed**: `https://hotpink-viper-184207.hostingersite.com/#/embed`
- **API**: `https://hotpink-viper-184207.hostingersite.com/api`

## 🔐 Credenciais

- **Senha Admin**: `caravana2024`

## 📞 Suporte

Para problemas ou dúvidas, consulte a documentação em `docs/` ou entre em contato.

---

**Última atualização**: 01/05/2026
