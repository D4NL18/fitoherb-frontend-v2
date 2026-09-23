# Serviços — Módulo Admin

> **Data de criação:** 23/09/2026

---

## `ProductsService`

**Arquivo:** [`products.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/products/products.service.ts)

### Signals

| Signal | Descrição |
|--------|-----------|
| `adminProducts` | `PageResponse<ProductRes>` paginado para a tabela do admin |

### Métodos

```typescript
getPaginated(search, page, sortField, direction, categories, suppliers): void
// GET /products?search=&page=0&sortField=name&direction=ASC&category=...&supplier=...

create(productReq: ProductReq, image: File): Observable<void>
// POST /products (multipart/form-data: product + image)

update(slug: string, productReq: ProductReq, image: File | null): Observable<void>
// PUT /products/:slug (multipart/form-data)

delete(slug: string): Observable<void>
// DELETE /products/:slug

getProductsBySupplier(supplierSlug: string): Observable<PageResponse<ProductRes>>
// GET /products/gallery?supplier=:slug&size=100
```

---

## `SuppliersService`

**Arquivo:** [`suppliers.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/suppliers/suppliers.service.ts)

### Signals

| Signal | Descrição |
|--------|-----------|
| `paginatedSuppliers` | `PageResponse<SupplierRes>` para tabela do admin |
| `suppliers` | `SupplierRes[]` para dropdowns e filtros |

### Métodos

```typescript
getPaginated(search, page, sortField, direction): void
// GET /suppliers?search=&page=0&sortField=name&direction=ASC

create(supplierReq: SupplierReq, image: File): Observable<void>
// POST /suppliers (multipart/form-data)
// Após sucesso: chama getAll() automaticamente (tap)

update(slug: string, supplierReq: SupplierReq, image: File | null): Observable<void>
// PUT /suppliers/:slug

delete(slug: string, deleteProducts?: boolean): Observable<void>
// DELETE /suppliers/:slug?deleteProducts=true
// Após sucesso: chama getAll() automaticamente (tap)
```

---

## `ProductCategoriesService`

**Arquivo:** [`product-categories.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/product-categories/product-categories.service.ts)

### Signals

| Signal | Descrição |
|--------|-----------|
| `paginatedCategories` | `PageResponse<ProductCategoryRes>` para tabela |
| `productCategories` | `ProductCategoryRes[]` para dropdowns |

### Métodos

```typescript
getPaginated(search, page, sortField, direction): void
// GET /product_categories?...

create(categoryReq: ProductCategoryReq, image: File): Observable<void>
// POST /product_categories (multipart/form-data)
// Após sucesso: chama getAll() (tap)

update(slug, categoryReq, image): Observable<void>
// PUT /product_categories/:slug

delete(slug): Observable<void>
// DELETE /product_categories/:slug
// Após sucesso: chama getAll() (tap)
```

---

## `BannersService`

**Arquivo:** [`banners.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/banners/banners.service.ts)

### Signals

| Signal | Descrição |
|--------|-----------|
| `paginatedBanners` | `PageResponse<BannerRes>` para tabela |

### Métodos

```typescript
getPaginated(search, page, sortField, direction): void
// GET /banners?...

create(bannerReq: BannerReq, image: File): Observable<void>
// POST /banners (multipart/form-data)

update(id, bannerReq, image): Observable<void>
// PUT /banners/:id

delete(id): Observable<void>
// DELETE /banners/:id
```

---

## `UsersService`

**Arquivo:** [`users.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/users/users.service.ts)

### Signals

| Signal | Descrição |
|--------|-----------|
| `paginatedUsers` | `PageResponse<UserRes>` para tabela |

### Métodos

```typescript
getPaginated(search, page, sortField, direction): void
// GET /users?...

getByEmail(email: string): Observable<UserRes>
// GET /users/:email

update(email: string, userReq: UserReq): Observable<void>
// PUT /users/:email

updatePassword(email: string, passwordData: PasswordUpdateReq): Observable<void>
// PATCH /users/update-password/:email

delete(email: string): Observable<void>
// DELETE /users/:email
```

---

## `AuthService`

**Arquivo:** [`auth.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/auth/auth.service.ts)

### Métodos Utilizados no Admin

```typescript
register(registerData: RegisterReq): Observable<void>
// POST /auth/register — usado para criar novo usuário

logout(): void
// POST /auth/logout — limpa cookies e tokens
// Após sucesso OU erro: chama tokenService.removeToken()
```

---

## `TokenService`

**Arquivo:** [`token.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/token/token.service.ts)

### Métodos Utilizados no Admin

```typescript
getUserEmail(): string | null
// Lê o cookie 'fitoherb_user_email' — obtém email do usuário logado
```
