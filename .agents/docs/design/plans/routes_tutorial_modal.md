# Design Plan: Modal Tutorial de Roteirização Comercial 📐🎨

> **Localização Mandatória:** `.agents/docs/design/plans/routes_tutorial_modal.md`  
> **Autor:** Designer (`designer.md`) / `uiux-expert`  
> **Auditor:** UX Reviewer (`ux_reviewer.md`)  
> **Referências:** `.agents/docs/design/DESIGN_SYSTEM.md` e `.agents/rules/frontend/UI_ANTI_PATTERNS.md`

---

## 1. Identificação & Objetivo
- **User Story:** US-13 — Guia Passo a Passo da Roteirização Comercial.
- **Objetivo de UX:** Auxiliar usuários com perfil leigo (vendedores de 40 a 60 anos com pouca familiaridade digital) a entender e utilizar com segurança todas as funcionalidades da tela de rotas, através de explicações visuais, concisas e práticas.

---

## 2. Checklist Anti-IA (Filtro Anti-Slop)
- [x] **Sem "AI Purple":** Cores estritas da paleta Fitoherb (`$green-600`, `$cream`, `$gray-900`).
- [x] **Tipografia com Font Pairing:** Títulos dos passos em `Playfair Display`, corpo e botões em `Outfit`.
- [x] **White Space Ativo:** Card do modal com respiro interno de 28px, tipografia legível (15px) com espaçamento de linha 1.6.
- [x] **Copywriting Humano e Direto:** Sem buzzwords ou metáforas abstratas; instruções no formato "O que é" e "Como fazer".
- [x] **Foco Acessível:** Todos os botões e dots com `:focus-visible` destacado.

---

## 3. Tokens do Design System Utilizados

| Token SCSS | Valor | Uso no Componente |
| :--- | :--- | :--- |
| `$green-600` | `#38582f` | Botão "Próximo" / "Concluir", dot ativo |
| `$forest-light` | `#3e5a39` | Hover do botão "Próximo" |
| `$white` | `#ffffff` | Fundo do card do modal e botão "Anterior" |
| `$gray-900` | `#1a1a12` | Borda do botão "Anterior", títulos e textos |
| `$gray-500` | `#8a8a7a` | Texto de apoio e dots inativos |
| `$gray-200` | `#e8e8e0` | Divisores e fundos de ícones |
| `$bg-green-base` | `#f4f9f1` | Fundo de destaque para badges temáticas |

---

## 4. Anatomia dos Componentes e Layout

### 4.1. Botão "i" no Cabeçalho
- Botão circular de 34x34px posicionado imediatamente ao lado do título `h1`.
- Ícone `fa-solid fa-circle-info` com cor `$green-600`, hover suave com leve escala e fundo `$bg-green-base`.

### 4.2. Estrutura do Modal (`RoutesTutorialModalComponent`)
1. **Overlay:** `rgba(0, 0, 0, 0.55)` com backdrop-blur suave e z-index 1100.
2. **Container (Card):**
   - Largura máxima de 540px, bordas arredondadas (16px), fundo branco, sombra profunda.
3. **Header do Modal:**
   - Badge com o número do passo (ex: "Passo 1 de 7") em verde suave.
   - Botão fechar (X) estilizado no canto superior direito.
4. **Área de Conteúdo (Body):**
   - Ícone temático ilustrativo com fundo circular suave.
   - Título do passo em `Playfair Display` (20px, negrito).
   - Lista de instruções diretas em itens com marcadores estilizados.
5. **Footer do Modal:**
   - **Esquerda:** Botão "Anterior" (Fundo branco, borda preta sólida de 1.5px, texto `#1a1a12`).
   - **Centro:** Bolinhas de paginação (dots de 8px, ativo expandido para 20px com cor verde).
   - **Direita:** Botão "Próximo" (Fundo verde `$green-600`, texto branco). No passo 7: "Concluir".

---

## 5. Responsividade
- **Mobile (< 640px):** Modal ajusta para 92vw, padding 20px, botões inferiores empilháveis ou compactos mantendo as bolinhas centrais visíveis.
- **Desktop (> 640px):** Modal equilibrado de 540px de largura.
