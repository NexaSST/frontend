# Frontend web NexaSST

Primeira versão funcional do frontend web, construída com React 19, Vite 8 e TypeScript 7. Usa TanStack Router e Query, React Hook Form + Zod, Ky, Tailwind CSS 4, Sileo, Vitest/Testing Library e Playwright.

## Escopo entregue

- **Inspeções:** ativos, tipos de equipamento, categorias, templates de checklist e histórico de inspeções.
- **Treinamentos:** colaboradores, cursos, turmas, matrizes de treinamento e cadastros auxiliares.
- **APR:** atividades, templates, criação e edição de rascunhos e finalização de documentos.
- **Plataforma Master:** empresas, filiais, contratos, convites de acesso e gestão de papéis por empresa ou filial.
- **Operação:** navegação limitada aos módulos e ações liberados para o papel do usuário, com busca e paginação da API nas listagens de crescimento.
- **Analytics:** Visões gerais de Pessoas/Estrutura, Inspeções, Treinamentos e APR/PT, além do Dashboard Master, com agregados, filtros, séries e atenção paginada.

Os dashboards usam contratos específicos da API e não calculam métricas baixando listagens completas. O backlog residual está em [TODO.md](TODO.md).

## Execução local

Requer Node.js 22 ou superior.

```sh
npm install
npm run dev
```

O Vite encaminha `/v1`, `/health` e `/docs` para `http://127.0.0.1:3001`, mantendo cookies web na mesma origem durante o desenvolvimento. Inicie a API antes de testar com dados reais.

## Segurança da sessão

- O navegador usa somente `/v1/auth/{company|platform}/web/login`.
- Access e refresh permanecem em cookies `HttpOnly`; não há token em `localStorage`.
- O cliente envia o token do cookie `nexasst_csrf` no cabeçalho `X-CSRF-Token` em métodos inseguros.
- Uma resposta 401 dispara uma única tentativa compartilhada de refresh e repete a chamada uma vez.
- O contexto e as rotas Master/empresa vêm de `/v1/auth/me`.

## Componentes reutilizáveis

As primitives de interface ficam em [`src/components/ui`](src/components/ui/README.md): botões com variantes e tamanhos, inputs, selects, textareas, checkboxes, campos de formulário, badges, títulos e dropdowns. Tabelas, tabs, paginação e painéis compostos ficam em `src/features/shared.tsx`.

## Verificação

```sh
npm run check
npm run e2e
```

`npm run check` executa lint, TypeScript, testes unitários com Vitest e build de produção. `npm run e2e` valida com Playwright o fluxo principal de autenticação no Chromium.

## Versionamento

Código, testes, migrações, assets, documentação, `.env.example` e `package-lock.json` são versionados. Ambientes locais, credenciais, chaves de assinatura, dependências, builds, caches e dados operacionais ficam fora do Git. Consulte [docs/VERSIONAMENTO.md](docs/VERSIONAMENTO.md).
