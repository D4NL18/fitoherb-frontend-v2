# Modelagem de Domínio: Auth

Este documento reflete a modelagem de domínio atual baseada nos tipos TypeScript (`src/app/types/auth/`).

### `LoginReq`
- `email`: string
- `password`: string

### `LoginRes`
- `token`: string (JWT)

### `RegisterReq`
- `name`: string
- `email`: string
- `role`: `'ADMIN' | 'USER'`

### `AuthError`
- `status`: number
- `message`: string
- `errors?`: `{ [key: string]: string }`
