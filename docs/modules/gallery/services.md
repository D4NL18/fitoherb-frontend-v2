# Serviços — Módulo Gallery

> **Data de criação:** 23/09/2026

---

## `ProductsService`

**Arquivo:** [`products.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/products/products.service.ts)

### Signals Públicos

| Signal | Tipo | Descrição |
|--------|------|-----------|
| `productGallery` | `Signal<PageResponse<ProductRes>>` | Estado da galeria pública |
| `isGalleryLoading` | `Signal<boolean>` | Loading da galeria |

### Método Principal

```typescript
getGallery(params: any, append: boolean = false, onSuccess?: () => void): void
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `params` | `object` | Filtros: `search`, `category[]`, `supplier[]`, `page`, `size` |
| `append` | `boolean` | `true` = concatena com conteúdo existente (infinite scroll) |
| `onSuccess` | `() => void` | Callback após sucesso (usado pela navegação do modal) |

**Endpoint:** `GET /products/gallery`

---

## `ProductCategoriesService`

**Arquivo:** [`product-categories.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/product-categories/product-categories.service.ts)

### Signal Utilizado

| Signal | Tipo | Descrição |
|--------|------|-----------|
| `productCategories` | `Signal<ProductCategoryRes[]>` | Lista completa para o painel de filtros |

### Método

```typescript
getAll(): void
```
**Endpoint:** `GET /product_categories/get-all`

---

## `SuppliersService`

**Arquivo:** [`suppliers.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/suppliers/suppliers.service.ts)

### Signal Utilizado

| Signal | Tipo | Descrição |
|--------|------|-----------|
| `suppliers` | `Signal<SupplierRes[]>` | Lista completa para o painel de filtros |

### Método

```typescript
getAll(): void
```
**Endpoint:** `GET /suppliers/get-all`
