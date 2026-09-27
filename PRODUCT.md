# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React, Vite, TypeScript 7, TanStack Router, TanStack Query, React Hook Form, Zod, Ky, Tailwind CSS v4, Sileo, Vitest, Testing Library and Playwright.

## Users

- O Master da plataforma administra clientes, empresas, filiais, contratos e módulos e pode navegar até o contexto de qualquer empresa ou filial sem perder o caminho de volta ao painel da plataforma.
- Administradores corporativos e de filial gerenciam acesso, pessoas, ativos, inspeções, treinamentos e APRs dentro do escopo autorizado. O público operacional é predominantemente generalista e pode ter pouca familiaridade com sistemas de SST: assistentes administrativos, gestores de área, supervisores e técnicos de SST circulam entre módulos.
- Gestores, supervisores, operadores e visualizadores usam apenas os módulos, filiais e ações liberados por contratação e permissão.

## Product Purpose

O frontend web é o painel administrativo e operacional completo do NexaSST. Ele transforma os contratos da API em fluxos claros para gestão multiempresa, mantendo os contextos Plataforma e Empresa explicitamente separados.

## Positioning

O NexaSST combina isolamento por empresa e filial, módulos contratados, autorização por ação, rastreabilidade pública por QR e operação de inspeções offline-first. A interface deve tornar cada uma dessas camadas compreensível sem tratá-las como simples itens de menu.

## Operating Context

Uso diário em desktop por equipes administrativas e de SST, com grande volume de ativos, colaboradores, treinamentos, inspeções e documentos. Listagens precisam de paginação, busca e filtros persistidos na URL. A aplicação se comunica com a API Fastify local ou publicada por uma URL configurável.

## Capabilities and Constraints

- Contextos separados de Plataforma e Empresa.
- Navegação do Master entre empresas e filiais, com retorno explícito ao painel da Plataforma.
- Separação visual e de navegação por módulos: Fundação, Ativos e Inspeções, Treinamentos e APR.
- A fundação transversal aparece como `Pessoas e estrutura`, com visão geral, colaboradores, departamentos e setores, cargos com CBO e empresas prestadoras; esses cadastros não pertencem visualmente a Treinamentos.
- Pessoas e Treinamentos mantêm navegações internas próprias por abas horizontais. A sidebar mostra somente as raízes dos módulos.
- Cursos têm tipo e frequência corporativa reutilizada pelas filiais. O catálogo de frequências inclui padrões automáticos e intervalos personalizados, administrados somente com permissão corporativa. Realizações têm modalidade Inicial, Periódico ou Eventual e preservam o vencimento histórico.
- Regras nomeadas da matriz agrupam vários cursos sob o mesmo escopo e herdam a frequência de cada curso.
- Toda conclusão de treinamento nasce com evidência confirmada; o cadastro do curso não apresenta uma opção para tornar evidência facultativa.
- A matriz é única por filial, versionada e publicada por um fluxo em etapas. Turmas representam somente treinamentos já realizados; o planejamento de turmas futuras permanece fora do escopo atual.
- Equipamentos, características, categorias opcionais e checklists formam catálogos corporativos reutilizáveis entre filiais. Ativos físicos, valores das características e inspeções pertencem à filial.
- O dashboard corporativo usa agregados reais para a visão gerencial; o Início da filial oferece o dashboard operacional detalhado, respeitando módulos contratados, escopo autorizado, fuso local, prioridades e atividade por período.
- A visão analítica de cada domínio vive na aba `Visão geral` da navegação interna do módulo. Usuários com acesso somente a analytics veem apenas essa aba; o painel não cria uma raiz paralela na sidebar.
- Analytics de Pessoas descreve composição da força de trabalho e integridade cadastral, sem inventar uma métrica genérica de compliance. Analytics da Plataforma permanece administrativo e não expõe a operação de SST dos clientes nem infere ativação sem fatos canônicos.
- O histórico analítico diário começa na primeira projeção real: não retropreenche o passado, explicita datas sem snapshot e mantém o compliance histórico na escala fixa de 0 a 100.
- Treinamentos permite recortes por curso, departamento e cargo. APR permite recortes por atividade e status, distingue revisão finalizada de PT autorizada e apresenta ciclos sempre com definição e tamanho da amostra.
- O Master pode comunicar ativação pelo primeiro fato canônico e a saúde da projeção, sem conceder acesso operacional à empresa cliente.
- Snapshot atual, atividade histórica e pontos de atenção são contratos independentes: cada região mantém seus próprios estados de carregamento, erro, vazio e nova tentativa sem bloquear as demais.
- Sessão web por cookies HttpOnly, access token curto, refresh token rotativo e proteção CSRF. O fluxo Bearer existente permanece para o aplicativo móvel.
- Toda listagem operacional relevante usa paginação no servidor; busca e filtros permanecem na URL.
- Templates de checklist precisam de criação e listagem no web e serão consumidos posteriormente pelo aplicativo móvel.
- Exclusões de negócio são apresentadas como arquivamento ou revogação conforme a política de soft delete.
- O frontend não inventa endpoints, métricas ou dados quando a API ainda não oferece o contrato necessário.

## Brand Commitments

Nome: NexaSST. Preservar a identidade em azul-marinho e verde-esmeralda do aplicativo móvel, com tema claro, hierarquia editorial calma e interfaces operacionais diretas. A navegação web não copia literalmente a navegação do aplicativo.

## Evidence on Hand

- Contratos e decisões em `../PLANO-ARQUITETURA.md`, `../docs/` e `../backend/docs/`.
- Implementação real da API em `../backend/src/`.
- Identidade visual e componentes móveis em `../mobile/DESIGN.md`, `../mobile/src/theme/` e `../mobile/src/components/ui/`.
- Não existem depoimentos, métricas comerciais ou benchmarks que possam ser inventados.

## Product Principles

1. O contexto atual — Plataforma, empresa, filial e módulo — deve estar sempre evidente.
2. Ocultar uma ação na interface nunca substitui a autorização da API.
3. Grandes cadastros devem continuar utilizáveis com paginação, busca, filtros e URLs compartilháveis.
4. Estados de módulo indisponível, falta de permissão, vazio, erro e carregamento devem explicar o próximo passo real.
5. O Master nunca deve ficar preso dentro do contexto de um cliente.

## Accessibility & Inclusion

Suporte completo a teclado, foco visível, contraste adequado, semântica para leitores de tela, redução de movimento e comunicação de estado que não dependa apenas de cor.
