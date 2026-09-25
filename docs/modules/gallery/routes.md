# Rotas do Módulo Galeria de Produtos — Fitoherb Frontend

> **Path Principal:** `/produtos`  
> **Componente:** `GalleryComponent` (`src/app/views/gallery/gallery.component.ts`)  
> **Acesso:** Público (Catálogo aberto)  
> **Layout:** App Shell padrão (`NavComponent` e `FooterComponent`)

---

## 1. Configuração da Rota (`app.routes.ts`)

```typescript
{
  path: 'produtos',
  loadComponent: () => import('./views/gallery/gallery.component').then(m => m.GalleryComponent),
  title: 'Catálogo de Produtos — Fitoherb Nordeste'
}
```

---

## 2. Parâmetros de Query Suportados

A rota lê e sincroniza reativamente parâmetros via `ActivatedRoute`:
- `?category=<slug>`: Pré-filtra a listagem pela categoria especificada (ex: `/produtos?category=chas-e-infusoes`).
- `?supplier=<slug>`: Pré-filtra produtos pelo fornecedor parceiro (ex: `/produtos?supplier=fitoherb-natural`).
- `?search=<termo>`: Preenche o campo de busca com o termo informado.
- `?page=<numero>`: Índice da página para navegação direta e compartilhamento de links.

---

## 3. Estados de Navegação

- Atualizações de filtros alteram a URL via `queryParamsHandling: 'merge'` para permitir favoritar e compartilhar links de pesquisa específicos.
