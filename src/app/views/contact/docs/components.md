# Componentes — Módulo Contact

> **Data de criação:** 23/09/2026

---

## `ContactComponent`

**Seletor:** `app-contact`  
**Arquivo:** [`contact.component.ts`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/app/views/contact/contact.component.ts)

### Propriedades

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `contactForm` | `FormGroup` | Formulário reativo com campos de contato |
| `formSubmitted` | `boolean` | Flag de tentativa de submit |
| `modalData` | `{status, message} \| null` | Dados para o modal de resposta |
| `assuntos` | `string[]` | Opções fixas do dropdown de assunto |
| `phoneRegex` | `RegExp` | Regex de validação do telefone |

### Grupos do Formulário

```typescript
this.contactForm = this.fb.group({
  nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
  empresa:      [''],  // opcional
  email:        ['', [Validators.required, Validators.email]],
  telefone:     ['', [Validators.required, Validators.pattern(phoneRegex)]],
  assunto:      ['', [Validators.required]],
  mensagem:     ['', [Validators.required, Validators.minLength(10)]],
});
```

### ViewChild

| Ref | Uso |
|-----|-----|
| `contactSection` | Elemento observado pelo IntersectionObserver |

### Métodos Públicos

| Método | Descrição |
|--------|-----------|
| `onSubmit()` | Valida formulário e envia e-mail via `MailService` |
| `f` (getter) | Atalho para `contactForm.controls` |

### Lifecycle

- `ngOnInit`: inicializa `contactForm`
- `ngAfterViewInit`: registra IntersectionObserver (threshold: 0.1, unobserve após trigger)
