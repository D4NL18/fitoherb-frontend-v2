# Contrato de API: User

Este documento descreve a integração do Frontend com a API de Usuários (`UsersService`).

## 1. Visão Geral
Gestão de usuários da plataforma (Admin).

## 2. Endpoints

### 2.1. `GET /users` e `GET /users/{email}`
**Objetivo:** Paginação e detalhes por e-mail.

### 2.2. `PUT /users/{email}`
**Objetivo:** Atualiza dados do usuário (nome, perfil).
**Requisição:** Payload JSON (`UserReq`).

### 2.3. `PATCH /users/update-password/{email}`
**Objetivo:** Atualiza a senha.
**Requisição:** Payload JSON (`PasswordUpdateReq`).

### 2.4. `DELETE /users/{email}`
**Objetivo:** Excluir usuário.
