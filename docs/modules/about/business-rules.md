# Regras de Negócio — Módulo About

> **Data de criação:** 23/09/2026

---

## Animações de Entrada

1. Cada seção (`statsSection`, `historySection`, `mvvSection`, `gallerySection`, `videoSection`, `teamSection`) é observada individualmente pelo `IntersectionObserver`
2. A animação é disparada com **threshold de 0.3** (30% da seção visível), mais restritivo que o Home (10%)
3. Após disparar, cada seção é **removida do observer** (`observer.unobserve(entry.target)`) — anima somente uma vez

## Stats Animados

1. A animação dos contadores é disparada **uma única vez** (`animatedStats` flag)
2. Duração: **1200ms** (mais lenta e dramática que o Home com 800ms)
3. Valores finais: **28** anos, **1800** produtos, **2000** parceiros, **40** marcas
4. A animação só dispara quando `statsSection` entra na viewport

## Conteúdo

1. Todo o conteúdo (história, MVV, galeria, vídeo, time) é **estático no template HTML** — não há chamadas à API
2. Não há dependências de serviços externos
