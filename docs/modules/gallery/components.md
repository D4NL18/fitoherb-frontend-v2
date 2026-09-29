# Componentes — Módulo Gallery

> **Data de criação:** 23/09/2026

---

## `GalleryComponent`

**Seletor:** `app-gallery`  
**Arquivo:** [`gallery.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/gallery/gallery.component.ts)

### Signals

| Signal | Tipo | Descrição |
|--------|------|-----------|
| `selectedCategories` | `Signal<string[]>` | Slugs das categorias selecionadas |
| `selectedSuppliers` | `Signal<string[]>` | Slugs dos fornecedores selecionados |
| `currentPage` | `Signal<number>` | Página atual (0-indexed) |
| `selectedProduct` | `Signal<ProductRes \| null>` | Produto selecionado no modal |
| `isModalOpen` | `Signal<boolean>` | Estado do modal de detalhes |
| `categoriesExpanded` | `Signal<boolean>` | Filtro de categorias expandido (default: true) |
| `suppliersExpanded` | `Signal<boolean>` | Painel de fornecedores expandido (default: false) |

### Computed Signals

| Computed | Tipo | Descrição |
|----------|------|-----------|
| `selectedIndex` | `computed()` | Índice do produto selecionado no array |
| `hasPrevProduct` | `computed()` | `selectedIndex > 0` |
| `hasNextProduct` | `computed()` | Há produto seguinte disponível (local ou via API) |

### FormControl

| Control | Tipo | Descrição |
|---------|------|-----------|
| `search` | `FormControl<string>` | Campo de busca com debounce 1000ms |

### Signals Derivados de Serviços

| Propriedade | Origem | Descrição |
|-------------|--------|-----------|
| `categories` | `ProductCategoriesService.productCategories` | Signal readonly |
| `suppliers` | `SuppliersService.suppliers` | Signal readonly |
| `products` | `ProductsService.productGallery` | Signal readonly de `PageResponse<ProductRes>` |
| `isLoading` | `ProductsService.isGalleryLoading` | Signal de loading |

### Métodos Públicos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `loadProducts(append, onSuccess?)` | `boolean, () => void` | Carrega produtos; `append=true` para infinite scroll |
| `resetAndSearch()` | — | Reseta página para 0 e recarrega |
| `toggleCategory(slug)` | `string` | Alterna seleção de categoria e atualiza URL |
| `toggleSupplier(slug)` | `string` | Alterna seleção de fornecedor e atualiza URL |
| `toggleCategoriesExpand()` | — | Expande/colapsa filtro de categorias |
| `toggleSuppliersExpand()` | — | Expande/colapsa painel de fornecedores |
| `clearCategories()` | — | Limpa todas as categorias selecionadas |
| `clearAllFilters()` | — | Limpa busca + categorias + fornecedores |
| `onOpenProductDetails(slug)` | `string` | Abre modal com o produto do slug |
| `onCloseModal()` | — | Fecha modal e limpa `selectedProduct` |
| `navigateProduct(direction)` | `1 \| -1` | Navega prev/next no modal |

### ViewChild

| Ref | Uso |
|-----|-----|
| `scrollAnchor` | Sentinel do infinite scroll |
| `productsGrid` | Cálculo dinâmico do tamanho de página |
| `suppliersBtn` | Detecta clique fora do painel de fornecedores |
| `suppliersPanel` | Detecta clique fora do painel de fornecedores |

---

## `ItemCardGalleryComponent`

**Seletor:** `app-item-card-gallery`  
**Arquivo:** [`item-card-gallery.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/gallery/components/item-card-gallery/item-card-gallery.component.ts)

> Card individual de produto na galeria. Ao clicar, emite evento para abrir o modal de detalhes.

---

## `ModalGalleryComponent`

**Seletor:** `app-modal-gallery`  
**Arquivo:** [`modal-gallery.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/gallery/components/modal-gallery/modal-gallery.component.ts)

> Modal de detalhes do produto com suporte a navegação prev/next. Recebe `selectedProduct`, `hasPrev`, `hasNext` como inputs e emite `close`, `prev`, `next`.
