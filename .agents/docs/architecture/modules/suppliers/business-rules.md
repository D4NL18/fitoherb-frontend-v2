# Regras de Negócio — Módulo Suppliers

> **Data de criação:** 23/09/2026

---

## Ordenação por Destaque

1. Fornecedores com `isHighlighted: true` **sempre aparecem antes** dos demais — ordenação client-side via `computed()`
2. Dentro do grupo de destacados e do grupo de não-destacados, a ordem é a retornada pela API
3. A ordenação é reativa — se o signal `suppliers` for atualizado, `sortedSuppliers` recalcula automaticamente

## Imagens

1. URLs relativas de imagem recebem o prefixo `environment.imagesBaseUrl`
2. URLs que já começam com `http` são usadas diretamente
3. URLs que começam com `assets/` são usadas diretamente (imagens locais)

## Navegação

1. Clicar em um fornecedor navega para `/produtos?supplier=<slug>` — o catálogo já abrirá filtrado
2. A navegação usa `Router.navigate()` com `queryParams`

## Animação

1. O grid de fornecedores (`#suppliersGrid`) tem animação de entrada via `IntersectionObserver`
2. **Threshold de 0** — a animação dispara assim que qualquer pixel do grid entra na viewport
3. A observação é removida após o primeiro trigger (`observer.unobserve`)
