# Regras de Negócio: Busca Inteligente por Similaridade e Modal de Exportação PDF (P-220 a P-225)

Este documento estabelece as especificações das novas funcionalidades da aba de Rotas do painel administrativo, cobrindo o microserviço `fitoherb-ai` e o frontend `fitoherb-frontend-v2`.

---

## [P-220] Busca Tolerante a Erros e Similaridade Fonética/Tipográfica (Fuzzy Search)
1. O sistema não deve exigir que o operador digite o nome exato ou perfeito de um local, endereço ou cliente.
2. A pesquisa deve ser tolerante a:
   - Erros ortográficos e de digitação comuns (ex: "drogazil" vs "drogasil", "pag menos" vs "pague menos").
   - Variações com e sem acentuação (ex: "sao cristovao" vs "São Cristóvão").
   - Letras maiúsculas e minúsculas (*case-insensitive*).
   - Inversão na ordem das palavras digitadas.
3. **Locais Salvos (Favoritos e Base):**
   - O filtro local no frontend deve calcular a similaridade entre os termos pesquisados e o nome/logradouro/bairro do cliente cadastrado.
   - Correspondências parciais e com pequenas distâncias de edição devem ser incluídas na lista de sugestões.
4. **Busca Externa de Endereços:**
   - O microserviço `fitoherb-ai` (rota `/api/v1/routing/search-address`) e o serviço de mapa do frontend devem orquestrar motores de busca geográficos que suportam tolerância tipográfica (ex: Photon Geocoder baseado em Elasticsearch OSM), com fallback e unificação com Nominatim.

---

## [P-221] Priorização Geográfica por Proximidade da Base do Vendedor
1. Todos os resultados retornados na busca (tanto locais salvos quanto endereços externos) devem ser ranqueados com base na distância geodésica (fórmula de Haversine) em relação ao ponto de partida configurado:
   - Se o usuário possuir uma `BASE` cadastrada, utiliza a latitude/longitude da base.
   - Caso contrário, utiliza as coordenadas da matriz Fitoherb (*Rua Itaeté, 434 - Lauro de Freitas - BA*).
2. Se múltiplos locais possuírem nomes parecidos (ex: filiais de uma rede de farmácias), os locais mais próximos da base do vendedor devem figurar prioritariamente no topo da listagem de sugestões.

---

## [P-222] Modal de Confirmação e Opção de Formato de Exportação PDF
1. Ao clicar no botão de ação **"Exportar Roteiro em PDF"**, o sistema não deve disparar o download imediatamente.
2. Deve ser aberto um modal institucional (*Design System Fitoherb*) que questiona o usuário sobre o formato desejado:
   - **Opção "Com Mapa":** Gera o relatório completo com a renderização visual do mapa cartográfico e suas rotas coloridas, além da tabela de paradas.
   - **Opção "Sem Mapa":** Gera um relatório condensado em PDF, sem a captura visual do mapa, focado exclusivamente no itinerário tabular e KPIs de rota.
3. O modal deve dispor de:
   - Título e subtítulo explicativo claro.
   - Cards ou botões de seleção destacados para cada uma das duas opções com ícones descritivos.
   - Botão de cancelamento/fechamento que fecha o modal sem gerar o PDF.

---

## [P-223] Layout Condensado do PDF sem Mapa
1. Ao exportar na modalidade **"Sem Mapa"**:
   - O sistema dispensa a chamada ao `html2canvas`, proporcionando exportação instantânea e menor consumo de memória.
   - A tabela sequencial de visitas no PDF é iniciada imediatamente após o card de métricas/KPIs (`y = 58mm`), aproveitando integralmente o espaço vertical da primeira página A4.
2. Ao exportar na modalidade **"Com Mapa"**:
   - Mantém-se o layout clássico com o mapa renderizado na faixa intermediária e a tabela sequencial posicionada abaixo dele.

---

## [P-224] Feedback Visual de Processamento
1. Durante a geração do PDF, especialmente na modalidade "Com Mapa" onde ocorre captura assíncrona do canvas, deve ser exibido um estado de carregamento desabilitando novos cliques até a conclusão do download.
2. Após o download bem-sucedido, o sistema deve apresentar uma notificação toast de sucesso.

---

## [P-225] Resiliência e Continuidade Operacional
1. Caso a API de busca do microserviço esteja instável ou offline, o frontend deve acionar automaticamente os endpoints públicos com geocodificação tolerante, sem quebrar o fluxo de trabalho do vendedor.
