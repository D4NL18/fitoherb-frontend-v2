# Especificação: Atualização de API de Produtos (Novo formato de Slug)

## Objetivo
Adaptar o frontend para a nova lógica de geração de slugs de produtos no backend, que agora inclui o nome do fornecedor (ex: `product-name-supplier-name`).

## Tarefas (Checklist)

- [ ] **Task 1: Ajustar Tratamento de Erro na Criação e Atualização de Produtos**
  - **Onde:** `src/app/views/admin/admin.component.ts` (método `handleSave`)
  - **Ação:** Capturar especificamente o erro de status HTTP `409 Conflict` (que significa que a combinação de Nome do Produto e Fornecedor já existe).
  - **Critério de Aceite (UAT):** Quando a API retornar HTTP 409 ao criar ou editar um produto, o frontend deve exibir a mensagem amigável: *"Já existe um produto com este nome para este fornecedor."* através do componente de modal/toast de erro (`showFeedback`).

- [ ] **Task 2: Garantir que não há geração de slug no frontend (Auditoria)**
  - **Onde:** Base de código inteira.
  - **Ação:** Verificar se o frontend em algum momento tenta adivinhar ou gerar o slug de produto baseado apenas no nome (o que quebraria com a nova regra do backend). Pelas verificações iniciais, não há.
  - **Critério de Aceite (UAT):** Confirmado que o frontend apenas consome a propriedade `slug` enviada na resposta da API e não gera URLs manualmente com base em nomes convertidos. (Concluído durante análise inicial).

## Dúvidas e Decisões
- O payload de envio (Form Data) e as respostas JSON permanecem inalterados estruturalmente (a API apenas espera que o `productReq` seja enviado conforme definido no contrato e processa o slug no backend).
- Portanto, não há mudanças a serem feitas nos arquivos de interfaces (`ProductReq.interface.ts`, `ProductRes.interface.ts`).
