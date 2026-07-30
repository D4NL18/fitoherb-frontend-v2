# Modelagem de Domínio: Products

Este documento reflete a modelagem de domínio atual baseada nos tipos TypeScript (`src/app/types/products/`).

### `ProductReq`
- `name`: string
- `description?`: string
- `categorySlug`: string
- `supplierSlug`: string
- `flavours?`: string[]

### `ProductRes`
- `name`: string
- `imageUrl`: string
- `description?`: string
- `flavours`: string[]
- `slug`: string
- `category`: `ProductCategoryRes` (Objeto aninhado)
- `supplier`: `SupplierRes` (Objeto aninhado)
- `createdAt`: string
