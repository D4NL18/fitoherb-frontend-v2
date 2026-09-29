# Regras de Negócio — Módulo Contact

> **Data de criação:** 23/09/2026

---

## Validação do Formulário

1. O formulário usa `ReactiveFormsModule` com `FormBuilder`
2. O campo **Empresa** é opcional (não tem `Validators.required`)
3. O **Telefone** aceita os formatos: `(DD) 99999-9999`, `(DD) 9999-9999`, `DD999999999` etc. (regex: `/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/`)
4. A **Mensagem** requer mínimo de 10 caracteres
5. O **Nome** requer mínimo de 3 caracteres
6. Se o formulário for inválido ao submeter, `markAllAsTouched()` é chamado para exibir todos os erros

## Envio de E-mail

1. O destinatário é sempre `environment.contactRecipient` (`comercial@fitoherb.com.br`) — não configurável pelo usuário
2. O corpo do e-mail é formatado como:
   ```
   [<empresa> | N/A] <nomeCompleto> - <email>
   <telefone>
   
   <mensagem>
   ```
3. O assunto do e-mail é exatamente o assunto selecionado no dropdown
4. Após envio bem-sucedido: modal de sucesso + formulário resetado + `formSubmitted = false`
5. Após erro: modal com status HTTP correspondente
   - Status `0`: "Servidor offline. Tente mais tarde."
   - Outros: "Erro ao processar envio."

## Estado de Loading

1. `MailService.isLoading` é um Signal readonly que indica se o envio está em andamento
2. O botão de envio fica em estado `loading` durante o envio, prevenindo duplo-clique

## Animação de Entrada

1. A seção de contato (`#contactSection`) tem animação via `IntersectionObserver` (threshold: 10%)
2. A observação é removida após o primeiro trigger
