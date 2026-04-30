# 🔄 Guia de Recuperação de Dados

## ⚠️ O que aconteceu?

Os dados foram perdidos durante uma migration do banco de dados. Mas não se preocupe, podemos recuperar!

---

## 🛡️ Sistema de Backup Implementado

### Backup Automático
- ✅ **A cada 1 hora** o servidor cria um backup automático
- ✅ **Ao iniciar** o servidor cria um backup inicial (após 5 segundos)
- ✅ **Mantém os últimos 20 backups** automaticamente
- ✅ **Pasta**: `caravana-app/backups/`

### Backup Manual

```bash
# Criar backup manualmente
npm run db:backup

# Restaurar último backup
npm run db:restore
```

---

## 🔍 Recuperar Dados do Apify

Se você rodou o scraper Apify antes, os dados ainda estão lá! Vamos recuperá-los:

### Passo 1: Obter seu Token Apify

1. Acesse: https://console.apify.com/account/integrations
2. Copie seu **API Token**

### Passo 2: Recuperar os Dados

```bash
# Substitua YOUR_TOKEN pelo seu token real
npm run recover:apify YOUR_TOKEN
```

**Exemplo:**
```bash
npm run recover:apify apify_api_AbCdEfGhIjKlMnOpQrStUvWxYz123456
```

### O que o script faz:

1. 🔍 Busca as últimas 10 execuções do Apify
2. ✅ Filtra apenas as bem-sucedidas
3. 📊 Mostra informações de cada run
4. 🔄 Recupera dados da execução mais recente
5. 💾 Importa para o banco de dados
6. ⚠️ Pula duplicatas automaticamente

---

## 📊 Verificar Dados Recuperados

Após a recuperação, verifique:

```bash
# Ver estatísticas
curl http://localhost:3002/api/stats

# Ou acesse o painel admin
http://localhost:5173/#/admin
```

---

## 🚨 Prevenção Futura

### Antes de Migrations

```bash
# SEMPRE faça backup antes de migrations!
npm run db:backup
npx prisma migrate dev
```

### Backups Regulares

Os backups automáticos estão configurados, mas você pode fazer manuais:

```bash
# Backup antes de operações importantes
npm run db:backup

# Listar backups disponíveis
ls backups/
```

### Restaurar Backup

```bash
# Restaura o backup mais recente
npm run db:restore

# Ou copie manualmente
cp backups/auto-2026-04-30T12-00-00.db prisma/dev.db
```

---

## 📝 Logs de Backup

O servidor mostra logs de backup:

```
[BACKUP] ✅ Backup automático: auto-2026-04-30T12-00-00.db
```

---

## 🔧 Troubleshooting

### "Token Apify inválido"
- Verifique se copiou o token completo
- Token deve começar com `apify_api_`

### "Nenhuma execução encontrada"
- Você precisa ter rodado o scraper Apify antes
- Verifique em: https://console.apify.com/actors/runs

### "Erro ao importar"
- Verifique se o servidor está rodando
- Verifique se o banco de dados existe

---

## 📞 Comandos Úteis

```bash
# Backup
npm run db:backup              # Criar backup manual
npm run db:restore             # Restaurar último backup

# Recuperação
npm run recover:apify TOKEN    # Recuperar do Apify

# Banco de Dados
npm run seed                   # Recriar dados básicos
npm run db:studio              # Abrir Prisma Studio

# Servidor
npm run server                 # Iniciar servidor
```

---

## ✅ Checklist de Segurança

- [x] Backup automático a cada 1 hora
- [x] Backup ao iniciar servidor
- [x] Manter últimos 20 backups
- [x] Script de recuperação do Apify
- [x] Script de restauração de backup
- [x] Chaves API salvas no banco (não serão perdidas)

---

**Última atualização**: 2026-04-30
