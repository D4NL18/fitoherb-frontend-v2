# Contrato de API: Product

Este documento descreve a integração do Frontend com a API de Produtos (`ProductsService`).

## 1. Visão Geral
Catálogo de produtos da Fitoherb, com chamadas específicas para Galeria e Admin.

## 2. Endpoints

### 2.1. `GET /products/gallery`
**Objetivo:** Busca produtos da galeria pública, suportando filtros (categorias, fornecedores).
**Retorno:** `PageResponse<ProductRes>`

### 2.2. `GET /products`
**Objetivo:** Paginação para gestão administrativa.
**Retorno:** `PageResponse<ProductRes>`

### 2.3. `GET /products/{slug}`
**Objetivo:** Busca detalhes do produto.
**Retorno:** `ProductRes`

### 2.4. `POST /products` e `PUT /products/{slug}`
**Objetivo:** Cria e altera produto via FormData.
**Requisição:**
- `product`: Blob JSON (dados do Produto, incluindo `categorySlug` e `supplierSlug`).
- `image`: File.
