# Componentes — Módulo About

> **Data de criação:** 23/09/2026

---

## `AboutComponent`

**Seletor:** `app-about`  
**Arquivo:** [`about.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/about/about.component.ts)

### Signals

| Signal | Tipo | Valor Final |
|--------|------|-------------|
| `stats.years` | `Signal<number>` | 28 |
| `stats.products` | `Signal<number>` | 1800 |
| `stats.partners` | `Signal<number>` | 2000 |
| `stats.brands` | `Signal<number>` | 40 |

### ViewChild

| Ref | Seção Observada |
|-----|----------------|
| `statsSection` | KPIs — threshold 0.3, dispara animação |
| `historySection` | Histórico da empresa |
| `mvvSection` | Missão, Visão e Valores |
| `gallerySection` | Galeria de fotos |
| `videoSection` | Vídeo institucional |
| `teamSection` | Seção de equipe |

### Métodos Privados

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `initScrollObserver()` | — | Registra IntersectionObserver para as 6 seções |
| `animateNumbers()` | — | Dispara `counter()` para os 4 stats |
| `counter(endValue, key, duration)` | `number, string, number` | Anima contagem de 0 até `endValue` em `duration` ms |

### Lifecycle

- `ngAfterViewInit`: chama `initScrollObserver()` após DOM disponível
