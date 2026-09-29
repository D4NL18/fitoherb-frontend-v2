# Interfaces — Módulo Gallery

> **Data de criação:** 23/09/2026

---

## `ProductRes`

```typescript
// src/app/types/products/productRes.interface.ts
export interface ProductRes {
  name: string;                       // Nome do produto
  imageUrl: string;                   // Caminho da imagem
  description?: string;               // Descrição (opcional)
  flavours: string[];                 // Sabores disponíveis
  presentation?: string[];            // Formas de apresentação (optional)
  slug: string;                       // Identificador URL-friendly
  category: ProductCategoryRes;       // Categoria do produto (objeto)
  supplier: SupplierRes;              // Fornecedor do produto (objeto)
  createdAt: string;                  // ISO 8601
}
```

## `ProductCategoryRes`

```typescript
export interface ProductCategoryRes {
  name: string;
  slug: string;
  imageUrl: string;
  createdAt: string;
  count: number;   // Quantidade de produtos nessa categoria
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
  count: number;   // Quantidade de produtos desse fornecedor
}
```

## `PageResponse<T>`

```typescript
// src/app/types/page-response.interface.ts
export interface PageResponse<T> {
  content: T[];           // Array de itens da página atual
  totalPages: number;     // Total de páginas
  totalElements: number;  // Total de registros
  size: number;           // Tamanho da página
  number: number;         // Número da página atual (0-indexed)
  first: boolean;         // É a primeira página?
  last: boolean;          // É a última página?
  empty: boolean;         // Não há resultados?
}
```

### Exemplo de Response da API

```json
// GET /products/gallery?page=0&size=16&category=proteinas
{
  "content": [
    {
      "name": "Whey Protein 1kg",
      "imageUrl": "/uploads/products/whey-1kg.jpg",
      "description": "Proteína de alta qualidade...",
      "flavours": ["Baunilha", "Chocolate", "Morango"],
      "presentation": ["1kg", "2kg", "900g"],
      "slug": "whey-protein-1kg",
      "category": {
        "name": "Proteínas",
        "slug": "proteinas",
        "imageUrl": "/uploads/categories/proteinas.jpg",
        "createdAt": "2026-01-01T00:00:00Z",
        "count": 45
      },
      "supplier": {
        "name": "Growth Supplements",
        "slug": "growth-supplements",
        "imageUrl": "/uploads/suppliers/growth.jpg",
        "createdAt": "2026-01-01T00:00:00Z",
        "isHighlighted": true,
        "count": 120
      },
      "createdAt": "2026-03-10T14:00:00Z"
    }
  ],
  "totalPages": 5,
  "totalElements": 75,
  "size": 16,
  "number": 0,
  "first": true,
  "last": false,
  "empty": false
}
```
