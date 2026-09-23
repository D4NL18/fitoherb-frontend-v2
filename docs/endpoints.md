# Endpoints Consumidos — Fitoherb Frontend v2

> **Data de criação:** 23/09/2026  
> **Framework:** Angular 18.2 (HttpClient, HttpInterceptorFn)  
> **Base URL (Dev):** `http://localhost:8080`  
> **Base URL (Prod):** Configurada via `environment.ts`

---

## 1. Visão Geral da Camada de Integração

O frontend se comunica com a API RESTful do **Fitoherb Backend v2** através de serviços injetáveis (`src/app/services/`) usando o `HttpClient` do Angular. Todas as requisições autenticadas passam pelo `auth.interceptor.ts`, que anexa automaticamente o cabeçalho `Authorization: Bearer <token>` armazenado pelo `token.service.ts`.

---

## 2. Mapa Geral de Endpoints por Serviço

| Serviço Frontend | Método HTTP | Endpoint Backend | Autenticação | Descrição |
|---|---|---|---|---|
| `auth.service.ts` | `POST` | `/auth/login` | Pública | Autenticação de usuário com email e senha |
| `auth.service.ts` | `POST` | `/auth/register` | Pública | Registro de novos usuários no sistema |
| `users.service.ts` | `GET` | `/users` | `Bearer JWT` | Listagem paginada de usuários com filtros |
| `users.service.ts` | `GET` | `/users/{email}` | `Bearer JWT` | Detalhes do perfil de um usuário |
| `users.service.ts` | `PUT` | `/users/{email}` | `Bearer JWT` (Admin) | Atualização de perfil de usuário |
| `users.service.ts` | `PATCH` | `/users/update-password/{email}` | `Bearer JWT` | Alteração segura de senha |
| `users.service.ts` | `DELETE` | `/users/{email}` | `Bearer JWT` (Admin) | Exclusão permanente de conta |
| `products.service.ts` | `GET` | `/products` | Pública | Listagem paginada de produtos |
| `products.service.ts` | `GET` | `/products/gallery` | Pública | Catálogo da galeria com filtros múltiplos |
| `products.service.ts` | `GET` | `/products/{slug}` | Pública | Detalhes completos do produto por slug |
| `products.service.ts` | `POST` | `/products` | `Bearer JWT` (Admin) | Criação de produto com upload multipart |
| `products.service.ts` | `PUT` | `/products/{slug}` | `Bearer JWT` (Admin) | Atualização de produto com imagem opcional |
| `products.service.ts` | `DELETE` | `/products/{slug}` | `Bearer JWT` (Admin) | Remoção de produto |
| `product-categories.service.ts` | `GET` | `/product_categories` | Pública | Listagem paginada de categorias |
| `product-categories.service.ts` | `GET` | `/product_categories/get-all` | Pública | Lista simplificada para selects e dropdowns |
| `product-categories.service.ts` | `GET` | `/product_categories/{slug}` | Pública | Detalhes de categoria por slug |
| `product-categories.service.ts` | `POST` | `/product_categories` | `Bearer JWT` (Admin) | Criação de categoria com imagem |
| `product-categories.service.ts` | `PUT` | `/product_categories/{slug}` | `Bearer JWT` (Admin) | Atualização de categoria |
| `product-categories.service.ts` | `DELETE` | `/product_categories/{slug}` | `Bearer JWT` (Admin) | Exclusão de categoria |
| `suppliers.service.ts` | `GET` | `/suppliers` | Pública | Listagem paginada de fornecedores |
| `suppliers.service.ts` | `GET` | `/suppliers/get-all` | Pública | Lista completa de fornecedores para selects |
| `suppliers.service.ts` | `GET` | `/suppliers/{slug}` | Pública | Detalhes do fornecedor por slug |
| `suppliers.service.ts` | `POST` | `/suppliers` | `Bearer JWT` (Admin) | Cadastro de fornecedor parceiro com logo |
| `suppliers.service.ts` | `PUT` | `/suppliers/{slug}` | `Bearer JWT` (Admin) | Edição de dados do fornecedor |
| `suppliers.service.ts` | `DELETE` | `/suppliers/{slug}` | `Bearer JWT` (Admin) | Exclusão de fornecedor |
| `banners.service.ts` | `GET` | `/banners` | Pública | Lista de banners ativos para o carrossel |
| `banners.service.ts` | `POST` | `/banners` | `Bearer JWT` (Admin) | Upload e ativação de novo banner da home |
| `banners.service.ts` | `PUT` | `/banners/{id}` | `Bearer JWT` (Admin) | Atualização de posição e status do banner |
| `banners.service.ts` | `DELETE` | `/banners/{id}` | `Bearer JWT` (Admin) | Exclusão de banner |
| `mail.service.ts` | `POST` | `/email/send` | Pública | Envio de formulário de contato institucional |

---

## 3. Detalhamento dos Contratos de Consumo

### 3.1 Autenticação (`auth.service.ts`)

#### `POST /auth/login`
- **Request:** `LoginReq` (`{ email: string, password: string }`)
- **Response 200:** `LoginRes` (`{ token: string }`)
- **Tratamento no Client:** Salva o token via `TokenService.setToken(res.token)`. Redireciona para `/admin`. Em caso de erro 401/403, exibe mensagem no `modal-response` ou inline.

#### `POST /auth/register`
- **Request:** `RegisterReq` (`{ name: string, email: string, password: string }`)
- **Response 200 / 201:** Confirmação de cadastro.

---

### 3.2 Catálogo e Galeria (`products.service.ts`)

#### `GET /products/gallery`
- **Query Params Suportados:**
  - `page`: índice da página (0-based)
  - `size`: quantidade por página (default: 12)
  - `category`: slug da categoria selecionada
  - `supplier`: slug do fornecedor selecionado
  - `search`: termo de busca textual
- **Response 200:** `PageResponse<ProductRes>`
```typescript
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
```

---

### 3.3 Formulário de Contato (`mail.service.ts`)

#### `POST /email/send`
- **Request:** `MailReq` (`{ name: string, email: string, phone: string, message: string }`)
- **Response 200:** Confirmação de disparo de e-mail.
- **Feedback na UI:** Modal animado de agradecimento e feedback de envio bem-sucedido.

---

## 4. Tratamento Global de Erros HTTP

O interceptor funcional intercepta respostas de erro:
- **401 Unauthorized:** Remove credenciais expiradas do `localStorage` e redireciona o usuário para `/login`.
- **403 Forbidden:** Notifica permissão insuficiente para a operação (apenas `ROLE_ADMIN`).
- **400 Bad Request:** Processa validações de campo retornadas pelo backend (`RestValidationErrorMessage`) para pintar campos inválidos em formulários reativos.
- **500 Internal Server Error:** Exibe modal genérico de instabilidade temporária.
