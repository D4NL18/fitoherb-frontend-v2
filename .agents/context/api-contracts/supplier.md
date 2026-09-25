# Contrato de API: Supplier

Este documento descreve a integração do Frontend com a API de Fornecedores (`SuppliersService`).

## 1. Visão Geral
Gerencia fornecedores e destaque na plataforma.

## 2. Endpoints

### 2.1. `GET /suppliers/get-all`
**Objetivo:** Retorna todos os fornecedores.
**Retorno:** `SupplierRes[]`

### 2.2. `GET /suppliers` e `GET /suppliers/{slug}`
**Objetivo:** Paginação e busca por detalhe (Slug).

### 2.3. `POST /suppliers` e `PUT /suppliers/{slug}`
**Objetivo:** Criação e atualização via FormData.
- `supplier`: JSON
- `image`: File

### 2.4. `DELETE /suppliers/{slug}`
**Objetivo:** Remover fornecedor. Aceita `deleteProducts=true` como Query Param.
