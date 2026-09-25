# Módulo Admin — Visão Geral

> **Data de criação:** 23/09/2026  
> **Rota:** `/admin`  
> **Componente principal:** [`AdminComponent`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/admin/admin.component.ts)  
> **Proteção:** `authGuard` (CanActivateFn)

---

## Resumo

Painel administrativo completo para gerenciamento de todo o conteúdo dinâmico do site. Sem Nav e Footer. Permite CRUD de Produtos, Categorias, Fornecedores, Banners e Usuários, além de alteração de senha do usuário logado.

## Tabs Disponíveis

| Tab | Entidade | CRUD | Filtros de Tabela |
|-----|----------|------|-------------------|
| Produtos | `ProductRes` | Criar, Editar, Excluir | Categoria, Fornecedor |
| Categorias de Produtos | `ProductCategoryRes` | Criar, Editar, Excluir | — |
| Fornecedores | `SupplierRes` | Criar, Editar, Excluir (cascata) | — |
| Banners | `BannerRes` | Criar, Editar, Excluir | — |
| Usuários | `UserRes` | Criar, Editar, Excluir | — |
| Alterar Senha | — | — | — |

## Sub-componentes

```
AdminComponent
├── AdminNavComponent           ← barra lateral com tabs e logout
├── DynamicTableComponent       ← tabela genérica reutilizável
│   └── TableFilterComponent    ← filtros por coluna
├── ModalEntityComponent        ← modal CRUD adaptativo
│   ├── InputComponent
│   ├── SelectComponent
│   ├── TextareaComponent
│   └── ButtonComponent
├── ModalConfirmComponent       ← confirmação de exclusão
├── ModalResponseComponent      ← feedback de erro
└── ToastComponent              ← feedback de sucesso
```

## Dependências de Serviços

- `ProductsService` — CRUD + galeria para cascata
- `ProductCategoriesService` — CRUD + lista para dropdowns
- `SuppliersService` — CRUD + lista para dropdowns
- `UsersService` — CRUD + alteração de senha
- `BannersService` — CRUD + banners ativos
- `AuthService` — registro de novo usuário + logout
- `TokenService` — obtenção do email do usuário logado

## Controle de Acesso por Role

| Ação | Role `USER` | Role `ADMIN` |
|------|------------|-------------|
| Gerenciar Produtos/Categorias/Fornecedores/Banners | ✅ | ✅ |
| Gerenciar Usuários | ❌ (ações desabilitadas) | ✅ |
| Alterar própria senha | ✅ | ✅ |
