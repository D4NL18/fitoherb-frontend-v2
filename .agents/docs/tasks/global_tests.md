# Tarefa: Testes Unitários Globais

> **Responsável Inicial:** Arquiteto
> **Fase do Workflow:** 4. Planejar as Tarefas

Este documento decompõe a implementação de testes unitários para toda a plataforma Fitoherb Frontend.

## 1. Escopo Técnico (Arquitetura de Testes)
- **Framework:** Karma + Jasmine (Padrão Angular 18).
- **Mocks:** Utilização ostensiva de `HttpTestingController` para simular as APIs descritas em `api-contracts/`.
- **Componentes Visuais:** Utilização de `fixture.detectChanges()` e verificação de renderização do DOM em componentes críticos.

## 2. Decomposição de Tarefas (Checklist)

### Fase 1: Setup e Fixes Core
- [ ] Criar branch isolada `test/P-000-global-tests` a partir da `develop`.
- [ ] Corrigir erro de compilação em `src/app/app.component.spec.ts` (Remover expectativa da propriedade `title`).
- [ ] Mapear testes base para a suíte de serviços (Mock de `environment.apiUrl`).

### Fase 2: Serviços (Integração de APIs)
- [ ] Testar `AuthService` (Login, Refresh, erro 401).
- [ ] Testar `BannersService` (P-006, paginação).
- [ ] Testar `ProductsService` (Filtros, paginação, CRUD).
- [ ] Testar `SuppliersService` (Cascata P-008).
- [ ] Testar `UsersService` (Roles, P-004, P-005).

### Fase 3: Shared Components
- [ ] Testar `@Input` e `@Output` no `ButtonComponent`.
- [ ] Testar reatividade no `InputComponent` e `SelectComponent`.
- [ ] Testar emissão e visibilidade no `ModalResponseComponent` e `ToastComponent`.

### Fase 4: Views / Features
- [ ] `LoginComponent`: Simular erro de login, sucesso de login e redirecionamento de rotas.
- [ ] `AdminComponent`: Navegação restrita.
- [ ] `GalleryComponent`: Acionamento do sinalizador de *loading* e *infinite scroll*.

---

## 3. Audit (Testes e Validação)
> **Atenção Tester:** Preencha abaixo as diretrizes de TDD que você vai caçar.

- **[TESTER-01]** Garantir que nenhum teste chame a API real (todos os `HttpClient` interceptados).
- **[TESTER-02]** Garantir que o `AuthService` persista corretamente o token no ambiente de testes sem quebrar estado entre um teste e outro.
