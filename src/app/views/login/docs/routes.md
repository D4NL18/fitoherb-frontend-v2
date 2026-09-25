# Rotas do Módulo Login e Autenticação — Fitoherb Frontend

> **Path Principal:** `/login`  
> **Componente:** `LoginComponent` (`src/app/views/login/login.component.ts`)  
> **Acesso:** Aberto (Usuários já autenticados são redirecionados automaticamente para `/admin`)  
> **Layout:** Layout Focado / Minimalista (`NavComponent` e `FooterComponent` ocultados dinamicamente)

---

## 1. Configuração da Rota (`app.routes.ts`)

```typescript
{
  path: 'login',
  loadComponent: () => import('./views/login/login.component').then(m => m.LoginComponent),
  title: 'Acesso Restrito — Fitoherb Nordeste'
}
```

---

## 2. Redirecionamentos e Proteção

- **Pós-Login Bem-Sucedido:** Armazena o token JWT no `localStorage` via `TokenService` e redireciona para `/admin` via `Router.navigate(['/admin'])`.
- **Tentativa de Acesso Logado:** Se `TokenService.hasValidToken()` retornar true, o usuário é direcionado imediatamente ao Dashboard administrativo.
