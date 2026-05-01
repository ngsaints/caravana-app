# 🔗 Como Usar o Embed do Mapa

## ✅ SIM! O embed funciona em QUALQUER site!

O mapa pode ser incorporado em:
- ✅ WordPress
- ✅ Wix
- ✅ Squarespace
- ✅ Blogger
- ✅ Sites HTML estáticos
- ✅ React, Vue, Angular
- ✅ Qualquer plataforma que permita HTML

## 📋 Código do Embed

```html
<iframe 
  src="https://hotpink-viper-184207.hostingersite.com/#/embed" 
  width="100%" 
  height="800" 
  frameborder="0"
  style="border: 1px solid #E0D8CC; border-radius: 12px;"
  title="Mapa das Entidades Culturais do ES">
</iframe>
```

## 🎨 Personalizações

### Altura do Iframe

```html
<!-- Altura padrão -->
<iframe height="800" ...></iframe>

<!-- Altura menor para mobile -->
<iframe height="600" ...></iframe>

<!-- Altura maior para desktop -->
<iframe height="1000" ...></iframe>
```

### Largura

```html
<!-- Largura total (recomendado) -->
<iframe width="100%" ...></iframe>

<!-- Largura fixa -->
<iframe width="1200px" ...></iframe>
```

### Estilo Personalizado

```html
<iframe 
  style="
    border: 2px solid #5A3D8A; 
    border-radius: 16px; 
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  "
  ...>
</iframe>
```

## 🌐 Como Adicionar em Diferentes Plataformas

### WordPress

1. Edite a página/post
2. Adicione um bloco **HTML Personalizado**
3. Cole o código do iframe
4. Publique

### Wix

1. Clique em **Adicionar** (+)
2. Selecione **Embed** > **Código HTML**
3. Cole o código do iframe
4. Ajuste o tamanho
5. Publique

### Squarespace

1. Adicione um bloco **Code**
2. Cole o código do iframe
3. Salve e publique

### HTML Estático

Simplesmente cole o código onde quiser que o mapa apareça:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Meu Site</title>
</head>
<body>
  <h1>Entidades Culturais do ES</h1>
  
  <!-- EMBED DO MAPA -->
  <iframe 
    src="https://hotpink-viper-184207.hostingersite.com/#/embed" 
    width="100%" 
    height="800" 
    frameborder="0"
    title="Mapa das Entidades Culturais do ES">
  </iframe>
  
</body>
</html>
```

## 🔧 Configuração Técnica

### CORS Configurado

O servidor está configurado para aceitar requisições de **qualquer domínio**:

```javascript
app.use(cors({
  origin: '*', // Permite todos os domínios
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Headers para Iframe

```javascript
res.setHeader('X-Frame-Options', 'ALLOWALL');
res.setHeader('Content-Security-Policy', "frame-ancestors *");
```

Isso garante que o iframe funcione em **qualquer site**.

## 📱 Responsividade

O embed é **totalmente responsivo**:
- ✅ Desktop: layout lado a lado (texto + mapa)
- ✅ Tablet: layout adaptado
- ✅ Mobile: layout vertical (texto acima, mapa abaixo)

## 🎯 Funcionalidades do Embed

O embed inclui **TODAS** as funcionalidades:

### Mapa Interativo
- ✅ Visualização de mapa/satélite
- ✅ Marcadores clicáveis
- ✅ Popups com informações
- ✅ Zoom e navegação
- ✅ Botão "Ver Todas"

### Filtros Completos
- ✅ Busca por nome
- ✅ Filtro por tipo
- ✅ Filtro por categoria
- ✅ Filtro por município
- ✅ Filtro por região
- ✅ Botão limpar filtros

### Lista de Entidades
- ✅ Paginação (10 por página)
- ✅ Botão "Ver no Mapa"
- ✅ Informações completas
- ✅ Links para websites

### Estatísticas
- ✅ Total de entidades
- ✅ Total de municípios
- ✅ Animação de contadores

## 🧪 Testar o Embed

Use o arquivo `test-embed.html` incluído no projeto para testar localmente:

```bash
# Abrir no navegador
open caravana-app/test-embed.html
```

Ou acesse diretamente:
```
file:///caminho/para/caravana-app/test-embed.html
```

## 🔒 Segurança

- ✅ API pública para leitura (GET)
- ✅ Rotas administrativas protegidas (POST, PATCH, DELETE)
- ✅ Apenas entidades **ativas** são exibidas no embed
- ✅ Sem exposição de dados sensíveis

## 📊 Performance

- ✅ Lazy loading do iframe
- ✅ API otimizada
- ✅ Cache de dados
- ✅ Carregamento rápido

## 🆘 Troubleshooting

### O iframe não aparece

1. Verifique se o código está correto
2. Verifique se a URL está acessível
3. Verifique se a plataforma permite iframes

### O mapa não carrega

1. Verifique a conexão com a internet
2. Verifique se o servidor está online
3. Abra o console do navegador (F12) para ver erros

### Problemas de altura

Ajuste o atributo `height` do iframe:
```html
<iframe height="600" ...></iframe>  <!-- Menor -->
<iframe height="1000" ...></iframe> <!-- Maior -->
```

## 📞 Suporte

Para problemas ou dúvidas:
- Repositório: https://github.com/ngsaints/caravana-app
- Documentação: `/docs`

---

**Última atualização**: 01/05/2026
