# Tarefas: Busca Inteligente por Similaridade e Modal de Exportação PDF

> **Branch:** `feat/routes-fuzzy-search-pdf-modal`  
> **Regras Relacionadas:** P-220 a P-225  
> **Status:** Em Andamento  

---

## Checklist de Implementação

### 1. Backend AI (`fitoherb-ai`)
- [x] Atualizar endpoint `/api/v1/routing/search-address` para incorporar busca híbrida com tolerância a erros (Photon OSM + Nominatim).
- [x] Normalizar respostas do Photon para o mesmo schema esperado pelo frontend (`display_name`, `name`, `lat`, `lon`, `address`).
- [x] Aplicar ordenação por distância geodésica em relação à base informada (`lat`, `lon`) via fórmula de Haversine.
- [x] Escrever testes unitários em `tests/test_address_search.py` para validar busca com erros ortográficos e ordenação por proximidade.

### 2. Frontend (`fitoherb-frontend-v2`)
- [x] Criar função de similaridade fuzzy no frontend (`stringSimilarity` / Levenshtein / normalização de acentos) para filtragem de locais salvos (`filteredSavedLocations`).
- [x] Atualizar `CommercialRoutingService.searchAddress` para garantir fallback resiliente a serviços com tolerância ortográfica.
- [x] Adicionar modal interativo `showExportPdfModal` com:
  - Título: "Exportar Roteiro Oficial"
  - Opção 1: "Com Mapa" (itinerário completo com mapa ilustrativo)
  - Opção 2: "Sem Mapa" (itinerário executivo rápido em tabela)
  - Botão Cancelar
- [x] Refatorar método `exportPdf(includeMap: boolean)` no `seller-routes.component.ts`:
  - Se `includeMap === false`: dispensa `html2canvas` e posiciona a tabela no topo (`y = 58mm`).
  - Se `includeMap === true`: captura o mapa e mantém o posicionamento clássico.
- [x] Estilizar o modal de acordo com o Design System da Fitoherb (SCSS moderno, sombras suaves, estados hover e responsividade).
- [x] Criar testes unitários no frontend (`seller-routes.component.spec.ts`) cobrindo as opções de exportação e busca fuzzy.
- [x] Remover botão manual de "Salvar Rota" do cabeçalho de controles (Regra P-226).
- [x] Implementar auto-save transparente (`autoSaveRoute`) acionado automaticamente ao gerar ou recalcular a rota (Regra P-226).
- [x] Atualizar tutorial interativo refletindo o comportamento de salvamento automático das rotas agendadas.

### 3. Validação e Qualidade
- [x] Rodar suíte de testes no backend `fitoherb-ai` (21 testes aprovados).
- [x] Rodar suíte de testes no frontend `fitoherb-frontend-v2` (28 testes aprovados).
- [x] Validação de build em produção (`ng build --configuration production`).
- [x] Revisão de código (Clean Code, LGPD e Anti-IA Vibe Check).
