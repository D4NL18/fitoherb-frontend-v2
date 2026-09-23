# Regras de Negócio — Módulo Login

> **Data de criação:** 23/09/2026

---

## Redirecionamento Automático

1. Se o usuário acessa `/login` **já autenticado** (`tokenService.isAuthenticated()` retorna `true`), é redirecionado para `/admin` no `ngOnInit`
2. Após login bem-sucedido, o redirecionamento para `/admin` usa `router.navigate(['/admin']).then(success => ...)` — caso o redirecionamento falhe, exibe modal de erro

## Validação

1. Validação **client-side simples**: verifica se email e senha não estão vazios antes de enviar
2. Não há validação de formato de e-mail client-side no formulário de login (usa FormsModule com ngModel direto, não ReactiveFormsModule)
3. Se campos estiverem vazios: modal com "Preencha todos os campos corretamente." (status 400)

## Lembrar-me

1. Checkbox "Lembrar-me" (`rememberMe: boolean`)
2. **Sem lembrar-me**: cookie de sessão (sem `max-age`) — expira ao fechar o browser
3. **Com lembrar-me**: cookie com `max-age=2592000` (30 dias)

## Tratamento de Erros por Status

| Status | Causa | Mensagem |
|--------|-------|---------|
| `0` | Servidor offline / sem rede | "Não foi possível conectar ao servidor. Verifique sua conexão." |
| `400` | Credenciais malformadas | "Usuário ou senha incorretos." |
| `401` | Credenciais inválidas | "Usuário ou senha incorretos." |
| `403` | Acesso negado | "Usuário ou senha incorretos." |
| Outros | Erro genérico | `backendError.message` ou "Erro inesperado no servidor." |

## Layout

1. Nav e Footer são **ocultados** — `AppComponent` detecta URL `/login` e define `showLayout = false`
2. O formulário ocupa a tela completa sem compensação de `padding-top` (sem `.main-content`)
