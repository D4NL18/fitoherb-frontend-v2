# Contrato de API: Busca de Endereços por Similaridade Geográfica

## Endpoint: `GET /api/v1/routing/search-address`

### Descrição
Realiza a pesquisa de estabelecimentos, logradouros e clientes no serviço geográfico, suportando erros ortográficos e ordenando os resultados prioritariamente pela proximidade à base comercial fornecida.

### Parâmetros de Query (Query Parameters)
| Parâmetro | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `q` | `string` | Sim | Termo ou nome do local a pesquisar (ex: "drogasil", "farmacia pag menos", "rua itaete"). |
| `lat` | `float` | Não | Latitude da base do vendedor para cálculo de proximidade. |
| `lon` | `float` | Não | Longitude da base do vendedor para cálculo de proximidade. |

### Resposta de Sucesso (`200 OK`)
Retorna um array JSON com os itens localizados, ordenados crescentemente por `_distance_km`.

```json
[
  {
    "lat": "-12.9714",
    "lon": "-38.5124",
    "name": "Drogasil",
    "display_name": "Drogasil, Avenida Sete de Setembro, Dois de Julho, Salvador, Bahia, 40060-001, Brasil",
    "_distance_km": 2.4,
    "address": {
      "road": "Avenida Sete de Setembro",
      "house_number": "",
      "suburb": "Dois de Julho",
      "city": "Salvador",
      "state": "Bahia",
      "postcode": "40060-001",
      "country": "Brasil"
    }
  }
]
```

### Tratamento de Falhas e Resiliência
- Se nenhum resultado for retornado pelo motor exato, o serviço aciona automaticamente o motor com tolerância a erros (Photon).
- Se a requisição externa falhar, retorna `[]` com status code `200` para não quebrar a digitação do frontend.
