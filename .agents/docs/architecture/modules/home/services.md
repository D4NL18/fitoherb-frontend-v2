# Serviços — Módulo Home

> **Data de criação:** 23/09/2026

---

## `BannersService`

**Arquivo:** [`banners.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/banners/banners.service.ts)  
**Utilizado por:** `BannerCarouselComponent`

### Signals Públicos

| Signal | Tipo | Descrição |
|--------|------|-----------|
| `activeBanners` | `Signal<BannerRes[]>` | Banners ativos (para o carousel) |
| `isLoading` | `Signal<boolean>` | Estado de carregamento dos banners ativos |

### Método Utilizado no Home

```typescript
getActive(): void
```

Busca banners com `active: true` via `GET /banners/active`.  
Atualiza `activeBannersState` e `isLoadingState`.

---

## `ProductCategoriesService`

**Arquivo:** [`product-categories.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/product-categories/product-categories.service.ts)  
**Utilizado por:** `HomeComponent`

### Signal Público

| Signal | Tipo | Descrição |
|--------|------|-----------|
| `productCategories` | `Signal<ProductCategoryRes[]>` | Todas as categorias |

### Método Utilizado no Home

```typescript
getAll(): void
```

Busca todas as categorias via `GET /product_categories/get-all`.  
Atualiza `categoryState` (signal interno).
