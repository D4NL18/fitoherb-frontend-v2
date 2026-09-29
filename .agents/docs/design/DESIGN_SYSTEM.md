# Design System — Fitoherb Frontend v2

> **Data de criação:** 23/09/2026  
> **Arquivos fonte:** [`src/colors.scss`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/colors.scss) · [`src/styles.scss`](file:///c:/Users/PC/Documents/GitHub/fitoherb-frontend-v2/src/styles.scss)

---

## Paleta de Cores

### Verde Principal

| Token SCSS | Hex | Uso |
|------------|-----|-----|
| `$green-900` | `#1a2d14` | Fundo escuro, textos de alto contraste |
| `$green-800` | `#243d1c` | Gradientes escuros |
| `$green-700` | `#2e4f24` | Hover de elementos de navegação |
| `$green-600` | `#38582f` | **Cor primária** — botões, destaques, scrollbar |
| `$green-500` | `#4a7040` | Estados intermediários |
| `$green-400` | `#5d8a52` | Bordas, ícones secundários |
| `$green-300` | `#82b074` | Elementos decorativos |
| `$green-200` | `#b5d4a8` | Fundos de seção claros |
| `$green-100` | `#ddefd6` | Backgrounds muito claros |
| `$green-50` | `#f0f8eb` | Superfícies quase brancas |

### Cores Semânticas

| Token SCSS | Hex | Uso |
|------------|-----|-----|
| `$primary-color` | `#38582f` | Alias para a cor primária da marca |
| `$dark-green` | `#0f140f` | Fundos escuros do rodapé |
| `$forest-mid` | `#243620` | Gradiente do header |
| `$forest-light` | `#3e5a39` | Hover sutil em botões |

### Backgrounds

| Token SCSS | Hex | Uso |
|------------|-----|-----|
| `$bg-green-base` | `#f4f9f1` | Fundo padrão de seções verdes |
| `$bg-green-glow` | `#e3f0d8` | Efeito de brilho suave |
| `$bg-green-darker` | `#d0e6c1` | Separadores de seção |

### Neutros

| Token SCSS | Hex | Uso |
|------------|-----|-----|
| `$cream` | `#faf8f3` | Fundo do site, cards |
| `$white` | `#ffffff` | Superfícies absolutamente brancas |
| `$gray-100` | `#f5f5f0` | Fundo global (`body`) |
| `$gray-200` | `#e8e8e0` | Bordas sutis |
| `$gray-300` | `#d0d0c8` | Divisores |
| `$gray-500` | `#8a8a7a` | Texto secundário, placeholders |
| `$gray-700` | `#4a4a3a` | Texto de apoio |
| `$gray-900` | `#1a1a12` | Texto principal escuro |

### Feedback

| Token SCSS | Hex | Uso |
|------------|-----|-----|
| `$error` | `#c0392b` | Erros de validação, modais de erro |
| `$success` | `#27ae60` | Confirmações, modais de sucesso |
| `$warning` | `#e67e22` | Alertas |

### Especial

| Token SCSS | Valor | Uso |
|------------|-------|-----|
| `$footer-separator` | `rgba(255,255,255,0.1)` | Linhas divisórias no rodapé escuro |

---

## Tipografia

### Famílias de Fontes

| Contexto | Fonte | Fallback |
|----------|-------|---------|
| **Corpo/UI** | `Outfit` (Google Fonts) | `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Helvetica`, `Arial`, sans-serif |
| **Headings** | `Playfair Display` (Google Fonts) | `serif` |
| **Formulários** | `Outfit` | `sans-serif` |

```scss
// styles.scss
body {
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Playfair Display', serif;
}
```

---

## Componentes do UI Kit

### `ButtonComponent` — `<app-button>`

```html
<app-button
  label="Ver Produtos"
  variant="primary"
  size="medium"
  [icon]="'fa-solid fa-arrow-right'"
  [fullWidth]="false"
  [disabled]="false"
  [loading]="false"
  (btnClick)="onAction()"
/>
```

| Input | Tipo | Default | Opções |
|-------|------|---------|--------|
| `label` | `string` | *required* | — |
| `variant` | `string` | `'primary'` | `'primary'` · `'outline'` · `'white'` |
| `size` | `string` | `'medium'` | `'small'` · `'medium'` · `'large'` |
| `icon` | `string \| null` | `null` | Classe Font Awesome |
| `fullWidth` | `boolean` | `false` | — |
| `disabled` | `boolean` | `false` | — |
| `loading` | `boolean` | `false` | Exibe spinner, bloqueia clique |

**Output:** `btnClick: EventEmitter<void>`

---

### `InputComponent` — `<app-input>`

```html
<app-input
  id="email"
  label="E-mail"
  type="email"
  placeholder="seu@email.com"
  [required]="true"
  [icon]="'fa-solid fa-envelope'"
  [showError]="form.get('email')?.invalid && form.get('email')?.touched"
  errorMsg="E-mail inválido"
  formControlName="email"
/>
```

| Input | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `id` | `string` | *required* | ID do elemento HTML |
| `label` | `string` | — | Rótulo acima do campo |
| `type` | `string` | `'text'` | `'text'` · `'email'` · `'tel'` · `'number'` · `'password'` · `'date'` |
| `placeholder` | `string` | `''` | — |
| `required` | `boolean` | `false` | — |
| `icon` | `string \| null` | `null` | Classe Font Awesome |
| `showError` | `boolean` | `false` | Exibe borda vermelha e `errorMsg` |
| `errorMsg` | `string \| null` | `null` | Mensagem de erro |
| `autocomplete` | `string` | — | Atributo HTML autocomplete |

**Implementa `ControlValueAccessor`** — toggle de senha automático quando `type="password"`.

---

### `SelectComponent` — `<app-select>`

```html
<app-select
  id="assunto"
  label="Assunto"
  placeholder="Selecione o assunto"
  [options]="assuntos"
  [required]="true"
  [searchable]="true"
  [showError]="f['assunto'].invalid && f['assunto'].touched"
  errorMsg="Selecione um assunto"
  formControlName="assunto"
/>
```

| Input | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `id` | `string` | *required* | — |
| `options` | `string[]` | *required* | Lista de opções |
| `label` | `string` | — | — |
| `placeholder` | `string` | `'Selecione uma opção'` | — |
| `required` | `boolean` | `false` | — |
| `searchable` | `boolean` | `false` | Habilita busca interna com `filteredOptions` computed |
| `showError` | `boolean` | `false` | — |
| `errorMsg` | `string \| null` | `null` | — |

**Implementa `ControlValueAccessor`** — fecha ao clicar fora via `@HostListener('document:click')`.

---

### `TextareaComponent` — `<app-textarea>`

```html
<app-textarea
  id="mensagem"
  label="Mensagem"
  placeholder="Digite sua mensagem..."
  [rows]="6"
  [required]="true"
  [showError]="f['mensagem'].invalid && f['mensagem'].touched"
  errorMsg="Mensagem deve ter pelo menos 10 caracteres"
  formControlName="mensagem"
/>
```

**Implementa `ControlValueAccessor`** — mesmos padrões de `InputComponent`.

---

### `ModalResponseComponent` — `<app-modal-response>`

```html
<app-modal-response
  [status]="responseStatus()"
  [message]="responseMessage()"
  (close)="onCloseModal()"
/>
```

| Input | Tipo | Descrição |
|-------|------|-----------|
| `status` | `number` | Status HTTP (200-299 = sucesso, resto = erro) |
| `message` | `string` | Mensagem exibida no modal |

**Output:** `close: EventEmitter<void>`  
**Computed:** `isSuccess = status >= 200 && status < 300`

---

### `ToastComponent` — `<app-toast>`

```html
<app-toast [message]="toastMessage()" />
```

Toast de notificação rápida (sucesso). Exibido e ocultado pelo componente pai via signal `isToastOpen` com `setTimeout` de 4000ms.

---

## Padrões de Animação

### Scroll-Reveal com `IntersectionObserver`

Usado em: Home, About, Contact, Suppliers

```typescript
// Padrão típico nos componentes
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // Dispara apenas uma vez
    }
  });
}, { threshold: 0.1 });

observer.observe(this.aboutSection.nativeElement);
```

```scss
// SCSS do componente
.section {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;

  &.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Contadores Animados (Stats)

Usado em: Home (800ms), About (1200ms)

```typescript
private counter(endValue: number, key: keyof typeof this.stats, duration: number) {
  const frameRate = 1000 / 60;
  const totalFrames = Math.round(duration / frameRate);
  const increment = endValue / totalFrames;
  // ... setInterval atualiza o Signal a cada frame
}
```

### Botão "Voltar ao Topo"

Aparece apenas em `/produtos` quando `window.scrollY > 300`. Animação via `@keyframes fade-in`:

```scss
@keyframes fade-in {
  from { opacity: 0; transform: translate(-50%, -20px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}
```

---

## Responsividade

- `overflow-x: hidden` no `body` previne scroll horizontal
- `.main-content` tem `padding-top: 100px` para compensar a navbar fixa
- Todos os componentes compartilhados usam `box-sizing: border-box`
- Scrollbar customizada em `#38582f` com track `#f5f5f5`

---

## Focus Acessível

```scss
// styles.scss
button, input, select, textarea {
  &:focus { outline: none; }
  &:focus-visible {
    outline: 2px solid rgba(56, 88, 47, 0.4);
    outline-offset: 2px;
  }
}
```

O `outline` é removido no `focus` padrão (mouse) mas mantido no `focus-visible` (teclado), garantindo acessibilidade sem poluição visual.
