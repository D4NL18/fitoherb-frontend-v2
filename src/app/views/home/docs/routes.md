# Rotas do Módulo Home — Fitoherb Frontend

> **Path Principal:** `/`  
> **Componente:** `HomeComponent` (`src/app/views/home/home.component.ts`)  
> **Acesso:** Público (Sem autenticação necessária)  
> **Layout:** App Shell padrão (Exibe `NavComponent` e `FooterComponent`)

---

## 1. Configuração da Rota (`app.routes.ts`)

```typescript
{
  path: '',
  loadComponent: () => import('./views/home/home.component').then(m => m.HomeComponent),
  title: 'Fitoherb Nordeste — Distribuidora de Suplementos Naturais'
}
```

---

## 2. Parâmetros e Query Params

- **Fragmentos (Anchor Links):**
  - `/#sobre` — Rola suavemente até a seção institucional de apresentação.
  - `/#categorias` — Rola até a grade interativa de categorias de fitoterápicos.
  - `/#contato` — Rola até a chamada de parceria comercial.

---

## 3. Transições e Navegação de Saída

- **Clique em Card de Categoria:** Navega para `/produtos?category={slug}` com filtro pré-selecionado na galeria.
- **Clique em CTA "Fale Conosco":** Navega para `/contato`.
