# Regras de Negócio — Módulo Admin

> **Data de criação:** 23/09/2026

---

## Acesso e Autenticação

1. A rota `/admin` é protegida por `authGuard` — usuários não autenticados são redirecionados para `/login`
2. Ao carregar, o role do usuário logado é buscado via `UsersService.getByEmail(email)` usando o email do cookie
3. Usuários com role `USER` **não podem** executar ações na tab "Usuários" (editar/excluir desabilitados via `disableActions`)
4. Se o token expirar durante o uso do admin, o interceptor tentará refresh automático; em caso de falha, redireciona para `/login`

## Navegação por Tabs

1. Ao trocar de tab, o `effect()` detecta a mudança em `pageTitle` e automaticamente:
   - Reseta `orderBy` para "Nome (A-Z)"
   - Reseta `currentPage` para `0`
   - Reseta `activeFilters` para `{}`
   - Chama `loadData()` com os novos parâmetros
2. A tab "Alterar Senha" não carrega dados nem exibe tabela — apenas o formulário

## Busca e Ordenação

1. Busca com `debounceTime(400)` + `distinctUntilChanged()` reseta página para `0`
2. Ordenação disponível por tab:
   - **Produtos**: Nome (A-Z/Z-A), Categoria (A-Z/Z-A), Fornecedor (A-Z/Z-A)
   - **Usuários**: Nome (A-Z/Z-A), E-mail (A-Z/Z-A)
   - **Categorias/Fornecedores**: Nome (A-Z/Z-A)
   - **Banners**: Posição (Menor-Maior/Maior-Menor), Mais recentes
3. `hasActiveFilters` é `true` se: há texto na busca, ordenação diferente de "Nome (A-Z)", ou há filtros de tabela ativos

## Criação/Edição (Modal Entity)

1. Em modo **create**, imagem é obrigatória (exceto para Usuários)
2. Em modo **edit**, imagem é opcional — se não selecionar nova, mantém a existente
3. Para **Produtos**, `flavours` e `presentation` são strings separadas por vírgula no formulário e convertidas para `string[]` no `handleSave`
4. Para **Produtos**, `categoryName` e `supplierName` são resolvidos para `categorySlug` e `supplierSlug` antes de enviar à API
5. Se não houver Categorias ou Fornecedores cadastrados, o modal de criação de Produto exibe alerta e bloqueia o formulário
6. E-mail do usuário é **desabilitado** em modo edição (campo locked)
7. Para **Banners**, `position` é convertido para `Number` antes de enviar

## Exclusão (Modal Confirm)

1. Ao excluir um **Fornecedor** com produtos vinculados (`item.count > 0`), o sistema busca os produtos via `getProductsBySupplier()` e exibe a lista no modal de confirmação
2. Se `cascadeItems.length > 0`, a exclusão do fornecedor é enviada com `deleteProducts=true` (exclusão em cascata)
3. Para Categorias, a exclusão é simples — sem cascata client-side (backend decide)

## Feedback ao Usuário

1. **Sucesso (200-299)**: Toast verde auto-fecha em **4 segundos**
2. **Erro**: Modal com status HTTP e mensagem (não auto-fecha)
3. Erros específicos mapeados:
   - Status `0`: "Não foi possível conectar ao servidor."
   - Status `409` + Produtos: "Já existe um produto com este nome para este fornecedor."
   - Outros: `err.error.message` ou mensagem genérica

## Alteração de Senha

1. Formulário com 3 campos: senha atual, nova senha, confirmar nova senha
2. Validações da nova senha: `required`, `minLength(8)`, regex: ao menos 1 maiúscula, 1 minúscula, 1 dígito, 1 caractere especial (`@$!%*?&`)
3. Validador customizado `passwordsMatchValidator` garante que nova senha == confirmação
4. O e-mail do usuário logado é obtido via `tokenService.getUserEmail()`
