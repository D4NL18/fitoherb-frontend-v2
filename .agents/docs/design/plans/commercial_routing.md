# Design Plan: Roteirização Comercial Inteligente (Seller Routes)

## 1. Visão Geral
Componente interativo para planejamento de rotas de vendedores no ecossistema Fitoherb, combinando visualização geoespacial (Leaflet), busca assistida com geocodificação reversa transparente (Nominatim) e motor genético de itinerário (Fitoherb AI).

---

## 2. Princípios de Interface e Filtro Anti-IA (Nutlope / Hallmark)
- **Zero Bootstrap Slop:** Cores exclusivas da paleta corporativa Fitoherb (Azul Marinho `#1E3A8A`, Âmbar Dourado `#F59E0B`, Verde Esmeralda `#10B981` e cinzas neutros de alto contraste).
- **Sem Exposições Técnicas Indevidas:** Não expor coordenadas geográficas (latitude/longitude) nem parâmetros de hiperparâmetros de machine learning (população, mutação, etc.) ao vendedor.
- **Empty States e Skeleton Loaders:** Feedback visual imediato durante geocodificação reversa e otimização da rota.
- **Hierarquia Visual:** O mapa ocupa a área dominante (lado esquerdo com 580px de altura), e a barra lateral à direita permite alternar entre gestão de paradas e o resultado da rota sequenciada.

---

## 3. Elementos Gráficos e Componentes
1. **Mapa Interativo:** Leaflet OSM com marcadores estilizados (`divIcon`) contendo ícones temáticos (🏢 para base, `#N` para paradas e `🔒` para paradas com ordem fixa).
2. **Barra de Busca com Autocomplete:** Campo de entrada com ícone, botão de limpar e dropdown unificado de busca com resultados locais e remotos.
3. **Modal de Adição Rápida de Parada:** Disparado ao clicar no mapa; apresenta o endereço capturado automaticamente e solicita apenas título, tipo e prioridade.
4. **Exportação de PDF:** Layout formatado para página A4 (Portrait) com logotipo institucional Fitoherb, resumo de métricas, screenshot do mapa e tabela sequencial de paradas.
