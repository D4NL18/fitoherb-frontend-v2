# Mapa de Rotas — Fitoherb Frontend v2

> **Data de criação:** 23/09/2026  
> **Arquivo fonte:** [`app.routes.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/app.routes.ts)

---

## Tabela de Rotas

| Path | Componente | Título da Aba | Proteção | Query Params Aceitos | Comportamento |
|------|-----------|---------------|----------|---------------------|---------------|
| `/` | `HomeComponent` | `Home - Fitoherb` | Nenhuma | — | Página inicial com carousel, categorias, seção sobre e CTA. `pathMatch: 'full'` |
| `/quem-somos` | `AboutComponent` | `Quem Somos - Fitoherb` | Nenhuma | — | Página institucional com história, MVV e KPIs animados |
| `/produtos` | `GalleryComponent` | `Produtos - Fitoherb` | Nenhuma | `category`, `supplier` | Catálogo com filtros via query params e infinite scroll |
| `/fornecedores` | `SuppliersComponent` | `Fornecedores - Fitoherb` | Nenhuma | — | Grid de fornecedores ordenados por destaque |
| `/contato` | `ContactComponent` | `Contato - Fitoherb` | Nenhuma | — | Formulário de contato com envio de e-mail |
| `/login` | `LoginComponent` | `Login - Fitoherb` | Redireciona para `/admin` se já autenticado | — | Formulário de login JWT |
| `/admin` | `AdminComponent` | `Admin - Fitoherb` | `authGuard` (CanActivateFn) | — | Painel CRUD completo |

---

## Detalhes por Rota

### `/` — Home

```typescript
{
  path: '',
  component: HomeComponent,
  title: 'Home - Fitoherb',
  pathMatch: 'full',
}
```

- Renderiza `<app-nav>` e `<app-footer>` (showLayout = true)
- `BannerCarouselComponent` busca banners ativos via `BannersService.getActive()`
- Categorias carregadas via `ProductCategoriesService.getAll()`
- Navegação para `/produtos?category=<slug>` ao clicar em categoria

---

### `/quem-somos` — Sobre

```typescript
{
  path: 'quem-somos',
  component: AboutComponent,
  title: 'Quem Somos - Fitoherb',
}
```

- Animações de entrada via `IntersectionObserver` (threshold: 0.3)
- KPIs animados: 28 anos, 1800 produtos, 2000 parceiros, 40 marcas

---

### `/produtos` — Galeria

```typescript
{
  path: 'produtos',
  component: GalleryComponent,
  title: 'Produtos - Fitoherb',
}
```

#### Query Parameters

| Parâmetro | Tipo | Exemplo | Descrição |
|-----------|------|---------|-----------|
| `category` | `string \| string[]` | `?category=proteinas` | Filtra por slug de categoria (multi-valor) |
| `supplier` | `string \| string[]` | `?supplier=growth&supplier=max-titanium` | Filtra por slug de fornecedor (multi-valor) |

#### Comportamento
- Ao entrar na rota, `queryParams` são lidos e aplicados automaticamente
- URL é atualizada via `location.replaceState()` ao alterar filtros (sem push de history)
- Infinite scroll via `IntersectionObserver` no elemento `#scrollAnchor`
- Busca com `debounceTime(1000)` e `distinctUntilChanged()`
- Tamanho de página calculado pelo número de colunas do grid (mínimo 1, padrão 16)
- Botão "Voltar ao topo" aparece após 300px de scroll (visível somente em `/produtos`)

---

### `/fornecedores` — Fornecedores

```typescript
{
  path: 'fornecedores',
  component: SuppliersComponent,
  title: 'Fornecedores - Fitoherb',
}
```

- Fornecedores com `isHighlighted: true` aparecem primeiro (ordenação client-side via `computed()`)
- Clicar em um fornecedor navega para `/produtos?supplier=<slug>`

---

### `/contato` — Contato

```typescript
{
  path: 'contato',
  component: ContactComponent,
  title: 'Contato - Fitoherb',
}
```

- Formulário com campos: Nome, Empresa, E-mail, Telefone, Assunto, Mensagem
- Assuntos predefinidos: Parceria Comercial, Dúvidas sobre Produtos, Trabalhe Conosco, Sugestões ou Reclamações, Outros Assuntos
- Destinatário fixo: `comercial@fitoherb.com.br` (via `environment.contactRecipient`)

---

### `/login` — Login

```typescript
{
  path: 'login',
  component: LoginComponent,
  title: 'Login - Fitoherb',
}
```

- Nav e Footer **ocultos** (showLayout = false)
- Se já autenticado (`tokenService.isAuthenticated()`), redireciona automaticamente para `/admin`
- Após login bem-sucedido, redireciona para `/admin`

---

### `/admin` — Painel Admin

```typescript
{
  path: 'admin',
  component: AdminComponent,
  title: 'Admin - Fitoherb',
  canActivate: [authGuard],
}
```

- Nav e Footer **ocultos** (showLayout = false)
- Protegida por `authGuard` — não autenticados são redirecionados para `/login`
- Tabs disponíveis: Produtos · Categorias de Produtos · Fornecedores · Banners · Usuários · Alterar Senha

---

## Configuração do Router

```typescript
// app.config.ts
provideRouter(
  routes,
  withInMemoryScrolling({
    scrollPositionRestoration: 'enabled', // Restaura posição ao navegar de volta
    anchorScrolling: 'enabled',           // Suporte a links com âncoras #id
  }),
)
```

---

## Layout Condicional

```
Rota           showLayout   <app-nav>   <app-footer>
─────────────  ───────────  ──────────  ─────────────
/              true         ✅          ✅
/quem-somos    true         ✅          ✅
/produtos      true         ✅          ✅
/fornecedores  true         ✅          ✅
/contato       true         ✅          ✅
/login         false        ❌          ❌
/admin         false        ❌          ❌
```

> O cálculo é feito no `AppComponent` escutando `NavigationEnd` e verificando se a URL começa com `/login` ou `/admin`.
