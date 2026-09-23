# Componentes — Módulo Admin

> **Data de criação:** 23/09/2026

---

## `AdminComponent`

**Seletor:** `app-admin`  
**Arquivo:** [`admin.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/admin/admin.component.ts)

### Signals

| Signal | Tipo | Descrição |
|--------|------|-----------|
| `pageTitle` | `Signal<AdminTab>` | Tab ativa atual |
| `isEntityModalOpen` | `Signal<boolean>` | Modal de criação/edição aberto |
| `isConfirmModalOpen` | `Signal<boolean>` | Modal de confirmação de exclusão |
| `cascadeItems` | `Signal<any[] \| undefined>` | Produtos vinculados ao fornecedor a excluir |
| `modalMode` | `Signal<'create' \| 'edit'>` | Modo do modal entity |
| `selectedItem` | `Signal<any>` | Item selecionado para edição/exclusão |
| `currentUserRole` | `Signal<'ADMIN' \| 'USER' \| null>` | Role do usuário logado |
| `isSaving` | `Signal<boolean>` | Operação de save/delete em andamento |
| `isResponseModalOpen` | `Signal<boolean>` | Modal de erro aberto |
| `responseStatus` | `Signal<number>` | Status HTTP para modal de erro |
| `responseMessage` | `Signal<string>` | Mensagem para modal de erro |
| `isToastOpen` | `Signal<boolean>` | Toast de sucesso visível |
| `toastMessage` | `Signal<string>` | Mensagem do toast |
| `currentPage` | `Signal<number>` | Página atual da tabela |
| `activeFilters` | `Signal<Record<string, string[]>>` | Filtros ativos por coluna |

### Computed Signals

| Computed | Tipo | Descrição |
|----------|------|-----------|
| `orderOptions` | `computed<string[]>` | Opções de ordenação conforme a tab ativa |
| `totalElements` | `computed<number>` | Total de registros da tab ativa |
| `columns` | `computed<TableColumn[]>` | Definição de colunas conforme a tab ativa |
| `tableData` | `computed<any[]>` | Dados formatados (imageUrl normalizada) da tab ativa |
| `hasActiveFilters` | `computed<boolean>` | Indica se há busca/ordenação/filtros ativos |
| `disableUserActions` | `computed<boolean>` | Desabilita ações em Usuários para role `USER` |

### FormControls

| Control | Descrição |
|---------|-----------|
| `search` | Busca textual (debounce 400ms) |
| `orderBy` | Ordenação da tabela |
| `passwordForm` | FormGroup para alteração de senha |

### Métodos Públicos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `loadData()` | — | Carrega dados da tab ativa com os filtros atuais |
| `onPageChange(page)` | `number` | Atualiza página e recarrega |
| `onFilterApply(event)` | `{key, values}` | Aplica filtro de coluna |
| `clearFilters()` | — | Reseta todos os filtros |
| `openAddModal()` | — | Abre modal em modo create |
| `onEdit(item)` | `any` | Abre modal em modo edit com dados do item |
| `onDelete(item)` | `any` | Abre modal de confirmação de exclusão |
| `handleSave(payload)` | `{form, image?}` | Executa create ou update conforme tab e modo |
| `confirmDelete()` | — | Executa delete do item selecionado |
| `changePassword()` | — | Envia requisição de alteração de senha |
| `showFeedback(status, message)` | `number, string` | Exibe toast (2xx) ou modal de erro |

---

## `AdminNavComponent`

**Seletor:** `app-admin-nav`  
**Arquivo:** [`admin-nav.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/admin/components/admin-nav/admin-nav.component.ts)

### Inputs

| Input | Tipo | Descrição |
|-------|------|-----------|
| `activeTab` | `AdminTab` (required) | Tab atualmente ativa |

### Outputs

| Output | Tipo | Descrição |
|--------|------|-----------|
| `tabChange` | `EventEmitter<AdminTab>` | Emite quando o usuário seleciona uma tab |

### Tabs Disponíveis

```typescript
type AdminTab = 'Usuários' | 'Produtos' | 'Categorias de Produtos' | 'Fornecedores' | 'Banners' | 'Alterar Senha';
```

| Tab | Ícone |
|-----|-------|
| Produtos | `fa-solid fa-box` |
| Categorias de Produtos | `fa-solid fa-tags` |
| Fornecedores | `fa-solid fa-truck-fast` |
| Banners | `fa-solid fa-image` |
| Usuários | `fa-solid fa-users` |
| Alterar Senha | `fa-solid fa-lock` |

### Métodos

| Método | Descrição |
|--------|-----------|
| `toggleMenu()` | Abre/fecha menu mobile |
| `selectTab(tab)` | Emite tab selecionada e fecha menu |
| `logout()` | Chama `authService.logout()` e navega para `/` |

---

## `DynamicTableComponent`

**Seletor:** `app-dynamic-table`  
**Arquivo:** [`dynamic-table.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/admin/components/dynamic-table/dynamic-table.component.ts)

### Inputs

| Input | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `columns` | `TableColumn[]` | required | Definição das colunas |
| `data` | `any[]` | required | Dados a exibir |
| `currentPage` | `number` | `0` | Página atual |
| `pageSize` | `number` | `10` | Itens por página |
| `totalElements` | `number` | `0` | Total de registros |
| `activeFilters` | `Record<string, string[]>` | `{}` | Filtros ativos por coluna |
| `disableActions` | `boolean` | `false` | Desabilita botões editar/excluir |

### Outputs

| Output | Tipo | Descrição |
|--------|------|-----------|
| `edit` | `EventEmitter<any>` | Item a editar |
| `delete` | `EventEmitter<any>` | Item a excluir |
| `pageChange` | `EventEmitter<number>` | Nova página solicitada |
| `filterApply` | `EventEmitter<{key, values}>` | Filtro de coluna aplicado |

### Computed

| Computed | Descrição |
|----------|-----------|
| `startItem` | `currentPage * pageSize + 1` |
| `endItem` | Mínimo entre `(currentPage+1)*pageSize` e `totalElements` |
| `totalPages` | `ceil(totalElements / pageSize)` |

---

## `ModalEntityComponent`

**Seletor:** `app-modal-entity`  
**Arquivo:** [`modal-entity.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/admin/components/modal-entity/modal-entity.component.ts)

### Inputs

| Input | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `type` | `'Usuários' \| 'Produtos' \| 'Categorias de Produtos' \| 'Fornecedores' \| 'Banners'` | required | Entidade gerenciada |
| `mode` | `'create' \| 'edit'` | `'create'` | Modo do modal |
| `data` | `any` | `null` | Dados para edição |
| `isLoading` | `boolean` | `false` | Desabilita botão salvar |

### Outputs

| Output | Tipo | Descrição |
|--------|------|-----------|
| `close` | `EventEmitter<void>` | Modal fechado |
| `save` | `EventEmitter<{form: any, image?: File}>` | Formulário válido submetido |

### Formulários por Tipo

| Tipo | Campos |
|------|--------|
| **Produtos** | `name`, `description`, `categoryName`, `supplierName`, `presentation`, `flavours` |
| **Usuários** | `name`, `email` (disabled em edit), `role` |
| **Fornecedores** | `name`, `isHighlighted` |
| **Categorias de Produtos** | `name` |
| **Banners** | `title`, `position`, `active` |

---

## `ModalConfirmComponent`

**Seletor:** `app-modal-confirm`  
**Arquivo:** [`modal-confirm.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/admin/components/modal-confirm/modal-confirm.component.ts)

### Inputs

| Input | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `itemName` | `string` | required | Nome do item a ser excluído |
| `cascadeItems` | `any[]` | — | Lista de itens que serão excluídos em cascata |
| `isLoading` | `boolean` | `false` | Botão de confirmar em estado loading |

### Outputs

| Output | Tipo | Descrição |
|--------|------|-----------|
| `close` | `EventEmitter<void>` | Modal fechado sem confirmação |
| `confirm` | `EventEmitter<void>` | Exclusão confirmada |

---

## `TableFilterComponent`

**Seletor:** `app-table-filter`  
**Arquivo:** [`table-filter.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/admin/components/table-filter/table-filter.component.ts)

### Inputs

| Input | Tipo | Descrição |
|-------|------|-----------|
| `options` | `FilterOption[]` | Opções de filtro `{label, value}` |
| `selectedValues` | `string[]` | Valores já selecionados |

### Outputs

| Output | Tipo | Descrição |
|--------|------|-----------|
| `applyFilter` | `EventEmitter<string[]>` | Array de valores selecionados ao aplicar |

### Comportamento

- Usa estado pendente (`pendingSelected`) — seleções não são aplicadas até clicar em "Aplicar"
- Busca interna com Signal `searchTerm` + `filteredOptions` computed
- Fecha ao clicar fora via `@HostListener`
- "Limpar" emite array vazio e fecha
