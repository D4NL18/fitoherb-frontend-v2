# Design Plan: Modal de Escolha de Exportação de PDF & Busca Fuzzy

> **Feature:** Exportação de PDF com/sem mapa & Busca de locais por similaridade  
> **Referência:** `DESIGN_SYSTEM.md` | `UI_ANTI_PATTERNS.md`  
> **Status:** Aprovado para Implementação  

---

## 1. Visão Geral da Interface

Aprimorar a experiência do vendedor na aba de **Rotas** através de duas melhorias-chave:
1. **Modal de Escolha de Exportação de PDF:** Diálogo modal que permite ao vendedor optar entre gerar o relatório completo com mapa ou a listagem executiva rápida sem mapa.
2. **Autocomplete com Tolerância a Erros:** Destaque visual na lista de sugestões de busca, exibindo resultados por similaridade e proximidade com badges sutis.

---

## 2. Anatomia do Modal de Exportação (`pdf-export-modal`)

### Estrutura
- **Backdrop:** Fundo escurecido suave `rgba(15, 23, 42, 0.65)` com `backdrop-filter: blur(4px)`.
- **Card Central:** `max-width: 520px`, `border-radius: 16px`, borda sutil `rgba(226, 232, 240, 0.8)`.
- **Header:**
  - Ícone de documento em badge circular azul (#EFF6FF / #1E3A8A).
  - Título: "Exportar Roteiro Oficial"
  - Subtítulo: "Escolha o formato ideal para impressão ou envio ao vendedor."
  - Botão fechar (X) no canto superior direito.
- **Corpo (Opções em Grid de 2 Colunas ou Stack de Cards):**
  - **Opção A — Com Mapa:**
    - Ícone: `fa-map-location-dot` em destaque (#3B82F6).
    - Título: "Com Mapa Ilustrativo"
    - Descrição: "Inclui visualização cartográfica de alta resolução e tabela completa de paradas."
    - Badge: "Mais Completo"
  - **Opção B — Sem Mapa:**
    - Ícone: `fa-table-list` em destaque (#10B981).
    - Título: "Apenas Tabela de Paradas"
    - Descrição: "Geração instantânea e formato condensado para consulta rápida em campo."
    - Badge: "Mais Rápido"
- **Footer:**
  - Botão de cancelamento neutro ("Cancelar").

---

## 3. Estados dos Componentes (Anti-IA Checklist)
- **Normal:** Cards com fundo suave, borda cinza clara (#E2E8F0).
- **Hover:** Elevação sutil `transform: translateY(-2px)`, sombra suave e realce de borda na cor primária (#1E3A8A).
- **Active / Click:** Feedback de clique instantâneo com escala de `0.98`.
- **Loading:** Spinner discreto e desabilitação de novos cliques durante a renderização do PDF.

---

## 4. Auditoria Anti-IA Slop
- Sem gradientes neon genéricos ou roxos clichês.
- Uso estrito das cores corporativas Fitoherb (Azul Marinho `#1E3A8A`, Verde Saúde `#10B981`, Cinza Neutro `#4B5563`).
- Sem layout estático: suporte a foco acessível, tecla ESC para fechamento e bloqueio de scroll do body enquanto o modal estiver aberto.
