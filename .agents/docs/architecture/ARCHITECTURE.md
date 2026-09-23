# Arquitetura — Fitoherb Frontend v2

> **Data de criação:** 23/09/2026  
> **Versão:** Angular 18.2 · TypeScript 5.5

---

## Diagrama de Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│                          BROWSER                                 │
├─────────────────────────────────────────────────────────────────┤
│  VIEWS (src/app/views/)                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌───────┐ │
│  │   Home   │ │  About   │ │ Gallery  │ │Suppliers│ │Contact│ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────┘ └───────┘ │
│  ┌──────────┐ ┌──────────────────────────────────────────────┐  │
│  │  Login   │ │ Admin (DynamicTable + Modais + AdminNav)     │  │
│  └──────────┘ └──────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  SHARED COMPONENTS (src/app/shared/)                             │
│  button · input · select · textarea · nav · footer              │
│  modal-response · skeleton-card · toast                         │
├─────────────────────────────────────────────────────────────────┤
│  SERVICES (src/app/services/)                                    │
│  auth · token · products · product-categories                   │
│  suppliers · users · mail · banners                             │
├─────────────────────────────────────────────────────────────────┤
│  CORE (src/app/core/)                                            │
│  guards/auth.guard · interceptors/auth.interceptor              │
├─────────────────────────────────────────────────────────────────┤
│  TYPES (src/app/types/)                                          │
│  auth · products · product-categories · suppliers               │
│  users · banners · mail · page-response.interface               │
├─────────────────────────────────────────────────────────────────┤
│  ENVIRONMENTS (src/environments/)                                │
│  environment.ts (prod) · environment.development.ts (dev)       │
└─────────────────────────────────────────────────────────────────┘
                          │  HTTP + Bearer JWT
                          ▼
              ┌───────────────────────┐
              │  Fitoherb Backend v2  │
              │  (Spring Boot REST)   │
              └───────────────────────┘
```

---

## Padrões Adotados

### 1. Standalone Components

Todos os componentes são `standalone: true` — não há `NgModules` na aplicação. Cada componente declara suas próprias dependências via `imports: []`.

```typescript
@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, SelectComponent, ...],
  templateUrl: './gallery.component.html',
})
export class GalleryComponent { ... }
```

### 2. Angular Signals como State Management

O estado da aplicação é gerenciado inteiramente via **Signals** do Angular, sem NgRx ou outro gerenciador externo.

- **Signals privados** (writable) ficam dentro do serviço
- **Signals públicos** são expostos como `readonly` (`.asReadonly()`)
- **Computed signals** derivam estado de outros signals

```typescript
// Dentro do serviço
private productGalleryState = signal<PageResponse<ProductRes>>({ ... });
public productGallery = this.productGalleryState.asReadonly();

// No componente
products = this.productsService.productGallery; // Signal readonly
```

### 3. ControlValueAccessor (CVA) nos Formulários

Os componentes `InputComponent`, `SelectComponent` e `TextareaComponent` implementam `ControlValueAccessor`, permitindo integração nativa com `ReactiveForms` e `ngModel`.

```typescript
@Component({ providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true }] })
export class InputComponent implements ControlValueAccessor { ... }
```

### 4. Functional Guards e Interceptors

Guards e interceptors seguem a API funcional do Angular 17+:

```typescript
// Guard funcional
export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  return tokenService.isAuthenticated() ? true : (router.navigate(['/login']), false);
};

// Interceptor funcional
export const authInterceptor: HttpInterceptorFn = (req, next) => { ... };
```

### 5. Injeção via `inject()`

Toda injeção de dependência é feita via `inject()` funcional (sem construtor), seguindo o estilo moderno do Angular:

```typescript
private router = inject(Router);
private authService = inject(AuthService);
private fb = inject(FormBuilder);
```

### 6. Lazy Layout (Nav/Footer Condicionais)

O `AppComponent` escuta eventos de roteamento e oculta `<app-nav>` e `<app-footer>` nas rotas `/login` e `/admin`:

```typescript
private hideLayoutRoutes = ['/login', '/admin'];

constructor() {
  this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
    this.showLayout.set(!this.hideLayoutRoutes.some(r => this.router.url.startsWith(r)));
  });
}
```

---

## Fluxo de Autenticação

```
Usuário acessa /admin
        │
        ▼
  authGuard.canActivate()
        │
        ├─ tokenService.isAuthenticated() == false
        │         │
        │         └──► router.navigate(['/login']) ── FIM
        │
        ├─ isAuthenticated() == true
        │         │
        │         ▼
        │  Componente carregado
        │         │
        │  (Qualquer requisição HTTP)
        │         │
        │         ▼
        │  authInterceptor (HttpInterceptorFn)
        │         │
        │         ├─ Adiciona withCredentials: true (cookies)
        │         ├─ Adiciona header Authorization: Bearer <token>
        │         │
        │         ▼
        │  Resposta HTTP
        │         │
        │         ├─ Status 200-299 ── Sucesso
        │         │
        │         └─ Status 401 + não é /refresh nem /login
        │                   │
        │                   ├─ isRefreshing == false
        │                   │         │
        │                   │         ▼
        │                   │   authService.refreshToken() POST /auth/refresh
        │                   │         │
        │                   │         ├─ Sucesso: retry da requisição original
        │                   │         │
        │                   │         └─ Erro: tokenService.removeToken()
        │                   │                  router.navigate(['/login'])
        │                   │
        │                   └─ isRefreshing == true
        │                             │
        │                             └─ Aguarda refreshTokenSubject e retry
        └──────────────────────────────────────────────────────
```

### Token Storage (Cookie-based)

| Mecanismo | Descrição |
|-----------|-----------|
| Cookie `fitoherb_token` | JWT de acesso — opcional `max-age=2592000` (30 dias) se `rememberMe` |
| Cookie `fitoherb_user_email` | E-mail do usuário logado — gerenciado pelo backend |
| `isAuthenticated()` | Retorna `true` se qualquer um dos dois cookies existir |

---

## Integração com o Backend

| Ambiente | `apiUrl` | `imagesBaseUrl` |
|----------|----------|-----------------|
| Desenvolvimento | `http://localhost:8080` | `http://localhost:8080` |
| Produção | `https://fitoherb-backend-nkrtrtj5hq-uc.a.run.app` | `https://fitoherb-backend-nkrtrtj5hq-uc.a.run.app` |

- Todas as requisições HTTP usam `provideHttpClient(withInterceptors([authInterceptor]))`
- O `authInterceptor` injeta automaticamente `withCredentials: true` e o `Bearer token`
- Imagens armazenadas no backend são referenciadas por caminhos relativos; o frontend prefixo com `environment.imagesBaseUrl`

---

## Configuração do Roteador

```typescript
provideRouter(
  routes,
  withInMemoryScrolling({
    scrollPositionRestoration: 'enabled',  // Restaura posição ao voltar
    anchorScrolling: 'enabled',            // Suporte a âncoras #
  }),
)
```

---

## Estrutura de Diretórios

```
src/
├── app/
│   ├── app.component.ts          ← Shell com nav/footer condicionais
│   ├── app.config.ts             ← Providers globais (router, http, interceptor)
│   ├── app.routes.ts             ← Definição de todas as rotas
│   ├── core/
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   └── interceptors/
│   │       └── auth.interceptor.ts
│   ├── services/
│   │   ├── auth/auth.service.ts
│   │   ├── banners/banners.service.ts
│   │   ├── mail/mail.service.ts
│   │   ├── product-categories/product-categories.service.ts
│   │   ├── products/products.service.ts
│   │   ├── suppliers/suppliers.service.ts
│   │   ├── token/token.service.ts
│   │   └── users/users.service.ts
│   ├── shared/
│   │   ├── button/
│   │   ├── footer/
│   │   ├── input/
│   │   ├── modal-response/
│   │   ├── nav/
│   │   ├── select/
│   │   ├── skeleton-card/
│   │   ├── textarea/
│   │   └── toast/
│   ├── types/
│   │   ├── auth/
│   │   ├── banners/
│   │   ├── mail/
│   │   ├── page-response.interface.ts
│   │   ├── product-categories/
│   │   ├── products/
│   │   ├── suppliers/
│   │   └── users/
│   └── views/
│       ├── about/
│       ├── admin/
│       │   ├── components/
│       │   │   ├── admin-nav/
│       │   │   ├── dynamic-table/
│       │   │   ├── modal-confirm/
│       │   │   ├── modal-entity/
│       │   │   └── table-filter/
│       │   └── types/
│       ├── contact/
│       ├── gallery/
│       │   └── components/
│       │       ├── item-card-gallery/
│       │       └── modal-gallery/
│       ├── home/
│       │   └── components/
│       │       └── banner-carousel/
│       ├── login/
│       └── suppliers/
├── environments/
│   ├── environment.ts
│   └── environment.development.ts
├── colors.scss
└── styles.scss
```
