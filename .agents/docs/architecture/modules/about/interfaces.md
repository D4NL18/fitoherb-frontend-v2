# Interfaces — Módulo About

> **Data de criação:** 23/09/2026

---

## Interfaces Utilizadas

O módulo About não utiliza interfaces externas — todo o conteúdo é estático no template. Os únicos dados gerenciados são os Signals internos de estatísticas:

```typescript
stats = {
  years:    signal(0),    // Target: 28
  products: signal(0),    // Target: 1800
  partners: signal(0),    // Target: 2000
  brands:   signal(0),    // Target: 40
};
```

Não há chamadas à API nem interfaces de domínio utilizadas neste módulo.
