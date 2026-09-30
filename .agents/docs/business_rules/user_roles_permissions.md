# Regras de Negócio: Papéis de Usuários e Permissões (P-107)

Este documento define os papéis de usuário, matriz de acessos e permissões no sistema Fitoherb.

---

## [P-107] Matriz de Papéis e Permissões (RBAC)

O sistema opera com três papéis de usuário distintos: `ADMIN`, `USER` e `SELLER`.

### 1. Papel ADMIN (Administrador Geral)
- **Acesso:** Total e irrestrito a todos os módulos e funcionalidades do sistema.
- **Módulos Permitidos:**
  - Gerenciamento de Produtos (CRUD completo)
  - Gerenciamento de Categorias de Produtos (CRUD completo)
  - Gerenciamento de Fornecedores (CRUD completo)
  - Gerenciamento de Banners (CRUD completo)
  - Gerenciamento de Usuários (Listagem, Criação/Registro, Edição e Exclusão)
  - Roteirização Comercial e Calendário de Rotas (Criação, Edição, Otimização e Exclusão de Rotas e Pontos Salvos)
  - Alteração de Senha própria
- **Ações na UI:** Botão "Adicionar usuários" e ações de edição/exclusão de usuários ficam totalmente desbloqueados e ativos.
- **Authorities Spring Security:** `ROLE_ADMIN`, `ROLE_USER`, `ROLE_SELLER`.

### 2. Papel USER (Usuário Operacional / Catálogo)
- **Acesso:** Acesso aos cadastros e cadastramento de catálogo (CRUDs de produtos, categorias, fornecedores e banners).
- **Módulos Permitidos:**
  - Gerenciamento de Produtos (CRUD completo)
  - Gerenciamento de Categorias de Produtos (CRUD completo)
  - Gerenciamento de Fornecedores (CRUD completo)
  - Gerenciamento de Banners (CRUD completo)
  - Alteração de Senha própria
- **Módulos Bloqueados:**
  - Gerenciamento de Usuários (Não visualiza a aba "Usuários" na barra de navegação; endpoints restritos a ADMIN).
  - Roteirização Comercial (Não visualiza a aba "Rotas"; endpoints restritos a ADMIN ou SELLER).
- **Authorities Spring Security:** `ROLE_USER`.

### 3. Papel SELLER (Vendedor Externo / Comercial)
- **Acesso:** Exclusivo às operações de roteirização e vendas externas.
- **Módulos Permitidos:**
  - Roteirização Comercial (Criação de itinerários, otimização com IA, reordenação manual, cálculo de trânsito)
  - Calendário de Rotas Agendadas (Consulta e agendamento)
  - Gestão de Pontos Salvos (Locais frequentes e clientes)
  - Alteração de Senha própria
- **Módulos Bloqueados:**
  - Produtos, Categorias, Fornecedores, Banners e Usuários (Não visualiza abas de CRUDs; endpoints restritos).
- **Authorities Spring Security:** `ROLE_SELLER`.

---

## [P-108] Resiliência de Identificação de Papel no Frontend
1. **Claims no Token JWT:** O backend deve emitir o token JWT contendo obrigatoriamente as claims `sub` (e-mail), `role` (papel) e `name` (nome).
2. **Decodificação Síncrona na Inicialização:** O frontend deve decodificar o token JWT e armazenar o papel e e-mail imediatamente na sessão, evitando que o painel administrativo inicie com estado de papel nulo (`null`), o que geraria bloqueios indevidos com cadeados na interface.
3. **Consistência Cross-Origin:** O `TokenService` deve persistir e recuperar cookies de sessão no próprio domínio do cliente com `SameSite=Strict`, garantindo leitura imediata mesmo em ambientes com APIs desacopladas.
