# Correção: LGPD e Autenticação Segura (Remember Me)

## Problema
Durante a auditoria, identificou-se que o e-mail do usuário estava sendo salvo no `localStorage` sob a chave `remember_login` (em formato Base64) para a funcionalidade "Lembrar-me". Essa prática expunha Dados Pessoais Identificáveis (PII) e gerava uma falsa sensação de segurança contra ataques XSS.

## Solução Arquitetural
A solução implementada removeu completamente o uso de `localStorage` para informações sensíveis, transferindo a gestão do estado da sessão para **Cookies HttpOnly**.

1. **Backend (`AuthController` / `SecurityFilter`)**:
   - Os cookies `fitoherb_jwt` (HttpOnly, restrito a leituras do servidor) e `fitoherb_user_email` (público, apenas para identificação na UI) agora são gerados no login.
   - Caso o usuário selecione "Mantenha-me logado", os cookies recebem um `Max-Age` de 30 dias. Caso contrário, configuram-se como cookies de sessão (`Max-Age = -1`).
   - Adicionada anotação `@NoArgsConstructor` na DTO `LoginReq` para corrigir um bug de desserialização que impedia a leitura do checkbox "rememberMe".
   - O `SecurityFilter` foi atualizado para remover aspas acidentais inseridas por codificadores de cookies do navegador, evitando falhas na validação do JWT (`InvalidTokenException`), que causavam deslogamentos (Erros 401).

2. **Frontend (`TokenService` / `AuthInterceptor` / `AuthGuard`)**:
   - O `TokenService` deixou de consultar `localStorage` para tokens e e-mails. Ele baseia-se agora na presença do cookie `fitoherb_user_email` para determinar se há uma sessão ativa (`isAuthenticated()`).
   - O interceptor `auth.interceptor.ts` foi configurado com `withCredentials: true` para garantir que o navegador envie o cookie `fitoherb_jwt` em todas as requisições XHR cross-origin seguras (localhost:4200 -> localhost:8080).
   - `LoginComponent` foi atualizado para redirecionar usuários automaticamente para `/admin` se já estiverem autenticados.

## Critérios de Aceite (UAT) Atingidos
- Nenhum dado PII (ex: e-mail) é mantido no `localStorage`.
- Funcionalidade "Mantenha-me logado" persiste a sessão por 30 dias na ausência do fechamento total do browser.
- O navegador gerencia automaticamente o preenchimento de senhas via seu cofre nativo de senhas, e não mais injetado pelo código.

## Passos para Teste
1. Logar marcando o checkbox de "Lembrar-me".
2. Fechar as abas e reabrir, certificando-se de que a navegação para `/admin` funciona.
3. Certificar-se que chamadas para APIs seguras como `/categories` não retornam 401 Unauthorized acidentalmente.
