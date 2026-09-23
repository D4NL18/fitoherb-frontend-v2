# Módulo Suppliers — Visão Geral

> **Data de criação:** 23/09/2026  
> **Rota:** `/fornecedores`  
> **Componente principal:** [`SuppliersComponent`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/suppliers/suppliers.component.ts)

---

## Resumo

Página de vitrine dos fornecedores parceiros da Fitoherb. Exibe um grid com imagens e nomes de todos os fornecedores, priorizando os destacados (`isHighlighted`). Clicar em um fornecedor navega para o catálogo filtrado por aquele fornecedor.

## Funcionalidades

- **Ordenação por destaque** — fornecedores com `isHighlighted: true` aparecem primeiro (computed client-side)
- **Normalização de URLs de imagem** — URLs relativas são prefixadas com `environment.imagesBaseUrl`
- **Animação de entrada** — IntersectionObserver com threshold 0 no grid
- **Navegação para catálogo** — clique navega para `/produtos?supplier=<slug>`

## Dependências de Serviços

- `SuppliersService.getAll()` — lista completa de fornecedores

## Comportamento do Grid

```typescript
public sortedSuppliers = computed(() => {
  return [...this.supplierService.suppliers()]
    .sort((a, b) => {
      if (a.isHighlighted && !b.isHighlighted) return -1;
      if (!a.isHighlighted && b.isHighlighted) return 1;
      return 0;
    })
    .map(s => { /* normaliza imageUrl */ });
});
```
