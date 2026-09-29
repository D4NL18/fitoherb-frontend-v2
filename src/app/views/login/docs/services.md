# Serviços — Módulo Login

> **Data de criação:** 23/09/2026

---

## `AuthService`

**Arquivo:** [`auth.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/auth/auth.service.ts)

### Método

```typescript
login(loginData: LoginReq): Observable<LoginRes>
```

- **Endpoint:** `POST /auth/login`
- Após sucesso: chama `tokenService.saveToken(res.token, loginData.rememberMe)` via `tap()`
- Retorna `Observable<LoginRes>` — o componente faz o `subscribe`

### Exemplo de Uso

```typescript
this.authService.login({ email, password, rememberMe }).subscribe({
  next: () => this.router.navigate(['/admin']),
  error: (err) => { /* trata erros */ }
});
```

---

## `TokenService`

**Arquivo:** [`token.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/token/token.service.ts)

### Método Utilizado no Login

```typescript
isAuthenticated(): boolean
```

- Retorna `true` se o cookie `fitoherb_token` **OU** `fitoherb_user_email` estiver presente
- Usado no `ngOnInit` do `LoginComponent` para redirecionar usuários já logados

### Método Chamado Internamente pelo AuthService

```typescript
saveToken(token: string, rememberMe: boolean = false): void
```

- Armazena o JWT no cookie `fitoherb_token`
- `rememberMe=true`: adiciona `max-age=2592000` (30 dias)
- `rememberMe=false`: cookie de sessão (sem `max-age`)
