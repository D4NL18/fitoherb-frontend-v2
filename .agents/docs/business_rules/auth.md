# Business Rules: Auth

> **Autor:** Analista de Requisitos
> **Objetivo:** Regras de negócio relacionadas a login e segurança no frontend.

## Controle de Acesso
- **P-004:** O token JWT retornado no login deve ser armazenado pelo `TokenService` e interceptado e anexado em requisições para rotas sob `/admin`.
- **P-005:** A aplicação divide permissões em `'ADMIN'` e `'USER'`. Usuários `'USER'` não devem ver menus administrativos na navegação principal.
