# Interfaces — Módulo Home

> **Data de criação:** 23/09/2026

---

## Interfaces Utilizadas

### `BannerRes`

```typescript
// src/app/types/banners/BannerRes.interface.ts
export interface BannerRes {
  id: string;           // UUID do banner
  title: string;        // Título do banner
  position: number;     // Ordem de exibição (menor = primeiro)
  active: boolean;      // Se deve ser exibido no carousel
  imagePath: string;    // Caminho da imagem (relativo ou absoluto)
  createdAt?: string;   // ISO 8601 de criação
  updatedAt?: string;   // ISO 8601 de atualização
}
```

### `ProductCategoryRes`

```typescript
// src/app/types/product-categories/productCategoriesRes.interface.ts
export interface ProductCategoryRes {
  name: string;       // Nome da categoria (ex: "Proteínas")
  slug: string;       // Identificador URL-friendly (ex: "proteinas")
  imageUrl: string;   // Caminho da imagem
  createdAt: string;  // ISO 8601
  count: number;      // Quantidade de produtos nessa categoria
}
```

### Exemplo de Response da API

```json
// GET /banners/active
[
  {
    "id": "uuid-1",
    "title": "Promoção de Inverno",
    "position": 1,
    "active": true,
    "imagePath": "/uploads/banners/banner-inverno.jpg",
    "createdAt": "2026-01-15T10:00:00Z"
  }
]

// GET /product_categories/get-all
[
  {
    "name": "Proteínas",
    "slug": "proteinas",
    "imageUrl": "/uploads/categories/proteinas.jpg",
    "createdAt": "2026-01-01T00:00:00Z",
    "count": 45
  }
]
```
