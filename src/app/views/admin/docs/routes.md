# Rotas do Módulo Painel Administrativo — Fitoherb Frontend

> **Path Principal:** `/admin`  
> **Componente:** `AdminComponent` (`src/app/views/admin/admin.component.ts`)  
> **Acesso:** Estritamente Restrito (`canActivate: [authGuard]`, requer role `ADMIN`)  
> **Layout:** Painel com `AdminNavComponent` exclusivo (Navbar e Rodapé públicos ocultados)

---

## 1. Configuração da Rota (`app.routes.ts`)

```typescript
{
  path: 'admin',
  loadComponent: () => import('./views/admin/admin.component').then(m => m.AdminComponent),
  canActivate: [authGuard],
  title: 'Painel de Gestão — Fitoherb Nordeste'
}
```

---

## 2. Abas e Subseções Internas (Tabs Baseadas em Estado)

O módulo admin utiliza estado reativo via Signals para gerenciar as visualizações de gestão sem recarregar a rota:

1. **Gestão de Produtos:** Tabela dinâmica, filtros por categoria/fornecedor, paginação, modais de cadastro/edição e confirmação de exclusão.
2. **Gestão de Categorias:** Listagem de categorias, upload de imagem de capa e CRUD completo.
3. **Gestão de Fornecedores:** Controle de fornecedores, alternância de destaque comercial (`isHighlighted`) e logos.
4. **Gestão de Banners:** Ordem de exibição do carrossel da home (`position`) e toggle de visibilidade (`isActive`).
5. **Gestão de Usuários:** Listagem de administradores e operadores, cadastro e remoção de contas.

---

## 3. Segurança de Rota (`auth.guard.ts`)

O guard funcional `authGuard` avalia se existe um token JWT válido. Caso o token esteja ausente, malformado ou expirado, a rota intercepta a navegação, limpa credenciais residuais e redireciona para `/login?returnUrl=/admin`.
