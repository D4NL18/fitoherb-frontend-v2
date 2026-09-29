# Regras de Negócio: Produtos

- **P-001:** O slug do Produto não é mais baseado apenas no nome, mas na combinação de Nome do Produto e Nome do Fornecedor (gerado automaticamente pelo backend no formato `nome-do-produto-nome-do-fornecedor`).
- **P-002:** O frontend não deve enviar a propriedade `slug` no payload de criação.
- **P-003:** O slug do produto será alterado pelo backend se houver modificação no nome do produto ou na categoria/fornecedor ao fazer uma requisição de atualização.
- **P-004:** Para visualização e edição de produtos já existentes, o frontend deve usar o `slug` fornecido nas respostas da API (como em `GET /products/gallery`).
- **P-005:** Diferentes fornecedores podem ter produtos com nomes idênticos, mas o mesmo fornecedor não pode ter produtos com nomes repetidos. Tentar duplicar nome no mesmo fornecedor irá resultar em erro `HTTP 409 Conflict`.
