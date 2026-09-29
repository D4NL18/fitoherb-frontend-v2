# Objetivos — Módulo Admin

> **Data de criação:** 23/09/2026

---

## Objetivo Principal

Permitir que a equipe da Fitoherb gerencie todo o conteúdo dinâmico do site sem necessidade de acesso técnico ao banco de dados ou servidor.

## Objetivos Específicos

| Objetivo | Como é Atingido |
|----------|----------------|
| CRUD completo de produtos | Formulário com imagem, descrição, categoria, fornecedor, sabores e apresentações |
| Gestão de categorias | CRUD com imagem para enriquecer a navegação na Home e Galeria |
| Gestão de fornecedores | CRUD com imagem e flag de destaque para a página de fornecedores |
| Gestão de banners | CRUD com controle de posição e status ativo/inativo |
| Gestão de usuários | Apenas para ADMIN: criar, editar e excluir usuários do sistema |
| Segurança granular | Role-based: `USER` não pode gerenciar usuários |
| Busca e filtros eficientes | Busca com debounce + filtros por coluna + ordenação |
| Feedback consistente | Toast para sucesso, Modal para erros |
| Autonomia da equipe | Alteração de própria senha sem suporte técnico |
