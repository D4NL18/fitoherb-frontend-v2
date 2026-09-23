# Módulo Contact — Visão Geral

> **Data de criação:** 23/09/2026  
> **Rota:** `/contato`  
> **Componente principal:** [`ContactComponent`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/contact/contact.component.ts)

---

## Resumo

Página de contato com formulário reativo validado. Ao submeter, os dados são formatados e enviados via `MailService` para o e-mail institucional `comercial@fitoherb.com.br`. O resultado é exibido via `ModalResponseComponent`.

## Campos do Formulário

| Campo | Validações | Obrigatório |
|-------|------------|-------------|
| Nome Completo | `required`, `minLength(3)` | ✅ |
| Empresa | — | ❌ |
| E-mail | `required`, `email` | ✅ |
| Telefone | `required`, `pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)` | ✅ |
| Assunto | `required` | ✅ |
| Mensagem | `required`, `minLength(10)` | ✅ |

## Assuntos Disponíveis

- Parceria Comercial
- Dúvidas sobre Produtos
- Trabalhe Conosco
- Sugestões ou Reclamações
- Outros Assuntos

## Sub-componentes

```
ContactComponent
├── InputComponent          ← nome, empresa, email, telefone
├── SelectComponent         ← dropdown de assunto
├── TextareaComponent       ← campo de mensagem
├── ButtonComponent         ← botão enviar
└── ModalResponseComponent  ← modal de sucesso/erro
```

## Dependências de Serviços

- `MailService.sendEmail(mailReq)` — envia e-mail via API
