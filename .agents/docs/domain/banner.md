# Modelagem de Domínio: Banners

Este documento reflete a modelagem de domínio atual baseada nos tipos TypeScript (`src/app/types/banners/`).

### `BannerReq`
- `title`: string
- `position`: number
- `active`: boolean

### `BannerRes`
- `id`: string
- `title`: string
- `position`: number
- `active`: boolean
- `imagePath`: string
- `createdAt?`: string
- `updatedAt?`: string
