# Contrato de API: Auth

Este documento descreve a integração do Frontend com a API de Autenticação (`AuthService`).

## 1. Visão Geral
Serviço responsável por login, registro e atualização do token JWT (refresh). Base URL aponta para `/auth`.

## 2. Endpoints

### 2.1. `POST /auth/login`
**Objetivo:** Autentica usuário.
**Requisição:**
- Payload: `LoginReq` (email, password)
**Resposta de Sucesso:**
- `LoginRes` (token JWT)
**Integração UI:**
- Token JWT é salvo no local storage pelo serviço e usado via Interceptor.

### 2.2. `POST /auth/register`
**Objetivo:** Registra novo usuário.
**Requisição:**
- Payload: `RegisterReq` (name, email, role)
**Resposta:**
- Vazia (`void`)

### 2.3. `POST /auth/refresh`
**Objetivo:** Atualiza Token JWT.
**Requisição:**
- Corpo vazio (`{}`)
**Resposta:**
- `LoginRes` (novo token JWT)
