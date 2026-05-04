<p align="center">
  <img src="public/assets/images/fitoherb-logo.png" alt="Fitoherb Logo" width="200" />
</p>

<h1 align="center">🌿 Fitoherb Nordeste — Frontend v2</h1>

<p align="center">
  Aplicação web institucional e administrativa para a <strong>Fitoherb Nordeste</strong>, distribuidora premium de suplementos naturais, fitoterápicos e nutracêuticos com sede em Lauro de Freitas/BA.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-18.2-DD0031?logo=angular&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/SCSS-Modules-CC6699?logo=sass&logoColor=white" />
  <img src="https://img.shields.io/badge/Font_Awesome-7.2-339AF0?logo=fontawesome&logoColor=white" />
  <img src="https://img.shields.io/badge/License-Private-red" />
</p>

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Stack Tecnológica](#-stack-tecnológica)
- [Arquitetura do Projeto](#-arquitetura-do-projeto)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Páginas e Funcionalidades](#-páginas-e-funcionalidades)
- [Componentes Compartilhados](#-componentes-compartilhados)
- [Camada de Serviços](#-camada-de-serviços)
- [Tipagem e Interfaces](#-tipagem-e-interfaces)
- [Segurança e Autenticação](#-segurança-e-autenticação)
- [Design System e Estilização](#-design-system-e-estilização)
- [Configuração de Ambientes](#-configuração-de-ambientes)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Build de Produção](#-build-de-produção)
- [Integração com o Backend](#-integração-com-o-backend)

---

## 🌱 Sobre o Projeto

O **Fitoherb Frontend v2** é a interface web completa da distribuidora Fitoherb Nordeste. A aplicação possui duas grandes áreas:

1. **Site Institucional (público)** — Vitrine digital com informações sobre a empresa, catálogo de produtos, fornecedores e canal de contato direto.
2. **Painel Administrativo (protegido)** — Dashboard completo para gerenciamento de produtos, categorias, fornecedores, usuários e configurações de segurança.

A aplicação se comunica com uma API REST (Spring Boot / Java) que provê autenticação JWT, CRUD de entidades e envio de e-mails.

---

## 🛠 Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **Angular** | 18.2 | Framework principal (standalone components) |
| **TypeScript** | 5.5 | Linguagem com tipagem estática |
| **SCSS** | — | Pré-processador CSS com variáveis e módulos |
| **RxJS** | 7.8 | Programação reativa e gerenciamento de fluxos assíncronos |
| **Angular Signals** | — | Gerenciamento de estado reativo (signal, computed, effect) |
| **Font Awesome** | 7.2 | Biblioteca de ícones |
| **Zone.js** | 0.14 | Detecção de mudanças do Angular |
| **Karma + Jasmine** | — | Framework de testes unitários |

---

## 🏗 Arquitetura do Projeto

A aplicação segue uma arquitetura modular organizada em camadas com **standalone components** (sem NgModules):

```
┌─────────────────────────────────────────────────┐
│                   App Shell                      │
│  ┌─────────┐  ┌──────────────┐  ┌────────────┐  │
│  │   Nav   │  │ Router Outlet│  │   Footer   │  │
│  └─────────┘  └──────────────┘  └────────────┘  │
├─────────────────────────────────────────────────┤
│                    Views                         │
│  Home │ About │ Gallery │ Suppliers │ Contact    │
│  Login │ Admin                                   │
├─────────────────────────────────────────────────┤
│                   Shared                         │
│  Button │ Input │ Select │ Textarea │ Nav        │
│  Footer │ ModalResponse                         │
├─────────────────────────────────────────────────┤
│                  Services                        │
│  Auth │ Token │ Products │ Suppliers │ Users     │
│  ProductCategories │ Mail                        │
├─────────────────────────────────────────────────┤
│                    Core                          │
│  Guards (authGuard) │ Interceptors (authInterceptor) │
├─────────────────────────────────────────────────┤
│                   Types                          │
│  Interfaces tipadas para Request/Response        │
└─────────────────────────────────────────────────┘
```

### Padrões Adotados

- **Standalone Components** — Todos os componentes são `standalone: true`, eliminando a necessidade de NgModules.
- **Signals como State Management** — Estado reativo via `signal()`, `computed()` e `effect()` do Angular 18, sem bibliotecas externas como NgRx.
- **Functional Guards & Interceptors** — Guards e interceptors implementados como funções puras (`CanActivateFn`, `HttpInterceptorFn`).
- **ControlValueAccessor** — Componentes de formulário (`Input`, `Select`, `Textarea`) implementam CVA para integração nativa com Reactive Forms.
- **Injeção via `inject()`** — Injeção de dependências moderna sem `constructor` injection.
- **Lazy Layout** — Nav e Footer são ocultados automaticamente nas rotas `/login` e `/admin`.

---

## 📁 Estrutura de Diretórios

```
src/
├── app/
│   ├── core/                          # Infraestrutura central
│   │   ├── guards/
│   │   │   └── auth.guard.ts          # Guard funcional de autenticação
│   │   └── interceptors/
│   │       └── auth.interceptor.ts    # Interceptor HTTP com refresh token
│   │
│   ├── services/                      # Camada de serviços (comunicação API)
│   │   ├── auth/                      # Login, register, refresh, logout
│   │   ├── token/                     # Gerenciamento de JWT no localStorage
│   │   ├── products/                  # CRUD + galeria paginada de produtos
│   │   ├── product-categories/        # CRUD de categorias de produtos
│   │   ├── suppliers/                 # CRUD de fornecedores
│   │   ├── users/                     # CRUD de usuários + alteração de senha
│   │   └── mail/                      # Envio de e-mails de contato
│   │
│   ├── shared/                        # Componentes reutilizáveis (UI Kit)
│   │   ├── button/                    # Botão com variantes (primary/outline/white)
│   │   ├── input/                     # Input com CVA, ícone, toggle de senha
│   │   ├── select/                    # Select dropdown com CVA
│   │   ├── textarea/                  # Textarea com CVA
│   │   ├── nav/                       # Barra de navegação pública
│   │   ├── footer/                    # Rodapé com links dinâmicos
│   │   └── modal-response/            # Modal de feedback (sucesso/erro)
│   │
│   ├── types/                         # Interfaces TypeScript
│   │   ├── auth/                      # LoginReq, LoginRes, RegisterReq, AuthError
│   │   ├── products/                  # ProductReq, ProductRes
│   │   ├── product-categories/        # ProductCategoryReq, ProductCategoryRes
│   │   ├── suppliers/                 # SupplierReq, SupplierRes
│   │   ├── users/                     # UserReq, UserRes, PasswordUpdateReq
│   │   ├── mail/                      # MailReq
│   │   └── page-response.interface.ts # Interface genérica PageResponse<T>
│   │
│   ├── views/                         # Páginas da aplicação
│   │   ├── home/                      # Página inicial com carousel e categorias
│   │   ├── about/                     # Quem Somos (história, MVV, stats)
│   │   ├── gallery/                   # Catálogo de produtos com filtros
│   │   ├── suppliers/                 # Listagem de fornecedores
│   │   ├── contact/                   # Formulário de contato
│   │   ├── login/                     # Tela de autenticação
│   │   └── admin/                     # Painel administrativo completo
│   │
│   ├── app.component.ts              # Componente raiz (layout condicional)
│   ├── app.config.ts                 # Providers globais (router, http, interceptors)
│   └── app.routes.ts                 # Definição de rotas
│
├── environments/                      # Configurações de ambiente
│   ├── environment.ts                 # Produção
│   └── environment.development.ts     # Desenvolvimento
│
├── colors.scss                        # Design tokens (paleta de cores)
├── styles.scss                        # Estilos globais
├── index.html                         # HTML raiz
└── main.ts                            # Bootstrap da aplicação
```

---

## 📄 Páginas e Funcionalidades

### 🏠 Home (`/`)

A landing page principal com design imersivo e interativo:

- **Banner Carousel** — Carrossel de imagens com autoplay (5s), navegação por drag/swipe, loop infinito e transições suaves.
- **Seção Sobre** — Apresentação da empresa com texto institucional, imagem e call-to-action.
- **Contagem Animada** — Estatísticas com números animados acionados por `IntersectionObserver` (500+ produtos, 12 anos, 150+ clientes).
- **Categorias de Produtos** — Grid dinâmico com cards de categorias vindas do backend, com imagens de fundo e botão de navegação para o catálogo filtrado.
- **CTA de Contato** — Seção de chamada para parceria comercial.
- **Animações Scroll-Reveal** — Elementos animam ao entrar no viewport (reveal-left, reveal-right, reveal-bottom).

### 📖 Quem Somos (`/quem-somos`)

Página institucional com:

- **Hero Section** — Título "Quem Somos" com subtítulo descritivo.
- **Seção de História** — Layout side-by-side com imagem do centro de distribuição e texto sobre a trajetória da empresa.
- **Barra de Estatísticas** — 4 KPIs animados (28+ anos, 1800+ produtos, 2000+ parceiros, 20+ marcas).
- **Missão, Visão e Valores (MVV)** — Cards com ícones detalhando os pilares da empresa.
- **Animações escalonadas** — Todos os elementos usam IntersectionObserver com `transition-delay` progressivo.

### 🛒 Produtos (`/produtos`)

Catálogo completo com sistema de filtragem avançado:

- **Filtros por Categoria** — Checkboxes com contagem de produtos por categoria.
- **Filtros por Fornecedor** — Checkboxes com contagem de produtos por fornecedor.
- **Busca Textual** — Input com `debounceTime(1000ms)` para busca por nome.
- **Ordenação** — Select A-Z / Z-A.
- **Deep Linking** — Filtros refletidos na URL via `queryParams` (`?category=slug&supplier=slug`).
- **Infinite Scroll** — Paginação automática com `IntersectionObserver` ao rolar até o final da página.
- **Card de Produto** — Exibição com imagem, nome, categoria e fornecedor.
- **Modal de Detalhes** — Visualização expandida do produto selecionado com informações completas (descrição, sabores, fornecedor, categoria).

### 🏭 Fornecedores (`/fornecedores`)

Vitrine dos parceiros comerciais:

- **Grid Responsivo** — Cards com logo do fornecedor e nome.
- **Ordenação por Destaque** — Fornecedores "premium" (`isHighlighted`) aparecem primeiro com badge de estrela.
- **Navegação Integrada** — Clique redireciona ao catálogo filtrado por aquele fornecedor.
- **Animações** — Cards com reveal-bottom e delay progressivo.

### 📞 Contato (`/contato`)

Página de contato com formulário validado e mapa:

- **Formulário Completo** — Campos: Nome, Empresa, E-mail, Telefone, Assunto (select com opções pré-definidas), Mensagem.
- **Validação Reativa** — Validators do Angular com mensagens de erro personalizadas.
- **Regex de Telefone** — Validação de formato brasileiro `(XX) XXXXX-XXXX`.
- **Envio de E-mail** — Integração com API de envio de e-mails do backend.
- **Loading State** — Spinner no botão durante envio com desabilitação do formulário.
- **Modal de Feedback** — Resposta de sucesso ou erro após envio.
- **Informações de Contato** — Telefone, e-mail e endereço da empresa.
- **Google Maps Embed** — Mapa interativo com localização da empresa.

### 🔐 Login (`/login`)

Tela de autenticação administrativa:

- **Formulário Simples** — Campos de e-mail e senha.
- **Autenticação JWT** — Login via API com armazenamento do token.
- **Tratamento de Erros** — Modal de feedback com mensagens de erro do backend (pt-BR).
- **Redirecionamento** — Sucesso redireciona para `/admin`.
- **Layout Isolado** — Nav e Footer são ocultados nesta rota.

### ⚙️ Painel Admin (`/admin`)

Dashboard administrativo completo protegido por `authGuard`:

- **Navegação Lateral** — Sidebar com abas: Produtos, Categorias de Produtos, Fornecedores, Usuários, Alterar Senha.
- **Menu Mobile** — Toggle responsivo para a sidebar.
- **Logout** — Botão de desconexão com remoção do token.

#### CRUD de Produtos
- Tabela dinâmica com colunas: Imagem, Nome, Categoria, Fornecedor, Ações.
- Busca com `debounceTime(400ms)`.
- Ordenação por: Nome (A-Z/Z-A), Categoria (A-Z/Z-A), Fornecedor (A-Z/Z-A).
- Modal de criação/edição com campos: Nome, Descrição, Categoria (select dinâmico), Fornecedor (select dinâmico), Sabores (comma-separated), Imagem (upload com preview).
- Exclusão com modal de confirmação.
- Upload de imagens via `FormData` com `multipart/form-data`.

#### CRUD de Categorias de Produtos
- Tabela com: Imagem, Nome, Ações.
- Modal de criação/edição com: Nome, Imagem.

#### CRUD de Fornecedores
- Tabela com: Imagem, Nome, Destaque (badge), Ações.
- Modal com: Nome, Destaque (toggle), Imagem.

#### CRUD de Usuários
- Tabela com: Nome, E-mail, Cargo (badge USER/ADMIN), Ações.
- Modal com: Nome, E-mail (desabilitado em edição), Cargo, Data de Nascimento.
- Registro de novos usuários via endpoint `/auth/register`.

#### Alterar Senha
- Formulário isolado com: Senha Atual, Nova Senha, Confirmar Senha.
- Validação de complexidade: mínimo 8 caracteres, letras maiúsculas/minúsculas, números e caracteres especiais.
- Validador customizado de correspondência entre senhas.

#### Tabela Dinâmica (`DynamicTableComponent`)
- Componente genérico que renderiza colunas configuráveis via `TableColumn[]`.
- Tipos de coluna: `text`, `image`, `badge`, `actions`, `price`, `stock`.
- Paginação com controles de navegação e indicação de range.

---

## 🧩 Componentes Compartilhados

| Componente | Descrição |
|---|---|
| `ButtonComponent` | Botão reutilizável com variantes `primary`, `outline`, `white`. Suporta ícone, fullWidth e estado disabled. |
| `InputComponent` | Input com `ControlValueAccessor`, suporte a tipos (text, email, tel, number, password), ícone, toggle de visibilidade de senha, e exibição de erro condicional. |
| `SelectComponent` | Select dropdown com `ControlValueAccessor`, opções dinâmicas e mensagens de erro. |
| `TextareaComponent` | Textarea com `ControlValueAccessor`, rows configurável e validação de erro. |
| `NavComponent` | Barra de navegação pública com menu hamburger mobile e links para todas as páginas. |
| `FooterComponent` | Rodapé com categorias dinâmicas do backend, links institucionais e logo. |
| `ModalResponseComponent` | Modal de feedback com suporte a sucesso (2xx) e erro, ícone e cor dinâmicos. |

---

## 🔧 Camada de Serviços

Todos os serviços são `@Injectable({ providedIn: 'root' })` e utilizam **Angular Signals** para gerenciamento de estado reativo:

| Serviço | Responsabilidade |
|---|---|
| `AuthService` | Login, registro de usuários e refresh de token JWT. |
| `TokenService` | Salvar, recuperar, remover token do `localStorage`. Decodifica JWT para extrair e-mail do usuário. |
| `ProductsService` | CRUD completo, galeria paginada com filtros, upload de imagens via `FormData`. Mantém dois estados: `productGallery` (público) e `adminProducts` (admin). |
| `ProductCategoriesService` | CRUD com paginação, listagem completa para dropdowns. |
| `SuppliersService` | CRUD com paginação, listagem completa com contagem. |
| `UsersService` | CRUD, listagem paginada e alteração de senha. |
| `MailService` | Envio de e-mails de contato com estado de loading reativo. |

### Padrão de Estado com Signals

```typescript
// Estado privado (mutável)
private productGalleryState = signal<PageResponse<ProductRes>>({ ... });

// Estado público (somente leitura)
public productGallery = this.productGalleryState.asReadonly();
```

Este padrão garante encapsulamento — apenas o serviço pode modificar o estado, enquanto os componentes consomem a versão `readonly`.

---

## 📐 Tipagem e Interfaces

A aplicação utiliza interfaces TypeScript fortemente tipadas para todas as comunicações com a API:

### Request Interfaces

| Interface | Campos |
|---|---|
| `LoginReq` | `email`, `password` |
| `RegisterReq` | `name`, `email`, `role`, `birthDate` |
| `ProductReq` | `name`, `description`, `categorySlug`, `supplierSlug`, `flavours` |
| `ProductCategoryReq` | `name` |
| `SupplierReq` | `name`, `isHighlighted` |
| `UserReq` | `name`, `email`, `role` |
| `PasswordUpdateReq` | `password` |
| `MailReq` | `email`, `subject`, `message` |

### Response Interfaces

| Interface | Campos |
|---|---|
| `LoginRes` | `token` |
| `ProductRes` | `name`, `imageUrl`, `description`, `flavours`, `slug`, `category`, `supplier`, `createdAt` |
| `ProductCategoryRes` | `name`, `slug`, `imageUrl`, `count` |
| `SupplierRes` | `name`, `slug`, `imageUrl`, `isHighlighted`, `count` |
| `UserRes` | `name`, `email`, `role`, `birthDate` |
| `AuthError` | `status`, `message`, `errors` |

### Paginação Genérica

```typescript
interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
```

---

## 🔒 Segurança e Autenticação

### Fluxo de Autenticação

```
1. Usuário faz login → POST /auth/login
2. Backend retorna JWT → Token salvo no localStorage
3. Interceptor injeta Bearer token em todas as requisições
4. Se resposta 401 → Interceptor tenta refresh automático
5. Se refresh falha → Token removido, redirect para /login
```

### Auth Guard (`authGuard`)

- Implementado como `CanActivateFn` (functional guard).
- Verifica se existe token válido via `TokenService.isAuthenticated()`.
- Protege a rota `/admin`.

### Auth Interceptor (`authInterceptor`)

- Injeta o header `Authorization: Bearer <token>` em todas as requisições (exceto `/refresh`).
- **Token Refresh automático**: Em caso de resposta 401, tenta renovar o token via `/auth/refresh`.
- **Fila de requisições**: Usa `BehaviorSubject` para enfileirar requisições concorrentes durante o refresh, evitando múltiplas chamadas simultâneas.
- Em caso de falha no refresh, limpa o token e redireciona para `/login`.

### Token Service

- Armazena/recupera JWT do `localStorage` com chave `fitoherb_token`.
- Decodifica o payload do JWT (Base64URL) para extrair o e-mail do usuário (`sub` ou `email`).

---

## 🎨 Design System e Estilização

### Paleta de Cores (`colors.scss`)

O projeto utiliza um sistema de design tokens baseado em variáveis SCSS:

| Token | Hex | Uso |
|---|---|---|
| `$primary-color` | `#38582f` | Cor principal (verde floresta) |
| `$green-900` → `$green-50` | Escala completa | 10 tons de verde |
| `$cream` | `#faf8f3` | Background suave |
| `$error` | `#c0392b` | Erros e validações |
| `$success` | `#27ae60` | Feedback positivo |
| `$warning` | `#e67e22` | Alertas |
| `$dark-green` | `#0f140f` | Backgrounds escuros |

### Estilização

- **SCSS com módulos** — Cada componente possui seu arquivo `.scss` encapsulado.
- **Variáveis globais** — Importadas via `@forward 'colors'` no `styles.scss`.
- **InlineStyleLanguage** — Configurado como `scss` no `angular.json`.
- **Font Awesome via CSS** — Importado globalmente no build config.

### Animações

- **Scroll-Reveal** — Animações ativadas por `IntersectionObserver` com classes `is-visible`.
- **Counter Animation** — Números que incrementam progressivamente com `setInterval` e frame rate de 60fps.
- **Banner Carousel** — Transições CSS com `transform: translateX()` e suporte a drag gesture.
- **Staggered Animations** — Cards com `transition-delay` progressivo para efeito cascata.

---

## ⚙️ Configuração de Ambientes

O projeto utiliza o sistema de `fileReplacements` do Angular para trocar configurações por ambiente:

```typescript
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  contactRecipient: 'email@exemplo.com'
};
```

| Variável | Descrição |
|---|---|
| `production` | Flag de modo produção |
| `apiUrl` | URL base da API REST (backend Spring Boot) |
| `contactRecipient` | E-mail destinatário do formulário de contato |

> ⚠️ Em produção, `apiUrl` deve incluir o path `/api` se o backend estiver configurado com prefixo.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Angular CLI** >= 18.2 (instalado como devDependency)
- **Backend** rodando em `http://localhost:8080` (ver [Integração com o Backend](#-integração-com-o-backend))

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/fitoherb-frontend-v2.git

# Acesse o diretório
cd fitoherb-frontend-v2

# Instale as dependências
npm install
```

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm start
# ou
ng serve
```

A aplicação estará disponível em `http://localhost:4200`.

---

## 📜 Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| `start` | `ng serve` | Inicia o servidor de desenvolvimento |
| `build` | `ng build` | Compila o projeto para produção |
| `watch` | `ng build --watch --configuration development` | Build em modo watch (dev) |
| `test` | `ng test` | Executa os testes unitários via Karma |

---

## 📦 Build de Produção

```bash
npm run build
```

Os artefatos de build são gerados em `dist/fitoherb-frontend-v2/`. O build de produção inclui:

- **Output Hashing** para cache busting
- **Budget Limits** — Warning em 500kB, erro em 1MB (initial bundle)
- **Budget de Estilos** — Warning em 2kB, erro em 4kB (por componente)

---

## 🔗 Integração com o Backend

Esta aplicação consome a API REST do **Fitoherb Backend v2** (Spring Boot + Java). Os principais endpoints consumidos são:

| Endpoint | Método | Descrição |
|---|---|---|
| `/auth/login` | POST | Autenticação JWT |
| `/auth/register` | POST | Registro de novo usuário |
| `/auth/refresh` | POST | Refresh do token JWT |
| `/products` | GET/POST | Listagem paginada / Criação de produto |
| `/products/gallery` | GET | Galeria pública com filtros |
| `/products/{slug}` | GET/PUT/DELETE | Operações por slug |
| `/product_categories` | GET/POST | Listagem paginada / Criação |
| `/product_categories/get-all` | GET | Listagem completa (dropdowns) |
| `/product_categories/{slug}` | GET/PUT/DELETE | Operações por slug |
| `/suppliers` | GET/POST | Listagem paginada / Criação |
| `/suppliers/get-all` | GET | Listagem completa |
| `/suppliers/{slug}` | GET/PUT/DELETE | Operações por slug |
| `/users` | GET | Listagem paginada |
| `/users/{email}` | GET/PUT/DELETE | Operações por e-mail |
| `/users/update-password/{email}` | PATCH | Alteração de senha |
| `/emails/send-contact` | POST | Envio de e-mail de contato |

### Upload de Imagens

Produtos, categorias e fornecedores suportam upload de imagem via `multipart/form-data`:

```
FormData:
  - [entity]: Blob (application/json) → dados da entidade
  - image: File → arquivo de imagem
```

As URLs das imagens retornadas pelo backend são relativas e resolvidas no frontend concatenando com `apiUrl`.

---

<p align="center">
  Desenvolvido para a <strong>Fitoherb Nordeste</strong>
</p>
