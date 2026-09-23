# Objetivos — Módulo Login

> **Data de criação:** 23/09/2026

---

## Objetivo Principal

Prover autenticação segura via JWT para acesso ao painel administrativo, com UX simplificada e feedback claro em caso de erro.

## Objetivos Específicos

| Objetivo | Como é Atingido |
|----------|----------------|
| Segurança de acesso | JWT armazenado em cookie httpOnly-compatible com `withCredentials` |
| Persistência de sessão opcional | Checkbox "Lembrar-me" define `max-age` de 30 dias |
| Evitar acesso desnecessário | Redirecionamento automático para `/admin` se já autenticado |
| Feedback de erro claro | Modal com mensagens específicas por tipo de erro |
| Interface focada | Layout sem Nav/Footer para evitar distração |
