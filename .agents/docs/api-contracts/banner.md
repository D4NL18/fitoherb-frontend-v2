# Contrato de API: Banners

Este documento descreve a integração do Frontend com a API de Banners (`BannersService`).

## 1. Visão Geral
Gestão de Banners do sistema. Os banners ativos vão para a Home.

## 2. Endpoints

### 2.1. `GET /banners/active`
**Objetivo:** Busca banners ativos para a Home.
**Retorno:** `BannerRes[]` (Array)

### 2.2. `GET /banners`
**Objetivo:** Busca banners com paginação.
**Query Params:** `search`, `page`, `sortField`, `direction`.
**Retorno:** `PageResponse<BannerRes>`

### 2.3. `POST /banners` e `PUT /banners/{id}`
**Objetivo:** Cria e atualiza banners.
**Requisição:** FormData.
- `banner`: Blob JSON contendo as propriedades (title, position, active)
- `image`: File (opcional na edição)

### 2.4. `DELETE /banners/{id}`
**Objetivo:** Remove banner.
**Retorno:** `void`
