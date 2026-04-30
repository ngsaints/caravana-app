# Agentes - Caravana da Cultura

## Contexto do Projeto

Este é um projeto React/TypeScript para exibir um mapa interativo de associações culturais do Espírito Santo. A aplicação não tem backend - é puramente frontend com dados estáticos mockados.

## Regras para IAs

### Antes de modificar código
1. Leia `docs/developers.md` para entender a estrutura
2. Leia `docs/systemd-deployment.md` se for fazer deploy
3. Verifique se há testes (atualmente não há, mas seguir o padrão do projeto)

### Ao fazer modificações

**Design/Estilo:**
- Todas as cores e variáveis CSS estão em `src/styles/App.css`
- Não use `!important` - use a hierarquia do CSS
- Mantenha consistência com o design system existente
- Paleta: roxo (#3B2369, #5A3D8A), verde (#0D5C4A, #1A7A63), laranja (#E87A2E)

**Componentes:**
- Localização: `src/components/`
- Nomes: PascalCase (ex: `FilterSection.tsx`)
- Props: interface definida no próprio arquivo ou em `src/types/`
- Use `type` ao invés de `interface` para imports se precisar

**Dados:**
- Locação: `src/data/municipalities.ts`
- Tipos: `src/types/index.ts`
- Nunca hardcode dados - use os arquivos de dados

### Build e Deploy

1. Sempre rode `npm run build` antes de considerar pronto
2. Teste com `npm run preview` localmente
3. Para deploy, siga `docs/systemd-deployment.md`

### Quando em dúvida

- Mantenha simples
- Não adicione complexidade desnecessária
- Dados mockados são suficientes para protótipo
- Se precisar de backend, crieissue especificando necessidade

### ⚠️ REGRAS CRÍTICAS - NÃO IGNORAR

**Modelo Gemini:**
- SEMPRE use `gemini-2.5-flash` para chamadas à API do Gemini
- NUNCA use `gemini-2.0-flash`, `gemini-3-flash-preview`, ou qualquer outra versão
- Esta regra é ABSOLUTA e não deve ser violada por nenhum motivo