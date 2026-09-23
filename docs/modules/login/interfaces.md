# Interfaces — Módulo Login

> **Data de criação:** 23/09/2026

---

## `LoginReq`

```typescript
// src/app/types/auth/LoginReq.interface.ts
export interface LoginReq {
  email?: string;
  password?: string;
  rememberMe?: boolean;  // Se true: cookie com max-age de 30 dias
}
```

## `LoginRes`

```typescript
// src/app/types/auth/LoginRes.interface.ts
export interface LoginRes {
  token: string;  // JWT de acesso
}
```

## `AuthError`

```typescript
// src/app/types/auth/AuthError.interface.ts
export interface AuthError {
  status: number;
  message: string;
  errors?: { [key: string]: string };  // Campos com erros (ex: campo inválido)
}
```

### Exemplo de Request/Response

```json
// POST /auth/login — Request
{
  "email": "admin@fitoherb.com.br",
  "password": "Senha@123",
  "rememberMe": true
}

// POST /auth/login — Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// POST /auth/login — Response 401
{
  "status": 401,
  "message": "Credenciais inválidas."
}
```
