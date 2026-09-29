# Interfaces — Módulo Contact

> **Data de criação:** 23/09/2026

---

## `MailReq`

```typescript
// src/app/types/mail/MailReq.interface.ts
export interface MailReq {
  email: string;    // Destinatário (sempre environment.contactRecipient)
  subject: string;  // Assunto selecionado pelo usuário
  message: string;  // Corpo formatado da mensagem
}
```

### Formato do Corpo da Mensagem

```
[<empresa> | N/A] <nomeCompleto> - <email>
<telefone>

<mensagem>
```

### Exemplo de Payload Enviado

```json
// POST /emails/send-contact
{
  "email": "comercial@fitoherb.com.br",
  "subject": "Parceria Comercial",
  "message": "[Empresa XYZ] João Silva - joao@xyz.com.br\n(71) 99999-1234\n\nGostaria de discutir uma parceria..."
}
```
