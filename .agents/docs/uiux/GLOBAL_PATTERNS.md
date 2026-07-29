# UI/UX: Global Patterns

Este documento lista as diretrizes e padrões de usabilidade que permeiam toda a aplicação Fitoherb Frontend, dividida em dois eixos: Área Pública e Administrativa.

## 1. Descrição Visual
A aplicação adota um padrão limpo e responsivo. O layout público baseia-se em *landing pages* focadas em e-commerce institucional, enquanto o layout administrativo foca em Data Tables e formulários robustos para gestão eficiente de dados.

## 2. Tratamento de Estados (State Management UX)
- **Loading:** Utilização contínua de propriedades (ex: `isLoading`, `isGalleryLoading`) definidas nos *Signals* dos serviços para renderizar loaders (spinners/skeletons) bloqueando a UI de dupla submissão.
- **Empty States:** Páginas ou tabelas com resposta `empty: true` (da paginação `PageResponse`) devem sempre expor mensagens de que os dados não foram encontrados, incentivando navegação reversa (público) ou botões de nova criação (admin).
