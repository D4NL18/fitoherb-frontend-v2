# Regras de Negócio — Módulo Gallery

> **Data de criação:** 23/09/2026

---

## Filtros

1. **Multi-seleção** — categorias e fornecedores suportam múltiplos valores simultaneamente
2. **Persistência na URL** — filtros são refletidos nos query params (`?category=a&category=b&supplier=x`)
3. **Filtros iniciais via URL** — ao navegar para `/produtos?category=proteinas`, o filtro é aplicado automaticamente
4. **URL atualizada sem push de history** — usa `location.replaceState()` para não poluir o histórico do browser
5. **Clique fora fecha o painel de fornecedores** — implementado via `@HostListener('document:click')`
6. **"Limpar filtros"** reseta busca, categorias e fornecedores simultaneamente

## Busca

1. `debounceTime(1000)` + `distinctUntilChanged()` evita requisições durante digitação
2. A busca sempre reseta a página para `0` e faz fresh load (sem append)

## Paginação / Infinite Scroll

1. **Tamanho de página calculado dinamicamente** pelo número de colunas do grid:
   - `columns = floor((gridWidth + gap) / (minColWidth + gap))` onde `minColWidth=300`, `gap=32`
   - Tamanho de página = `columns * ceil(16 / columns)` (garante múltiplo do número de colunas)
   - Fallback: 16 itens se o grid ainda não estiver no DOM
2. **Append mode** — ao carregar mais páginas via scroll, os novos itens são **concatenados** ao array existente (não substituem)
3. O infinite scroll é disparado quando `#scrollAnchor` entra na viewport (threshold: 1 = totalmente visível)
4. Não dispara novo load se `products.last == true` (última página) ou se `products.content.length == 0`

## Modal de Detalhes

1. Ao abrir o modal, o produto é buscado no array já carregado (sem nova requisição à API)
2. **Navegação prev/next** dentro do modal:
   - `hasPrevProduct`: `selectedIndex > 0`
   - `hasNextProduct`: `selectedIndex < content.length - 1 || !products.last`
   - Se navegar para além dos itens carregados e não for a última página, **carrega a próxima página automaticamente** e seleciona o produto correto no callback `onSuccess`

## Botão "Voltar ao Topo"

1. Exibido **somente** quando `router.url === '/produtos'` E `window.scrollY > 300`
2. Scroll suave: `window.scrollTo({ top: 0, behavior: 'smooth' })`

## Skeleton Loader

1. Exibido enquanto `isGalleryLoading` (Signal readonly do `ProductsService`) for `true`
2. Desaparece ao receber a resposta da API
