/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */

# Design Plan: Inteligência Demográfica por Cidade, Descoberta Proativa de Leads e Manejo em Lote (`commercial_routing_city_and_suggestions`) 📐🎨

> **Localização Mandatória:** `.agents/docs/design/plans/commercial_routing_city_and_suggestions.md`  
> **Autor:** Designer (`designer.md`) / `uiux-expert`  
> **Auditor:** UX Reviewer (`ux_reviewer.md`)  
> **Executor:** Desenvolvedor (`developer.md`)  
> **Referências:** [DESIGN_SYSTEM.md](file:///c:/Users/danie/Documents/Github/fitoherb-frontend-v2/.agents/docs/design/DESIGN_SYSTEM.md), [commercial_routing.md](file:///c:/Users/danie/Documents/Github/fitoherb-ai/.agents/docs/business_rules/commercial_routing.md), [frontend-ui-anti-patterns.md](file:///c:/Users/danie/Documents/Github/fitoherb-ai/.agents/rules/frontend-ui-anti-patterns.md) e [frontend-design-system-rules.md](file:///c:/Users/danie/Documents/Github/fitoherb-ai/.agents/rules/frontend-design-system-rules.md)

---

## 1. Identificação & Objetivo da Tarefa
- **User Stories Relacionadas:**
  - `US-R1` (`P-107`): Relatório de Inteligência Demográfica, Econômica e Comercial por Cidade Visitada na Rota.
  - `US-R2` (`P-108`): Descoberta Proativa de Leads no Trajeto (Sugestão de Farmácias e Lojas de Produtos Naturais não listadas).
  - `US-R3` (`P-109`): Manejo em Lote (Staging/Batch) de Sugestões e Paradas com Recálculo Diferido Único.
- **Objetivo de UX:**
  - Capacitar o vendedor Fitoherb a consultar instantaneamente o perfil socioeconômico (IBGE) de cada município da rota com argumentos comerciais acionáveis, visualizar novas oportunidades de prospecção (`Farmácias` e `Produtos Naturais`) diretamente na lista e no mapa com custo viário transparente (`+X.X km / +Y min`), e realizar o manejo rápido de múltiplas paradas/sugestões em lote (**0 ms de bloqueio de rede por clique**), disparando o recálculo OSRM/AG uma única vez ao concluir a curadoria da lista.

*(Documento espelhado a partir de `fitoherb-ai/.agents/docs/design/plans/commercial_routing_city_and_suggestions.md`)*
