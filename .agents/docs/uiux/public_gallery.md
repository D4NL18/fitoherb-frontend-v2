# UI/UX: Área Pública e Galeria

Este documento mapeia as estruturas de tela públicas: Home, About, Contact, Gallery e Suppliers.

## 1. Descrição Visual
Telas de amplo espaçamento focadas em SEO e consumo fluido pelo cliente final.
- **Home:** Exibe um carrossel (Banners ativos) no topo e seções separadas para destques.
- **Galeria (`/gallery`):** Layout em Grid de cartões de produtos. Filtros ficam disponíveis tipicamente no lado esquerdo ou superior.
- **Fornecedores (`/suppliers`):** Exibição de logotipos/badges dos parceiros em formato de grade fluida.

## 2. Fluxo de Usuário
- **Acesso:** Direto pelas URLs e navegação superior (Header).
- **Galeria (Infinite Scroll):** À medida que o cliente desce a barra de rolagem, a aplicação invoca a próxima página se `last === false`. Os novos *cards* são concatenados em tela.

## 3. Edge Cases
- Sem resultados na Galeria após aplicar filtro de uma Categoria: Apresentar tela limpa com um botão para "Limpar filtros".
