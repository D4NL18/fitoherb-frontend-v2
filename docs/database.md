# Descritivo de Banco de Dados e Modelos de Dados — Fitoherb Frontend v2

> **Data de criação:** 23/09/2026  
> **Banco de Dados:** PostgreSQL 16  
> **Camada Client-Side:** TypeScript 5.5 Interfaces (`src/app/types/`)

---

## 1. Visão Geral da Modelagem de Dados

O frontend consome as representações serializadas em JSON das entidades gerenciadas pelo banco relacional PostgreSQL do backend. As interfaces TypeScript garantem segurança de tipos (Type-Safety) tanto nos formulários de envio (`*Req.interface.ts`) quanto na recepção de dados estruturados (`*Res.interface.ts`).

---

## 2. Diagrama Entidade-Relacionamento (Conceitual)

```
┌──────────────────┐           1:N          ┌──────────────────────┐
│  product_category│◄───────────────────────┤       products       │
├──────────────────┤                        ├──────────────────────┤
│ id (UUID)        │                        │ id (UUID)            │
│ name             │                        │ name                 │
│ slug (UNIQUE)    │                        │ slug (UNIQUE)        │
│ image_path       │                        │ image_path           │
└──────────────────┘                        │ description (TEXT)   │
                                            │ flavours (ARRAY)     │
┌──────────────────┐           1:N          │ presentation (ARRAY) │
│    suppliers     │◄───────────────────────┤ category_id (FK)     │
├──────────────────┤                        │ supplier_id (FK)     │
│ id (UUID)        │                        └──────────────────────┘
│ name             │
│ slug (UNIQUE)    │
│ image_path       │
│ is_highlighted   │
└──────────────────┘

┌──────────────────┐                        ┌──────────────────────┐
│      users       │                        │       banners        │
├──────────────────┤                        ├──────────────────────┤
│ id (UUID)        │                        │ id (UUID)            │
│ email (UNIQUE)   │                        │ title                │
│ name             │                        │ image_path           │
│ password (HASH)  │                        │ is_active (BOOLEAN)  │
│ role (ADMIN/USER)│                        │ position (INTEGER)   │
└──────────────────┘                        └──────────────────────┘
```

---

## 3. Mapeamento de Entidades para Interfaces TypeScript

### 3.1 Produtos (`products`)

**Tabela Relacional (Backend):** `products`  
**Interface de Resposta (Frontend):** `src/app/types/products/productRes.interface.ts`
```typescript
export interface ProductRes {
  name: string;
  imageUrl: string;
  description: string;
  flavours: string[];
  presentation: string[];
  slug: string;
  category: ProductCategoryRes;
  supplier: SupplierRes;
  createdAt: string;
}
```

**Interface de Requisição (Formulário / Payload):** `src/app/types/products/ProductReq.interface.ts`
```typescript
export interface ProductReq {
  name: string;
  description?: string;
  categorySlug: string;
  supplierSlug: string;
  flavours?: string[];
  presentation?: string[];
}
```

---

### 3.2 Categorias de Produtos (`product_categories`)

**Tabela Relacional (Backend):** `product_categories`  
**Interface de Resposta:** `src/app/types/product-categories/productCategoriesRes.interface.ts`
```typescript
export interface ProductCategoryRes {
  name: string;
  imageUrl: string;
  slug: string;
}
```

**Interface de Requisição:** `src/app/types/product-categories/productCategoriesReq.interface.ts`
```typescript
export interface ProductCategoryReq {
  name: string;
}
```

---

### 3.3 Fornecedores Parceiros (`suppliers`)

**Tabela Relacional (Backend):** `suppliers`  
**Interface de Resposta:** `src/app/types/suppliers/SupplierRes.interface.ts`
```typescript
export interface SupplierRes {
  name: string;
  imageUrl: string;
  slug: string;
  isHighlighted: boolean;
}
```

**Interface de Requisição:** `src/app/types/suppliers/SupplierReq.interface.ts`
```typescript
export interface SupplierReq {
  name: string;
  isHighlighted?: boolean;
}
```

---

### 3.4 Usuários e Permissões (`users`)

**Tabela Relacional (Backend):** `users`  
**Interface de Resposta:** `src/app/types/users/UserRes.interface.ts`
```typescript
export interface UserRes {
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}
```

**Interface de Requisição:** `src/app/types/users/UserReq.interface.ts`
```typescript
export interface UserReq {
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}
```

---

### 3.5 Banners da Home (`banners`)

**Tabela Relacional (Backend):** `banners`  
**Interface de Resposta:** `src/app/types/banners/BannerRes.interface.ts`
```typescript
export interface BannerRes {
  id: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  position: number;
}
```

---

## 4. Paginação Padrão Spring Data (`PageResponse<T>`)

Todas as coleções volumosas retornadas pelo banco PostgreSQL são envelopadas na interface genérica:
```typescript
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
```
Isso permite que os componentes de tabela (`dynamic-table.component.ts`) e galeria (`gallery.component.ts`) façam controle preciso de página anterior, próxima página e contagem total de registros.
