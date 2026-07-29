# UI/UX: Autenticação (Login)

Este documento mapeia o fluxo visual de acesso ao sistema (`/login`).

## 1. Descrição Visual
Uma tela centralizada (*card* flutuante) isolada do resto do conteúdo, voltada unicamente para a captura de credenciais.

## 2. Fluxo de Usuário
- **Acesso:** Entrada pelo menu principal da área pública ou redirecionamento de tela restrita.
- **Ações Principais:** Preenchimento de `email` e `senha` -> Submissão.
- **Feedback Esperado:**
  - *Loading* no botão enquanto `/auth/login` está em andamento.
  - Se sucesso, redirecionamento para Home (se perfil USER) ou `/admin` (se perfil ADMIN).
  - Se erro 401, *toast* ou *inline alert* exibindo falha nas credenciais (do retorno de `AuthError`).
