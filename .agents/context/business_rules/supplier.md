# Business Rules: Supplier

> **Autor:** Analista de Requisitos
> **Objetivo:** Regras de negócio exclusivas para fornecedores.

## Relacionamentos
- **P-008:** Ao solicitar a exclusão de um fornecedor pelo painel, a interface deve permitir o acionamento em cascata utilizando o parâmetro `deleteProducts=true` caso seja desejo do administrador apagar o catálogo daquele parceiro.

## Destaques
- **P-009:** Fornecedores marcados com a flag `isHighlighted` ganham proeminência visual na página `/suppliers` na vitrine pública.
