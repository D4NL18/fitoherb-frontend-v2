# Checklist de Implementação: Modal Tutorial de Roteirização Comercial

## 1. Dúvidas Resolvidas
- **Dúvida:** Onde posicionar o ícone "i"?
  - **Decisão:** Imediatamente ao lado do título `h1` "Roteirização Comercial" no cabeçalho do painel de administração (`AdminComponent`).
- **Dúvida:** Qual deve ser o estilo dos botões de navegação?
  - **Decisão:** Botão "Próximo" na cor verde principal (`$green-600`), botão "Anterior" branco com borda preta sólida, e bolinhas no centro na parte inferior.
- **Dúvida:** Como abordar a linguagem para usuários leigos de 40 a 60 anos?
  - **Decisão:** Instruções práticas e diretas, sem termos técnicos difíceis, sem metáforas ou analogias. Foco no "O que é" e "Como usar".

---

## 2. Tarefas e Etapas de Desenvolvimento

### Tarefa 1: Criação do Componente Standalone `RoutesTutorialModalComponent`
- [x] Criar arquivos `.ts`, `.html` e `.scss` em `src/app/views/admin/components/routes-tutorial-modal/`.
- [x] Implementar lista de 7 passos completos com títulos, ícones, tópicos objetivos e visual claro.
- [x] Implementar navegação com signals `currentStep = signal<number>(0)`.
- [x] Implementar bolinhas de paginação clicáveis no centro inferior.
- [x] Estilizar botão "Próximo" em verde e "Anterior" em branco com borda preta.
- [x] Suporte a tecla `Escape` e clique no overlay para fechar.

### Tarefa 2: Integração no Cabeçalho do Painel Admin
- [x] Inserir botão de informação com ícone "i" ao lado de `<h1>Roteirização Comercial</h1>` em `admin.component.html`.
- [x] Adicionar signal `isRoutesTutorialOpen = signal<boolean>(false)` no `admin.component.ts`.
- [x] Estilizar o botão no `admin.component.scss` com hover elegante e acessibilidade.
- [x] Incluir `<app-routes-tutorial-modal>` no template do `AdminComponent`.

### Tarefa 3: Validação e Qualidade
- [x] Executar build do Angular (`npx ng build`).
- [x] Testar responsividade e acessibilidade com teclado.
