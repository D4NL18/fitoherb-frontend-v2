# Serviços — Módulo Contact

> **Data de criação:** 23/09/2026

---

## `MailService`

**Arquivo:** [`mail.service.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/services/mail/mail.service.ts)

### Signal Público

| Signal | Tipo | Descrição |
|--------|------|-----------|
| `isLoading` | `Signal<boolean>` | `true` enquanto o e-mail está sendo enviado |

### Método

```typescript
sendEmail(mailReq: MailReq): Observable<any>
```

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `mailReq` | `MailReq` | Objeto com `email`, `subject` e `message` |

- **Endpoint:** `POST /emails/send-contact`
- Define `isLoading = true` antes do envio
- Define `isLoading = false` no `finalize()` (seja sucesso ou erro)
- Retorna um `Observable` — o componente faz o `subscribe` e gerencia o resultado

### Exemplo de Uso

```typescript
// ContactComponent
this.mailService.sendEmail(mailPayload).subscribe({
  next: () => {
    this.modalData = { status: 200, message: 'Sua mensagem foi enviada com sucesso!' };
    this.contactForm.reset();
  },
  error: (err) => {
    this.modalData = {
      status: err.status || 503,
      message: err.status === 0 ? 'Servidor offline. Tente mais tarde.' : 'Erro ao processar envio.'
    };
  },
});
```
