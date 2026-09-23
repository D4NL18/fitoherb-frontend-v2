# Componentes — Módulo Home

> **Data de criação:** 23/09/2026

---

## `HomeComponent`

**Seletor:** `app-home`  
**Arquivo:** [`home.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/home/home.component.ts)

### Signals e Estado

| Signal | Tipo | Descrição |
|--------|------|-----------|
| `stats.products` | `Signal<number>` | Contador animado de produtos |
| `stats.years` | `Signal<number>` | Contador animado de anos |
| `stats.clients` | `Signal<number>` | Contador animado de clientes |

### Computed

| Computed | Tipo | Descrição |
|----------|------|-----------|
| `productCategories` | `computed()` | Categorias com URL de imagem normalizada |

### ViewChild

| Ref | Tipo | Seção |
|-----|------|-------|
| `aboutSection` | `ElementRef` | Seção "Sobre" — observada pelo IntersectionObserver |
| `productsSection` | `ElementRef` | Seção de categorias |
| `contactSection` | `ElementRef` | Seção CTA |

### Métodos Públicos

| Método | Descrição |
|--------|-----------|
| `goToProducts()` | Navega para `/produtos` |
| `goToCategory(slug: string)` | Navega para `/produtos?category=<slug>` |
| `goToContact()` | Navega para `/contato` |
| `goToAbout()` | Navega para `/quem-somos` |

### Métodos Privados

| Método | Descrição |
|--------|-----------|
| `initScrollObserver()` | Inicializa `IntersectionObserver` para as 3 seções |
| `animateNumbers()` | Dispara `counter()` para os 3 stats |
| `counter(endValue, key, duration)` | Anima um stat de 0 até `endValue` em `duration` ms a 60fps |

---

## `BannerCarouselComponent`

**Seletor:** `app-banner-carousel`  
**Arquivo:** [`banner-carousel.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/home/components/banner-carousel/banner-carousel.component.ts)

### Propriedades Internas

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `originalImages` | `string[]` | URLs dos banners ativos (sem clones) |
| `displayImages` | `string[]` | Array com clones: `[último, ...originais, primeiro]` |
| `currentIndex` | `number` | Índice atual (começa em 1) |
| `isTransitioning` | `boolean` | Flag para prevenir cliques duplos |
| `transitionTime` | `number` | Duração CSS da transição (0 ou 0.5s) |
| `currentTranslate` | `number` | Posição em % do carousel |
| `isDragging` | `boolean` | Flag de drag ativo |
| `autoplayInterval` | `any` | Handle do `setInterval` (10000ms) |

### Métodos Públicos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `next()` | — | Avança para o próximo slide |
| `prev()` | — | Volta para o slide anterior |
| `startAutoplay()` | — | Inicia autoplay de 10s |
| `stopAutoplay()` | — | Para o autoplay |
| `updateCarousel(withTransition)` | `boolean` | Atualiza posição com ou sem animação CSS |
| `onTransitionEnd(event?)` | `Event` | Gerencia loop infinito após animação |
| `onDragStart(event)` | `MouseEvent \| TouchEvent` | Inicia drag |
| `onDragMove(event)` | `MouseEvent \| TouchEvent` | Atualiza posição durante drag |
| `onDragEnd()` | — | Finaliza drag e decide direção |
| `onMouseEnter()` | — | Para autoplay ao hover |
| `onMouseLeave()` | — | Retoma autoplay ao sair do hover |

### Lifecycle

- `ngOnInit`: chama `bannersService.getActive()`
- `ngOnDestroy`: chama `stopAutoplay()` para evitar memory leak
- `effect()` no construtor: reage a mudanças em `activeBanners` e `isLoading` para rebuild do carousel
