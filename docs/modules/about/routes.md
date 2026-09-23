# Rotas do Módulo Quem Somos (About) — Fitoherb Frontend

> **Path Principal:** `/quem-somos`  
> **Componente:** `AboutComponent` (`src/app/views/about/about.component.ts`)  
> **Acesso:** Público (Livre)  
> **Layout:** Exibe barra de navegação e rodapé

---

## 1. Configuração da Rota (`app.routes.ts`)

```typescript
{
  path: 'quem-somos',
  loadComponent: () => import('./views/about/about.component').then(m => m.AboutComponent),
  title: 'Quem Somos — Fitoherb Nordeste'
}
```

---

## 2. Comportamento de Navegação

- **Carregamento:** Lazy-loading acionado ao acessar a URL.
- **Scroll Position:** Restaura ao topo da página automaticamente via `scrollPositionRestoration: 'enabled'`.
- **Links Internos:** Botão de parceria encaminha para `/contato`.
