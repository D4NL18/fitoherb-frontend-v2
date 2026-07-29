# Business Rules: General (Globais)

> **Autor:** Analista de Requisitos
> **Objetivo:** Regras globais aplicáveis a todo o frontend.

## Paginação e Ordenação
- **P-001:** Todas as requisições de listas paginadas (Admin) devem inicializar a página em `0` e direção em `ASC` (Crescente).
- **P-002:** O campo de ordenação (`sortField`) padrão para entidades textuais é `name`, exceto Banners (`position`).

## Upload de Arquivos
- **P-003:** O envio de formulários que incluem arquivos binários (imagens) deve obrigatoriamente utilizar o padrão `FormData`. Os atributos textuais da entidade devem ser serializados como um `Blob` do tipo `application/json`, acoplados na requisição junto com o binário.
