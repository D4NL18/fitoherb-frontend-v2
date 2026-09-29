# Componentes — Módulo Login

> **Data de criação:** 23/09/2026

---

## `LoginComponent`

**Seletor:** `app-login`  
**Arquivo:** [`login.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/login/login.component.ts)

### Propriedades (ngModel)

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `email` | `string` | Campo de e-mail (two-way binding com ngModel) |
| `password` | `string` | Campo de senha |
| `rememberMe` | `boolean` | Checkbox "Lembrar-me" |

### Signals

| Signal | Tipo | Descrição |
|--------|------|-----------|
| `isLoading` | `Signal<boolean>` | Requisição de login em andamento |
| `errorMessage` | `Signal<string>` | Mensagem de erro atual |
| `errorStatus` | `Signal<number>` | Status HTTP do erro |
| `modalResponseOpen` | `Signal<boolean>` | Modal de erro aberto |

### Métodos Públicos

| Método | Descrição |
|--------|-----------|
| `onSubmit()` | Valida campos e chama `AuthService.login()` |
| `onCloseModalResponse()` | Fecha o modal e limpa o estado de erro |

### Lifecycle

- `ngOnInit`: verifica autenticação e redireciona para `/admin` se já logado

### Sub-componentes Utilizados

```typescript
imports: [FormsModule, InputComponent, ButtonComponent, ModalResponseComponent]
```

| Componente | Uso |
|------------|-----|
| `InputComponent` | Campos email e senha (com toggle de visibilidade) |
| `ButtonComponent` | Botão "Entrar" com `[loading]="isLoading()"` |
| `ModalResponseComponent` | Exibe erros de autenticação |
