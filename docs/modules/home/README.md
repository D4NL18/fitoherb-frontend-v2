# Módulo Home — Visão Geral

> **Data de criação:** 23/09/2026  
> **Rota:** `/`  
> **Componente principal:** [`HomeComponent`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/home/home.component.ts)

---

## Resumo

A página inicial é a vitrine principal da Fitoherb Nordeste. Ela combina elementos visuais impactantes com dados dinâmicos da API para apresentar a empresa, seu catálogo e seus diferenciais.

## Seções da Página

| # | Seção | Descrição |
|---|-------|-----------|
| 1 | **Banner Carousel** | Carousel infinito com autoplay (10s), drag/swipe, carregando banners ativos da API |
| 2 | **Categorias de Produtos** | Grid dinâmico de categorias com imagens; clicar navega para `/produtos?category=<slug>` |
| 3 | **Seção Sobre** | Breve apresentação da empresa com animação de entrada e stats animados |
| 4 | **Stats Animados** | Contadores: +1.800 produtos, 28 anos, +2.000 clientes — animados ao entrar na viewport |
| 5 | **CTA** | Botão de chamada para ação que navega para `/contato` |

## Sub-componentes

```
HomeComponent
├── BannerCarouselComponent   ← carousel de banners ativos
└── ButtonComponent           ← botões CTA
```

## Dependências de Serviços

- `ProductCategoriesService` — carrega categorias para o grid
- `BannersService` — carregado internamente pelo `BannerCarouselComponent`
