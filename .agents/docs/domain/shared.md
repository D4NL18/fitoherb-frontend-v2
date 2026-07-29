# Modelagem de Domínio: Shared

Este documento reflete as estruturas compartilhadas no frontend Fitoherb.

### `PageResponse<T>`
Padrão de resposta paginada.
- `content`: `T[]` (Lista de entidades)
- `totalPages`: number
- `totalElements`: number
- `size`: number
- `number`: number (Página atual, base 0)
- `first`: boolean
- `last`: boolean
- `empty`: boolean
