# Visão Geral dos Módulos — Fitoherb Frontend v2

> **Data de criação:** 23/09/2026  
> **Versão:** Angular 18.2 · TypeScript 5.5

---

## Views (Páginas)

| Módulo | Rota | Componente | Proteção | Responsabilidade |
|--------|------|------------|----------|------------------|
| `home` | `/` | `HomeComponent` | Pública | Página inicial: carousel de banners, grid de categorias dinâmicas, seção "Sobre", stats animados e CTA |
| `about` | `/quem-somos` | `AboutComponent` | Pública | História da empresa, MVV (Missão/Visão/Valores), KPIs animados |
| `gallery` | `/produtos` | `GalleryComponent` | Pública | Catálogo de produtos com filtros, busca com debounce e infinite scroll |
| `suppliers` | `/fornecedores` | `SuppliersComponent` | Pública | Grid de fornecedores ordenados por destaque (`isHighlighted`) |
| `contact` | `/contato` | `ContactComponent` | Pública | Formulário de contato com validação e envio via `MailService` |
| `login` | `/login` | `LoginComponent` | Pública (redireciona se autenticado) | Formulário de login com JWT e "Lembrar-me" |
| `admin` | `/admin` | `AdminComponent` | `authGuard` | Painel CRUD completo para produtos, categorias, fornecedores, usuários, banners |

---

## Serviços

| Serviço | Arquivo | Signals Expostos | Responsabilidade |
|---------|---------|------------------|------------------|
| `AuthService` | `services/auth/auth.service.ts` | — | Login, register, refresh de token, logout |
| `TokenService` | `services/token/token.service.ts` | — | CRUD de cookies JWT (`fitoherb_token`, `fitoherb_user_email`) |
| `ProductsService` | `services/products/products.service.ts` | `productGallery`, `adminProducts`, `isGalleryLoading` | CRUD de produtos, galeria paginada com append |
| `ProductCategoriesService` | `services/product-categories/product-categories.service.ts` | `productCategories`, `paginatedCategories` | CRUD de categorias, lista completa para dropdowns |
| `SuppliersService` | `services/suppliers/suppliers.service.ts` | `suppliers`, `paginatedSuppliers` | CRUD de fornecedores, exclusão em cascata opcional |
| `UsersService` | `services/users/users.service.ts` | `paginatedUsers` | CRUD de usuários, alteração de senha |
| `MailService` | `services/mail/mail.service.ts` | `isLoading` | Envio de e-mail de contato via API |
| `BannersService` | `services/banners/banners.service.ts` | `activeBanners`, `isLoading`, `paginatedBanners` | CRUD de banners, busca de banners ativos |

---

## Componentes Compartilhados (`shared/`)

| Componente | Seletor | Padrão | Responsabilidade |
|------------|---------|--------|------------------|
| `ButtonComponent` | `<app-button>` | — | Botão reutilizável com variantes `primary`, `outline`, `white`; suporte a `loading` e `disabled` |
| `InputComponent` | `<app-input>` | CVA | Campo de entrada com ícone, toggle de senha, `showError` e integração com ReactiveFormsModule |
| `SelectComponent` | `<app-select>` | CVA | Dropdown customizado com busca interna (`searchable`) e fechamento por clique externo |
| `TextareaComponent` | `<app-textarea>` | CVA | Área de texto com validação e contador de linhas configurável |
| `NavComponent` | `<app-nav>` | — | Barra de navegação pública com dropdown de categorias dinâmicas e menu mobile |
| `FooterComponent` | `<app-footer>` | — | Rodapé com links de categorias carregados dinamicamente |
| `ModalResponseComponent` | `<app-modal-response>` | — | Modal de feedback (sucesso/erro) com status HTTP e mensagem |
| `SkeletonCardComponent` | `<app-skeleton-card>` | — | Placeholder animado de carregamento para cards de produto |
| `ToastComponent` | `<app-toast>` | — | Notificação temporária de sucesso (auto-fecha em 4s) |

---

## Core

| Artefato | Arquivo | Tipo | Responsabilidade |
|----------|---------|------|------------------|
| `authGuard` | `core/guards/auth.guard.ts` | `CanActivateFn` | Verifica autenticação antes de ativar `/admin`; redireciona para `/login` se não autenticado |
| `authInterceptor` | `core/interceptors/auth.interceptor.ts` | `HttpInterceptorFn` | Injeta `withCredentials: true` e `Authorization: Bearer <token>` em todas as requisições; gerencia refresh automático em erros 401 |

---

## Types (Interfaces TypeScript)

| Namespace | Interfaces | Uso |
|-----------|------------|-----|
| `auth` | `LoginReq`, `LoginRes`, `RegisterReq`, `AuthError` | Contratos de autenticação com a API |
| `products` | `ProductReq`, `ProductRes` | Criação/leitura de produtos |
| `product-categories` | `ProductCategoryReq`, `ProductCategoryRes` | Criação/leitura de categorias |
| `suppliers` | `SupplierReq`, `SupplierRes` | Criação/leitura de fornecedores |
| `users` | `UserReq`, `UserRes`, `PasswordUpdateReq` | Gerenciamento de usuários |
| `banners` | `BannerReq`, `BannerRes` | Gerenciamento de banners |
| `mail` | `MailReq` | Envio de e-mail de contato |
| `(raiz)` | `PageResponse<T>` | Resposta paginada genérica da API |

---

## Componentes Internos do Admin

| Componente | Seletor | Responsabilidade |
|------------|---------|------------------|
| `AdminNavComponent` | `<app-admin-nav>` | Barra lateral do painel admin com tabs e logout |
| `DynamicTableComponent` | `<app-dynamic-table>` | Tabela genérica com paginação, tipos de coluna e filtros |
| `ModalEntityComponent` | `<app-modal-entity>` | Modal CRUD adaptativo para qualquer entidade (Produto, Categoria, Fornecedor, Usuário, Banner) |
| `ModalConfirmComponent` | `<app-modal-confirm>` | Modal de confirmação de exclusão com suporte a cascata |
| `TableFilterComponent` | `<app-table-filter>` | Dropdown de filtros multi-seleção por coluna com busca interna |

---

## Componentes Internos do Gallery

| Componente | Seletor | Responsabilidade |
|------------|---------|------------------|
| `ItemCardGalleryComponent` | `<app-item-card-gallery>` | Card individual de produto na galeria |
| `ModalGalleryComponent` | `<app-modal-gallery>` | Modal de detalhes do produto com navegação prev/next |

---

## Componentes Internos do Home

| Componente | Seletor | Responsabilidade |
|------------|---------|------------------|
| `BannerCarouselComponent` | `<app-banner-carousel>` | Carousel infinito com autoplay (10s), suporte a drag/swipe e carregamento de banners ativos |

---

## Ambientes

| Chave | Desenvolvimento | Produção |
|-------|----------------|----------|
| `production` | `false` | `true` |
| `apiUrl` | `http://localhost:8080` | `https://fitoherb-backend-nkrtrtj5hq-uc.a.run.app` |
| `imagesBaseUrl` | `http://localhost:8080` | `https://fitoherb-backend-nkrtrtj5hq-uc.a.run.app` |
| `contactRecipient` | `comercial@fitoherb.com.br` | `comercial@fitoherb.com.br` |
