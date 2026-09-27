# TODO — evolução dos dashboards agregados

O P2 visual foi entregue para Master, Pessoas/Estrutura, Inspeções, Treinamentos e APR/PT. Este arquivo mantém apenas o backlog residual e as decisões de evolução; itens marcados permanecem como registro de conclusão. O frontend não deve baixar páginas inteiras para calcular métricas no navegador.

## Plataforma Master — entregue no P2 visual

- [x] Totais de empresas e filiais ativas/arquivadas.
- [x] Direitos por módulo e situação administrativa.
- [x] Atividade factual de criação e início de direitos.
- [x] Ativação operacional por primeiro fato canônico, baseada em eventos canônicos projetados.
- [x] Estado observável da projeção no painel, sem expor conteúdo operacional de clientes.

## Visão detalhada da filial

- Evoluir o dashboard operacional da filial somente quando novos ciclos de resolução ou eventos históricos forem modelados; a primeira versão detalhada para Master, `company_admin` e `branch_admin` está entregue.
- Recortes por módulo, categoria e área responsável.
- Ações de correção ligadas aos pontos de atenção.

## Ativos e inspeções — entregue no P2 visual

- [x] Ativos por categoria e situação na filial.
- [x] Inspeções realizadas, atrasadas e não conformidades factuais por período.
- [x] Atenção paginada sem derivar dados da listagem operacional.
- [ ] Histórico diário de compliance após job observável e reprocessável.

## Treinamentos — entregue no P2 visual

- [x] Obrigações em dia, a vencer, vencidas e não concluídas.
- [x] Pessoas sem matriz e demais atenções atuais.
- [x] Conclusões aceitas factuais no período.
- [x] Recortes específicos por curso, departamento e cargo no contrato dedicado.
- [x] Histórico diário de compliance com lacunas explícitas antes do primeiro snapshot.

## APR — entregue no P2 visual

- [x] Rascunhos, documentos finalizados, PTs abertas e impedimentos preventivos.
- [x] Revisões finalizadas e PTs autorizadas factuais por período.
- [x] Medianas de criação → primeira finalização da APR e criação → autorização da PT, com tamanho da amostra.
- [x] Recortes por atividade e status; texto livre de perigos e controles permanece fora.
- [x] Histórico diário do fluxo com lacunas explícitas.
- [ ] Ciclo de fechamento da PT somente após existir uma transição canônica de fechamento no domínio.

## Pessoas e estrutura — entregue no P2 visual

- [x] Composição por departamento e tipo de vínculo.
- [x] Saúde cadastral e pontos de atenção paginados.
- [x] Inícios e encerramentos de vínculo factuais no período.
- [ ] Comparativos corporativos entre filiais permanecem no dashboard da empresa.

## Decisões já fechadas

- Master mantém um dashboard próprio e entra em empresa/filial por seleção explícita, com ação permanente de retorno à plataforma.
- O acesso operacional do Master permanece administrativo até existir um desenho auditável de suporte/impersonação; ele já pode criar e editar empresas, filiais e contratos.
- Checklists executados não formam uma tela de catálogo. O frontend administra ativos, equipamentos/tipos, categorias e templates de checklist; as execuções aparecem no histórico de inspeções.
- Todas as listagens de crescimento usam paginação da API. Feeds móveis e histórico de inspeções continuam por cursor.
