# Componentes — Módulo Suppliers

> **Data de criação:** 23/09/2026

---

## `SuppliersComponent`

**Seletor:** `app-suppliers`  
**Arquivo:** [`suppliers.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/suppliers/suppliers.component.ts)

### Propriedades

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `suppliers` | `Signal<SupplierRes[]>` | Signal readonly do `SuppliersService` |
| `backendUrl` | `string` | `environment.imagesBaseUrl` para prefixar URLs |

### Computed Signals

| Computed | Descrição |
|----------|-----------|
| `sortedSuppliers` | Fornecedores ordenados (`isHighlighted` primeiro) com URLs normalizadas |

### ViewChild

| Ref | Uso |
|-----|-----|
| `suppliersGrid` | Elemento observado pelo IntersectionObserver |

### Métodos Públicos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `goToGallery(slug)` | `string` | Navega para `/produtos?supplier=<slug>` |

### Lifecycle

- `ngOnInit`: chama `supplierService.getAll()`
- `ngAfterViewInit`: inicializa `IntersectionObserver` no grid (threshold: 0)
