# Rotas do Módulo Fornecedores Parceiros — Fitoherb Frontend

> **Path Principal:** `/fornecedores`  
> **Componente:** `SuppliersComponent` (`src/app/views/suppliers/suppliers.component.ts`)  
> **Acesso:** Público  
> **Layout:** Com `NavComponent` e `FooterComponent`

---

## 1. Configuração da Rota (`app.routes.ts`)

```typescript
{
  path: 'fornecedores',
  loadComponent: () => import('./views/suppliers/suppliers.component').then(m => m.SuppliersComponent),
  title: 'Nossos Fornecedores Parceiros — Fitoherb Nordeste'
}
```

---

## 2. Ações de Navegação

- Ao clicar no card de um fornecedor parceiro, a aplicação navega para `/produtos?supplier={slug}`, filtrando automaticamente todos os produtos daquela indústria ou marca parceira.
