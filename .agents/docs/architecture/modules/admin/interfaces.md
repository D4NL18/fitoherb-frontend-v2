# Interfaces — Módulo Admin

> **Data de criação:** 23/09/2026

---

## `TableColumn`

```typescript
// src/app/views/admin/types/TableColumn.interface.ts
export interface TableColumn {
  label: string;                                            // Cabeçalho da coluna
  key: string;                                              // Chave do objeto de dado
  type: 'text' | 'image' | 'price' | 'badge' | 'actions' | 'stock'; // Tipo de renderização
  filterable?: boolean;                                     // Se mostra filtro na coluna
  filterOptions?: { label: string, value: string }[];       // Opções do filtro
}
```

### Tipos de Coluna

| Tipo | Renderização |
|------|-------------|
| `text` | Texto simples |
| `image` | Tag `<img>` com a URL do campo |
| `badge` | Pílula colorida (badge) |
| `actions` | Botões Editar / Excluir |
| `price` | Valor monetário formatado |
| `stock` | Indicador de estoque |

## `ProductReq`

```typescript
// src/app/types/products/ProductReq.interface.ts
export interface ProductReq {
  name: string;
  description?: string;
  categorySlug: string;    // Slug da categoria (não o nome)
  supplierSlug: string;    // Slug do fornecedor (não o nome)
  flavours?: string[];
}
```

## `ProductRes`

```typescript
export interface ProductRes {
  name: string;
  imageUrl: string;
  description?: string;
  flavours: string[];
  presentation?: string[];
  slug: string;
  category: ProductCategoryRes;
  supplier: SupplierRes;
  createdAt: string;
}
```

## `SupplierReq`

```typescript
// src/app/types/suppliers/SupplierReq.interface.ts
export interface SupplierReq {
  name: string;
  isHighlighted: boolean;
}
```

## `SupplierRes`

```typescript
export interface SupplierRes {
  name: string;
  slug: string;
  imageUrl: string;
  createdAt: string;
  isHighlighted: boolean;
  count: number;            // Número de produtos vinculados
}
```

## `ProductCategoryReq`

```typescript
// src/app/types/product-categories/productCategoriesReq.interface.ts
export interface ProductCategoryReq {
  name: string;
}
```

## `ProductCategoryRes`

```typescript
export interface ProductCategoryRes {
  name: string;
  slug: string;
  imageUrl: string;
  createdAt: string;
  count: number;
}
```

## `BannerReq`

```typescript
// src/app/types/banners/BannerReq.interface.ts
export interface BannerReq {
  title: string;
  position: number;   // Ordem de exibição (inteiro positivo)
  active: boolean;
}
```

## `BannerRes`

```typescript
export interface BannerRes {
  id: string;
  title: string;
  position: number;
  active: boolean;
  imagePath: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## `UserReq`

```typescript
// src/app/types/users/UserReq.interface.ts
export interface UserReq {
  name: string;
  role: 'ADMIN' | 'USER';
}
```

## `UserRes`

```typescript
// src/app/types/users/UserRes.interface.ts
export interface UserRes {
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}
```

## `RegisterReq`

```typescript
// src/app/types/auth/RegisterReq.interface.ts
// Usado para criação de usuário via AuthService.register()
export interface RegisterReq {
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}
```

## `PasswordUpdateReq`

```typescript
// src/app/types/users/PasswordUpdateReq.interface.ts
export interface PasswordUpdateReq {
  password: string;   // Nova senha
}
```

## `PageResponse<T>`

```typescript
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
```
