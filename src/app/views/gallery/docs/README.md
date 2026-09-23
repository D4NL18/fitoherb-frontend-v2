# Módulo Gallery — Visão Geral

> **Data de criação:** 23/09/2026  
> **Rota:** `/produtos`  
> **Componente principal:** [`GalleryComponent`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/gallery/gallery.component.ts)

---

## Resumo

Catálogo de produtos da Fitoherb com sistema de filtros por categoria e fornecedor, busca textual com debounce de 1 segundo, infinite scroll automático e modal de detalhes com navegação prev/next entre produtos.

## Funcionalidades

- **Filtros por categoria** — multi-seleção, reflete nos query params da URL
- **Filtros por fornecedor** — dropdown com multi-seleção, reflete nos query params
- **Busca textual** — debounce de 1000ms + distinctUntilChanged
- **Infinite scroll** — IntersectionObserver no `#scrollAnchor`
- **Modal de detalhes** — abre ao clicar em um card, com navegação prev/next
- **Skeleton loader** — exibido enquanto `isGalleryLoading` é `true`
- **Limpar filtros** — reseta busca, categorias e fornecedores

## Sub-componentes

```
GalleryComponent
├── InputComponent              ← campo de busca
├── SelectComponent             ← dropdowns de filtro
├── ItemCardGalleryComponent    ← card individual de produto
├── ModalGalleryComponent       ← modal de detalhes do produto
└── SkeletonCardComponent       ← placeholder de carregamento
```

## Dependências de Serviços

- `ProductsService` — galeria paginada, append mode para infinite scroll
- `ProductCategoriesService` — lista de categorias para filtro
- `SuppliersService` — lista de fornecedores para filtro
