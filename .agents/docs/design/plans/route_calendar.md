# Design Plan: Calendário de Rotas Agendadas (Route Calendar)

## 1. Visão Geral
A feature de Calendário de Rotas Agendadas permite aos vendedores (Sellers) planejar antecipadamente e consultar o histórico recente de suas rotas e entregas de forma intuitiva, através de um modal de calendário sobreposto ao visualizador de rotas atual.

## 2. Componentes da Interface

### 2.1 Botão Seletor de Data
- **Localização:** Integrado na barra superior do `SellerRoutesComponent`, ao lado dos controles existentes.
- **Apresentação:**
  - **Ícone:** Calendário (`fa-regular fa-calendar`).
  - **Texto:** Data atualmente selecionada, formatada (ex: 'Seg, 28 Set').
  - **Estilo:** Botão outline com borda `$gray-200`, estado normal com texto `$gray-900`. No estado de hover, deve apresentar fundo `$bg-green-base`.
- **Comportamento:** O clique aciona a abertura do Modal Calendário.

### 2.2 Modal Calendário
- **Fundo / Overlay:** A tela de fundo terá um overlay em `rgba(0,0,0,0.5)`.
- **Card (Container):** Centralizado na tela, com bordas arredondadas (12px), fundo branco (`$white`) e largura máxima fixa de `420px`.
- **Header do Modal:**
  - Exibe o mês e ano focados centralizados.
  - Controles de navegação nos cantos (Setas para o mês anterior `◀` e próximo `▶`).
- **Estrutura (Grid do Calendário):**
  - Grid de 7 colunas.
  - **Cabeçalhos dos Dias:** Fixo (Dom, Seg, Ter, Qua, Qui, Sex, Sáb) com cor `$gray-500`, font-weight 600, font-size 12px em uppercase.
- **Células dos Dias (Quadrados):**
  - Tamanho base: `48x48px` com `border-radius 8px`.
  - **Dia Atual:** Destacado com borda sólida `2px $green-600` e font-weight `bold`.
  - **Dia Selecionado:** Preenchimento com fundo `$green-600` e texto em `$white`.
  - **Dia com Rota Salva (Indicador):** Ponto verde (`6px dot`) localizado centralizado abaixo do número do dia.
  - **Dias Habilitados para Hover:** Recebem fundo `$bg-green-base` ao passar o mouse.
  - **Dias Desabilitados (Fora da Janela P-201/P-202):** Texto em cor `$gray-300`, cursor `not-allowed`, sem comportamento de hover.
  - **Preenchimento da Grid:** Dias do mês anterior ou próximo que entram para completar as semanas da grid ficam com cor `$gray-300` e não são clicáveis.
- **Footer do Modal:** Botão 'Hoje' (Today) que foca imediatamente no dia atual, facilitando o retorno ao dia vigente.

## 3. Estados Interativos

- **Carregamento (Loading):** Durante o carregamento das datas com rotas no backend, o modal exibe um **Skeleton Shimmer** na grid.
- **Seleção com Dados:** Quando o usuário clica em um dia que possui rota, o modal é fechado e a aplicação carrega automaticamente a rota no mapa principal.
- **Seleção Sem Dados (Novo Agendamento):** Quando o usuário clica em um dia válido mas sem rota salva, o modal é fechado, o mapa principal é limpo, e a interface entra em modo de criação livre.
- **Empty State (Pós-carregamento):** Se uma rota carregada não tiver paradas (após salvamento acidental parcial), exibir mensagem instrutiva no painel: 'Nenhuma parada salva para este dia'.

## 4. Responsividade (Design Fluido)
- **Mobile (< 640px):** Modal é transformado em comportamento full-screen, maximizando área de toque, e células dos dias reduzem para `40x40px`.
- **Tablet (640 - 1024px):** Modal ajusta-se para uma largura de `380px`.
- **Desktop (> 1024px):** Configuração padrão estabelecida com largura máxima de `420px`.

## 5. Diretrizes de Consistência
- Uso integral dos tokens definidos no Design System Fitoherb (A paleta primária verde `$green-600`, os tons de cinza `$gray-*`).
- Fontes primárias: Títulos em **Playfair Display**, Interface geral e números no calendário em **Outfit**.
- Aplicação do Filtro Anti-IA para evitar componentes visuais superestimados, mantendo-se fiel apenas às especificações aqui declaradas.
