# Sistema de Embed - Caravana da Cultura ES

## 📋 Visão Geral

O sistema de embed permite que o mapa e a lista de entidades culturais sejam incorporados em outros sites através de um iframe. O embed é totalmente responsivo e não inclui o menu de navegação, focando apenas no conteúdo principal.

## ✨ Funcionalidades Implementadas

### 1. Componente EmbedView
- **Localização**: `src/components/EmbedView.tsx`
- **Rota**: `#/embed` ou `/embed`
- **Características**:
  - Mapa interativo com marcadores das entidades
  - Filtro de busca por nome
  - Lista completa de entidades com informações
  - Botão "Ver no Mapa" que foca a entidade selecionada
  - Footer com branding "Powered by Caravana da Cultura - ES"
  - Totalmente responsivo (mobile-first)

### 2. Modal de Código Embed no Admin
- **Localização**: `src/components/AdminPanel.tsx`
- **Acesso**: Painel Admin → Botão "🔗 Código Embed"
- **Características**:
  - Código HTML pronto para copiar
  - Botão "Copiar Código" com feedback
  - Preview ao vivo do embed
  - Instruções de uso detalhadas
  - Configurações recomendadas (altura, responsividade)

### 3. Estilos CSS
- **Localização**: `src/styles/App.css`
- **Seções**:
  - `.embed-view` - Container principal
  - `.embed-filters` - Barra de busca
  - `.embed-map-container` - Container do mapa (500px desktop, 400px mobile)
  - `.embed-list` - Lista de entidades
  - `.embed-table` - Tabela responsiva com scroll horizontal
  - `.embed-footer` - Rodapé com branding
  - `.embed-modal` - Modal do código embed no admin

## 🚀 Como Usar

### Para Administradores

1. Acesse o painel administrativo
2. Clique no botão "🔗 Código Embed" na toolbar
3. Copie o código HTML exibido
4. Cole o código no site desejado

### Código de Exemplo

```html
<iframe 
  src="http://94.141.97.178:3002/#/embed" 
  width="100%" 
  height="800" 
  frameborder="0" 
  style="border: 1px solid #E0D8CC; border-radius: 12px;"
  title="Mapa das Entidades Culturais do ES">
</iframe>
```

### Personalizações Recomendadas

- **Altura**: Ajuste o atributo `height` conforme necessário (recomendado: 800px)
- **Largura**: Use `width="100%"` para responsividade total
- **Borda**: Personalize o `style` para combinar com seu site

## 📱 Responsividade

O embed é totalmente responsivo e se adapta automaticamente:

- **Desktop**: Mapa 500px, tabela completa
- **Mobile**: Mapa 400px, tabela com scroll horizontal
- **Filtros**: Sempre visíveis e funcionais
- **Botões**: Tamanho otimizado para touch

## 🔄 Atualização Automática

O embed busca dados diretamente da API, então:
- Novas entidades aprovadas aparecem automaticamente
- Alterações nas entidades são refletidas em tempo real
- Não é necessário atualizar o código embed

## 🎨 Características Visuais

- **Cores**: Mantém a identidade visual do projeto
- **Tipografia**: Inter (corpo) e Playfair Display (títulos)
- **Ícones**: Emojis para melhor compatibilidade
- **Marcadores**: Cores diferentes por tipo de entidade
- **Hover**: Efeitos suaves de interação

## 🔒 Segurança

- Apenas entidades com status "active" são exibidas
- Sem acesso a funcionalidades administrativas
- Sem exposição de dados sensíveis
- CORS configurado no servidor

## 📊 Dados Exibidos

Para cada entidade:
- Nome
- Tipo (com badge colorido)
- Município
- Descrição (se disponível)
- Botão para visualizar no mapa

## 🛠️ Manutenção

### Arquivos Principais
- `src/components/EmbedView.tsx` - Componente principal
- `src/components/AdminPanel.tsx` - Modal do código embed
- `src/styles/App.css` - Estilos (seção "EMBED VIEW" e "EMBED MODAL")
- `src/App.tsx` - Roteamento do embed

### Modificações Futuras
Para adicionar funcionalidades ao embed:
1. Edite `EmbedView.tsx`
2. Adicione estilos em `App.css` (seção EMBED)
3. Teste a responsividade mobile
4. Atualize este documento

## 📝 Notas Técnicas

- **Framework**: React 19 + TypeScript
- **Mapa**: Leaflet + React-Leaflet
- **Clustering**: react-leaflet-cluster
- **Build**: Vite
- **Rota**: Hash-based routing (`#/embed`)

## ✅ Checklist de Implementação

- [x] Componente EmbedView criado
- [x] Rota `/embed` configurada
- [x] Estilos CSS mobile-first
- [x] Modal de código embed no admin
- [x] Botão "Copiar Código"
- [x] Preview do embed
- [x] Instruções de uso
- [x] Responsividade testada
- [x] Build sem erros
- [x] Documentação completa

## 🎯 Próximos Passos (Opcional)

- [ ] Adicionar mais opções de filtro no embed
- [ ] Permitir customização de cores via URL params
- [ ] Adicionar analytics para tracking de uso
- [ ] Criar versão com altura automática
- [ ] Adicionar opção de embed apenas do mapa (sem lista)

---

**Última atualização**: 01/05/2026
**Versão**: 1.0.0
**Status**: ✅ Implementado e Funcional
