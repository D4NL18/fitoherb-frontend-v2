# Roadmap do Projeto — Fitoherb Frontend v2 🗺️

> **Localização Mandatória:** `.agents/docs/ROADMAP.md`  
> **Responsável:** Product Owner (`product_owner.md`) / `agile-coach`  
> **Empresa:** Fitoherb Nordeste Distribuidora de Suplementos Naturais  
> **Stack:** Angular 18.2 · TypeScript 5.5 · SCSS · RxJS 7.8

---

## 1. Visão do Produto

O **Fitoherb Frontend v2** é a Single Page Application (SPA) oficial da **Fitoherb Nordeste**, projetada para alavancar a presença digital da distribuidora perante clientes, lojistas, revendedores e parceiros comerciais. A aplicação une duas frentes integradas:

1. **Site Institucional Público:** Vitrine interativa de produtos, catálogo com filtros refinados e infinite scroll, apresentação institucional com KPIs dinâmicos e canal comercial direto via e-mail.
2. **Painel Administrativo Protegido:** Gestão completa de catálogo (Produtos, Categorias, Banners, Fornecedores e Usuários) com autenticação baseada em JWT e autorização por papéis (`ADMIN` / `USER`).

---

## 2. Épicos e User Stories (Backlog & Status)

### Épico 1: Catálogo e Experiência Pública da Loja
- [x] **US-01 — Catálogo de Produtos e Busca:** Galeria com busca textual debounced (1s), filtros por categoria e fornecedor, infinite scroll e visualização responsiva.
- [x] **US-02 — Vitrine de Fornecedores e Destaques:** Listagem de marcas parceiras com destaque visual para os principais (`isHighlighted`).
- [x] **US-03 — Página Institucional (Quem Somos):** História da marca de 28 anos, MVV e contadores de KPIs animados ao entrar na viewport.
- [x] **US-04 — Canal de Contato:** Formulário com validação reativa e integração de envio para `comercial@fitoherb.com.br`.
- [x] **US-05 — Equipe Comercial (About):** Seção "Nossa Equipe Comercial" para humanização e apoio a vendas.

### Épico 2: Gestão Administrativa e Governança de Conteúdo
- [x] **US-06 — Autenticação Segura e Sessão:** Login administrativo com JWT em cookie HttpOnly, `rememberMe` e interceptor com refresh automático resiliente.
- [x] **US-07 — CRUD de Produtos e Categorias:** Gestão de itens com upload de imagens (multipart) e slugs amigáveis.
- [x] **US-08 — Gestão de Banners e Vitrines:** Controle dinâmico de exibição e ordem no carousel da Home.
- [x] **US-09 — Gestão de Usuários e Permissões:** Controle restrito para perfil `ADMIN` para cadastrar e gerenciar operadores do sistema.

### Épico 3: Evolução Contínua, Performance & Anti-IA Polish
- [ ] **US-10 — Refinamento de Micro-interações e Polish Visual Anti-IA:** Otimização de micro-animações, estados de erro e skeletons customizados. `[PARALLEL]`
- [ ] **US-11 — Auditoria de Acessibilidade (WCAG 2.1 AA):** Revisão completa de contraste, navegação por teclado e semântica de leitor de tela. `[PARALLEL]`

---

## 3. Histórico de Entregas Recentes

- **feature/about-team-section:** Adição e ajuste da seção "Nossa Equipe Comercial" no módulo institucional.
- **feature/products-api-slug-update:** Integração de slugs dinâmicos com o backend e melhorias no catálogo.
- **feature/LGPD-secure-login:** Conformidade de privacidade na autenticação e cookies seguros.
