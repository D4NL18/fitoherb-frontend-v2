# UI/UX: Painel Administrativo

Este documento mapeia as telas da área `/admin`, focadas na operação de CRUD. Abrange produtos, categorias, banners, fornecedores e usuários.

## 1. Descrição Visual
- Layout em painel: Barra lateral esquerda (Sidebar) fixa com links para todos os módulos e cabeçalho (Header) superior com botão de logout e perfil do usuário.
- Conteúdo Central: Tabelas de listagem de registros.

## 2. Componentes Específicos
- **Data Table Paginada:** Tabela principal contendo colunas clicáveis para gerar mudança de `sortField` e `direction`.
- **Search Input (Debounced):** Campo de busca genérico que chama a API repassando a `search` string, recarregando a tabela (voltando para `page = 0`).
- **Modal de Formulário:** Modais que usam instâncias reativas para coletar dados + *Input File* customizado caso exista anexo de imagens (ex: produtos, banners).

## 3. Fluxo de Usuário
- **Acesso:** Protegido, acessado via `/admin`.
- **Feedback Esperado (CRUD):** 
  - Ao excluir: Pedido de confirmação (Dialog) seguido de atualização otimista na tabela.
  - Ao salvar form: Fechamento automático do modal e reload dos dados via `getAll` ou `getPaginated`.
