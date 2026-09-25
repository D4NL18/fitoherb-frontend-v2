# Interfaces — Módulo Suppliers

> **Data de criação:** 23/09/2026

---

## `SupplierRes`

```typescript
// src/app/types/suppliers/SupplierRes.interface.ts
export interface SupplierRes {
  name: string;           // Nome do fornecedor
  slug: string;           // Identificador URL-friendly
  imageUrl: string;       // Caminho da imagem (relativo ou absoluto)
  createdAt: string;      // ISO 8601 de criação
  isHighlighted: boolean; // Fornecedor em destaque (aparece primeiro)
  count: number;          // Quantidade de produtos desse fornecedor
}
```

### Exemplo de Response da API

```json
// GET /suppliers/get-all
[
  {
    "name": "Growth Supplements",
    "slug": "growth-supplements",
    "imageUrl": "/uploads/suppliers/growth.jpg",
    "createdAt": "2026-01-01T00:00:00Z",
    "isHighlighted": true,
    "count": 120
  },
  {
    "name": "Max Titanium",
    "slug": "max-titanium",
    "imageUrl": "/uploads/suppliers/max-titanium.jpg",
    "createdAt": "2026-02-01T00:00:00Z",
    "isHighlighted": false,
    "count": 87
  }
]
```
