# 🚀 Deploy na Hostinger - Guia Completo

## ❌ Problema Atual
Erro 500 nas rotas `/api/stats` e `/api/entities` - O banco de dados não está funcionando.

## ✅ Solução

### Opção 1: Via Terminal SSH da Hostinger (RECOMENDADO)

1. **Acesse o terminal SSH** no painel da Hostinger
2. **Navegue até a pasta do projeto:**
   ```bash
   cd ~/domains/hotpink-viper-184207.hostingersite.com/Maps/caravana-app
   ```

3. **Execute o script de setup:**
   ```bash
   chmod +x setup-production.sh
   ./setup-production.sh
   ```

4. **Se der erro, execute manualmente:**
   ```bash
   # Gerar Prisma Client
   npx prisma generate
   
   # Criar/atualizar banco
   npx prisma db push
   
   # Popular com dados iniciais (municípios)
   npx tsx src/server/seed.ts
   
   # Verificar
   node check-production.mjs
   ```

5. **Reinicie o servidor Node.js** no painel da Hostinger

---

### Opção 2: Subir o Banco Manualmente

Se o SSH não funcionar, suba o banco de dados manualmente:

1. **No seu computador local, copie o arquivo:**
   ```
   caravana-app/prisma/dev.db
   ```

2. **Na Hostinger, vá em File Manager**

3. **Navegue até:**
   ```
   domains/hotpink-viper-184207.hostingersite.com/Maps/caravana-app/prisma/
   ```

4. **Faça upload do arquivo `dev.db`**

5. **Reinicie o servidor Node.js**

---

## 🔍 Verificar se Funcionou

Acesse no navegador:
- ✅ https://hotpink-viper-184207.hostingersite.com/api/health
- ✅ https://hotpink-viper-184207.hostingersite.com/api/stats
- ✅ https://hotpink-viper-184207.hostingersite.com/api/entities

Se retornar JSON, está funcionando!

---

## 📊 Dados Esperados

Após o setup, você deve ter:
- **367 entidades ativas**
- **3 entidades pendentes**
- **32 municípios**
- **5 tipos de entidades**

---

## ⚙️ Configuração da Hostinger

Certifique-se de que está configurado:
- **Framework:** Express
- **Node Version:** 22.x
- **Application Root:** Maps/caravana-app
- **Application Startup File:** server-production.js

---

## 🆘 Se Ainda Não Funcionar

Execute no terminal SSH:
```bash
cd ~/domains/hotpink-viper-184207.hostingersite.com/Maps/caravana-app

# Ver logs de erro
cat logs/error.log

# Verificar permissões
ls -la prisma/

# Dar permissão ao banco
chmod 666 prisma/dev.db
chmod 777 prisma/

# Reiniciar
pm2 restart all
```

---

## 📝 Checklist Final

- [ ] Arquivo `prisma/dev.db` existe na Hostinger
- [ ] Prisma Client foi gerado (`npx prisma generate`)
- [ ] Banco tem dados (367 entidades)
- [ ] Servidor Node.js foi reiniciado
- [ ] `/api/health` retorna status ok
- [ ] `/api/stats` retorna estatísticas
- [ ] `/api/entities` retorna lista de entidades
