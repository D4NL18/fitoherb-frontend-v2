# Regras de Negócio: Modal Tutorial de Roteirização Comercial

> **Localização Mandatória:** `.agents/docs/business_rules/routes_tutorial.md`  
> **Responsável:** Analista (`business-rules-expert`)  
> **Feature:** Guia Passo a Passo da Roteirização Comercial (Tour Guiado)

---

## 1. Contexto e Objetivo
- **User Story Relacionada:** US-13 — Guia Passo a Passo e Ajuda Contextual para Roteirização Comercial.
- **Objetivo da Feature:** Fornecer um tour sequencial explicativo em modal interativo, acionado pelo ícone "i" ao lado do título da página "Roteirização Comercial", orientando vendedores (público leigo de 40 a 60 anos) de forma simples, direta e prática sobre como operar todas as funcionalidades da tela de rotas.
- **Atores Envolvidos:** Vendedor (`SELLER`), Administrador (`ADMIN`).

---

## 2. Catálogo de Regras de Negócio (P-210 a P-215)

### `P-210`: Acesso ao Guia pelo Título da Página
- **Declaração Mandatória:** O sistema DEVE exibir um botão com o ícone "i" (`fa-solid fa-circle-info`) ao lado do título "Roteirização Comercial" no cabeçalho da página de rotas.
- **Condições de Ativação:** Sempre que a aba ativa no painel administrativo for "Rotas".
- **Resultado Esperado:** Ao clicar no ícone, abre-se o modal do tutorial no primeiro passo (Passo 1 de 7).

### `P-211`: Navegação Sequencial dos Modais
- **Declaração Mandatória:** O modal DEVE apresentar:
  1. Botão **"Próximo"** estilizado na cor verde primária da marca (`$green-600` / `#38582f`).
  2. Botão **"Anterior"** estilizado com fundo branco, borda preta sólida (`1.5px solid #1a1a12`) e texto escuro, habilitado a partir do Passo 2.
  3. No último passo, o botão "Próximo" deve mudar seu rótulo para **"Concluir"**, mantendo a estilização verde primária, e fechar o modal ao ser clicado.
  4. Botão de fechar (X) no topo direito, permitindo sair do tutorial a qualquer instante.

### `P-212`: Indicadores de Paginação (Bolinhas Centrais)
- **Declaração Mandatória:** A parte inferior central do modal DEVE exibir indicadores de página (bolinhas/dots) representando o total exato de passos e destacando visualmente o passo ativo no momento.
- **Interatividade:** O usuário DEVE poder clicar em qualquer bolinha para saltar diretamente ao passo desejado.

### `P-213`: Linguagem Direta e Acessível para Usuários Leigos
- **Declaração Mandatória:** O conteúdo explicativo DEVE ser formulado em linguagem simples, direta e instrucional, sem analogias metafóricas, focado em ações práticas ("Como fazer").
- **Tópicos Obrigatórios:**
  1. Visão Geral da Tela de Rotas.
  2. Calendário: agendamento futuro até 1 mês e histórico de 7 dias com rotas salvas.
  3. Busca de endereços e marcação de pontos no mapa.
  4. Ponto de Partida (Base) e Meus Favoritos.
  5. Prioridades de entrega e Fixação de Ordem manual (1ª parada fixa, etc.).
  6. Tempo de parada (minutos por visita, média automática caso preenchido parcialmente, desconsideração se nenhum for preenchido).
  7. Geração de rota inteligente, ajuste manual, filtro de trecho e exportação de PDF.

### `P-214`: Regras de Tempo de Parada
- **Declaração Mandatória:** A explicação sobre o tempo de parada DEVE explicitar os três comportamentos do sistema:
  1. *Todos preenchidos:* Cada cliente terá seu tempo individual respeitado.
  2. *Parcialmente preenchidos:* O sistema calcula a média aritmética dos pontos preenchidos e atribui aos que ficaram sem valor.
  3. *Nenhum preenchido:* O sistema desconsidera tempo de atendimento e calcula apenas o tempo de deslocamento no trânsito.

### `P-215`: Persistência de Estado e Acessibilidade
- **Declaração Mandatória:** O modal DEVE suportar fechamento via tecla `Escape` e clique no overlay exterior. O foco acessível (`:focus-visible`) DEVE estar presente em todos os botões e dots navegáveis.

---

## 3. Critérios de Aceitação (DoD)
- [x] Ícone "i" posicionado no cabeçalho ao lado de "Roteirização Comercial".
- [x] Modal com 7 passos temáticos estruturados.
- [x] Botão "Próximo" em verde e "Anterior" em branco com borda preta.
- [x] Dots inferiores centralizados e clicáveis.
- [x] Total conformidade com o Design System Fitoherb (Outfit + Playfair Display).
