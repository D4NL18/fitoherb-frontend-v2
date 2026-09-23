# Contrato de API: Product Category

Este documento descreve a integração do Frontend com a API de Categorias (`ProductCategoriesService`).

## 1. Visão Geral
Gerencia categorias de produtos.

## 2. Endpoints

### 2.1. `GET /product_categories/get-all`
**Objetivo:** Busca todas as categorias sem paginação.
**Retorno:** `ProductCategoryRes[]`

### 2.2. `GET /product_categories`
**Objetivo:** Busca com paginação.
**Retorno:** `PageResponse<ProductCategoryRes>`

### 2.3. `GET /product_categories/{slug}`
**Objetivo:** Detalhes de categoria via slug.
**Retorno:** `ProductCategoryRes`

### 2.4. `POST /product_categories` e `PUT /product_categories/{slug}`
**Objetivo:** Criar e atualizar categorias via FormData.
**Requisição:** FormData
- `product_category`: Blob JSON.
- `image`: File.
