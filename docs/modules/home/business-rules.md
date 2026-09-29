# Regras de Negócio — Módulo Home

> **Data de criação:** 23/09/2026

---

## Carousel de Banners

1. **Somente banners ativos** são exibidos no carousel — endpoint `GET /banners/active` retorna apenas registros com `active: true`
2. Se a API não retornar nenhum banner ativo, o carousel fica vazio (sem erros na tela)
3. O autoplay ocorre a cada **10 segundos** e é pausado quando o mouse entra no carousel
4. Banners com `imagePath` relativo recebem o prefixo `environment.imagesBaseUrl`
5. O carousel usa a técnica de **clones infinitos**: o último banner é duplicado no início e o primeiro no final para simular loop contínuo sem saltos visuais
6. Drag/swipe de mais de 10px de diferença aciona navegação; menos de 10px retorna ao slide atual
7. O carousel é destruído adequadamente no `ngOnDestroy` (limpa o `setInterval`)

## Categorias

1. As categorias são carregadas via `ProductCategoriesService.getAll()` no `ngOnInit`
2. São exibidas todas as categorias retornadas pela API (sem filtro client-side)
3. Clicar em uma categoria navega para `/produtos?category=<slug>`
4. URLs de imagem relativas recebem prefixo `environment.imagesBaseUrl`

## Stats Animados

1. A animação é disparada **uma única vez** (`animatedStats = false`) quando a seção entra na viewport com threshold de 10%
2. Duração da animação: **800ms** (mais rápida que o About)
3. Valores finais: **1800** produtos, **28** anos, **2000** clientes
4. Usa `setInterval` a 60fps para incremento suave

## Scroll-Reveal

1. As seções `#aboutSection`, `#productsSection` e `#contactSection` são observadas pelo `IntersectionObserver`
2. A classe `is-visible` é adicionada quando a seção entra na viewport (threshold: 10%)
3. A animação **não remove** a observação após disparar (diferente do About) — pode re-animar se o usuário rolar para cima e voltar
