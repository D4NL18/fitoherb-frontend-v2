# Rotas do Módulo Contato Institucional — Fitoherb Frontend

> **Path Principal:** `/contato`  
> **Componente:** `ContactComponent` (`src/app/views/contact/contact.component.ts`)  
> **Acesso:** Livre / Público  
> **Layout:** App Shell padrão

---

## 1. Configuração da Rota (`app.routes.ts`)

```typescript
{
  path: 'contato',
  loadComponent: () => import('./views/contact/contact.component').then(m => m.ContactComponent),
  title: 'Fale Conosco — Fitoherb Nordeste'
}
```

---

## 2. Ações de Envio e Feedback

- **Submissão do Formulário:** O envio bem-sucedido não altera a rota, mas reseta o formulário reativo e aciona o `modal-response` com mensagem de agradecimento.
- **Link Direto WhatsApp:** Abre em nova aba o link com mensagem pré-formatada para o número oficial de televendas da distribuidora.
