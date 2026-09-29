# Objetivos do Projeto — Fitoherb Frontend v2

> **Data de criação:** 23/09/2026  
> **Empresa:** Fitoherb Nordeste — Lauro de Freitas/BA  
> **Stack:** Angular 18.2 · TypeScript 5.5 · SCSS · RxJS 7.8

---

## Visão Geral

O **Fitoherb Frontend v2** é uma Single Page Application (SPA) Angular 18.2 que serve como presença digital completa da distribuidora de suplementos naturais **Fitoherb Nordeste**. O sistema possui duas grandes faces:

1. **Site Institucional Público** — voltado a clientes, distribuidores e parceiros comerciais
2. **Painel Administrativo Protegido** — voltado à equipe interna para gerenciamento de conteúdo

---

## Objetivos por Área

### 🌐 Site Institucional

| Objetivo | Detalhes |
|----------|---------|
| **Apresentação da marca** | Comunicar a identidade visual e os valores da Fitoherb por meio do design system verde-floresta, tipografia Playfair Display/Outfit |
| **Catálogo de produtos** | Exibir todos os produtos com filtros por categoria e fornecedor, busca textual com debounce e carregamento progressivo via infinite scroll |
| **Vitrine de fornecedores** | Listar os fornecedores parceiros com destaque (`isHighlighted`) para os principais |
| **Canal de contato** | Formulário validado com envio de e-mail diretamente para `comercial@fitoherb.com.br` via integração com API |
| **Quem somos** | Apresentar a história da empresa (fundada há 28 anos), MVV e KPIs com animação numérica ao entrar na viewport |

### 🔒 Painel Administrativo

| Objetivo | Detalhes |
|----------|---------|
| **CRUD completo** | Gerenciar Produtos, Categorias de Produtos, Fornecedores, Banners e Usuários sem necessidade de acesso ao banco de dados |
| **Autenticação segura** | Proteger todas as rotas administrativas via `authGuard` com JWT armazenado em cookie |
| **Refresh transparente** | Renovar tokens expirados automaticamente via interceptor sem interromper a experiência do usuário |
| **Gestão de banners** | Controlar quais banners aparecem no carousel da Home, sua posição e status ativo/inativo |
| **Controle de acesso** | Distinguir roles `ADMIN` e `USER` — apenas `ADMIN` pode gerenciar outros usuários |

---

## Objetivos Técnicos

### Usabilidade
- Interface responsiva para desktop, tablet e mobile
- Feedback imediato ao usuário via Toast (sucesso) e Modal (erro)
- Skeleton loaders durante carregamento assíncrono
- Scroll-reveal com `IntersectionObserver` para animações de entrada
- Botão "Voltar ao topo" na galeria após 300px de scroll

### Performance
- Lazy layout: Nav e Footer não renderizados em `/login` e `/admin`
- Infinite scroll na galeria em vez de paginação convencional
- Tamanho de página calculado dinamicamente pelo número de colunas visíveis do grid
- Signals como state management (sem overhead do NgRx)
- `debounceTime(1000)` na busca da galeria e `debounceTime(400)` no admin para evitar requisições excessivas

### Segurança
- `authGuard` (CanActivateFn) bloqueia acesso não autenticado ao `/admin`
- JWT armazenado em cookie (não localStorage) com suporte a `rememberMe` (30 dias)
- `withCredentials: true` enviado automaticamente em todas as requisições
- Refresh automático de token em 401 com fila de requisições pendentes

### Acessibilidade
- `aria-label` em elementos interativos (ex: botão scroll-to-top)
- Foco visível customizado (`focus-visible`) com outline semitransparente na cor primária
- Estrutura semântica HTML5 com `<header>`, `<main>`, `<footer>`

### SEO
- Título individual por rota via `title:` no `app.routes.ts`
- Scroll position restoration habilitado no roteador

---

## Público-Alvo

| Perfil | Funcionalidades Utilizadas |
|--------|---------------------------|
| Clientes / Revendedores | Home, Catálogo, Fornecedores, Contato |
| Gestores de Conteúdo | Painel Admin (Produtos, Categorias, Banners) |
| Administradores | Painel Admin completo (inclui Usuários) |

---

## Métricas de Negócio Exibidas

Com base nos valores animados no site:

| Métrica | Valor | Onde aparece |
|---------|-------|-------------|
| Produtos no portfólio | **+1.800** | Home (stats) · About (KPIs) |
| Anos de mercado | **28 anos** | Home (stats) · About (KPIs) |
| Clientes atendidos | **+2.000** | Home (stats) · About (KPIs) |
| Parceiros/marcas | **+40 marcas** | About (KPIs) |
