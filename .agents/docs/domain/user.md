# Modelagem de Domínio: Users

Este documento reflete a modelagem de domínio atual baseada nos tipos TypeScript (`src/app/types/users/`).

### `UserReq`
- `name`: string
- `role`: `'ADMIN' | 'USER'`

### `UserRes`
- `name`: string
- `email`: string
- `role`: `'ADMIN' | 'USER'`
- `createdAt`: string (Data/Hora)

### `PasswordUpdateReq`
- `password`: string
