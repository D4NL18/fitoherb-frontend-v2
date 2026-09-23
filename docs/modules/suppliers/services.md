# Serviços — Módulo Suppliers

> **Data de criação:** 23/09/2026

---

## `SuppliersService`

**Arquivo:** [`suppliers.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/suppliers/suppliers.service.ts)

### Signal Utilizado

| Signal | Tipo | Descrição |
|--------|------|-----------|
| `suppliers` | `Signal<SupplierRes[]>` | Lista completa de fornecedores |

### Método

```typescript
getAll(): void
```

- **Endpoint:** `GET /suppliers/get-all`
- Atualiza `supplierState` com o array de todos os fornecedores
- Chamado em `ngOnInit` do `SuppliersComponent`
- O componente usa o signal `suppliers` via `computed()` para ordenação e normalização de URLs
