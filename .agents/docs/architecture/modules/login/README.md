# Módulo Login — Visão Geral

> **Data de criação:** 23/09/2026  
> **Rota:** `/login`  
> **Componente principal:** [`LoginComponent`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/login/login.component.ts)

---

## Resumo

Página de autenticação JWT para acesso ao painel administrativo. Sem Nav e Footer. Se o usuário já estiver autenticado ao acessar `/login`, é redirecionado automaticamente para `/admin`.

## Campos do Formulário

| Campo | Tipo | Validação |
|-------|------|-----------|
| E-mail | `string` | Required (validação no submit) |
| Senha | `string` | Required (validação no submit) |
| Lembrar-me | `boolean` | — |

## Fluxo de Login

```
1. Usuário preenche email + senha e clica em "Entrar"
2. Validação client-side: campos obrigatórios
3. AuthService.login({ email, password, rememberMe })
4. POST /auth/login → LoginRes { token }
5. TokenService.saveToken(token, rememberMe)
   ├── rememberMe=true  → cookie com max-age=2592000 (30 dias)
   └── rememberMe=false → cookie de sessão
6. router.navigate(['/admin'])
```

## Tratamento de Erros

| Status HTTP | Mensagem Exibida |
|-------------|-----------------|
| `0` (offline) | "Não foi possível conectar ao servidor. Verifique sua conexão." |
| `400`, `401`, `403` | "Usuário ou senha incorretos." |
| Outros | Mensagem do backend ou "Erro inesperado no servidor." |

## Sub-componentes

```
LoginComponent
├── InputComponent          ← email, senha
├── ButtonComponent         ← botão entrar
└── ModalResponseComponent  ← modal de erro
```

## Dependências de Serviços

- `AuthService.login()` — autenticação JWT
- `TokenService.isAuthenticated()` — verificação de sessão ativa no `ngOnInit`
