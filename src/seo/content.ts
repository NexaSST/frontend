export const siteUrl = 'https://nexasst.com.br';
export const siteTitle = 'Gestão de treinamentos e inspeções de SST | NexaSST';
export const siteDescription = 'Organize treinamentos de segurança do trabalho, inspeções de extintores, APR e evidências com o NexaSST. Agende uma demonstração.';
export const demoUrl = 'https://wa.me/5542998366677?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20do%20NexaSST.';
const nrBase = 'https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/';
export const sources = {
  cbo: 'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/cbo/servicos/downloads/livro-1-portal-cbo.pdf',
  nr17: `${nrBase}norma-regulamentadora-no-17-nr-17`,
  nr33: `${nrBase}norma-regulamentadora-no-33-nr-33`,
  transpetro: 'https://transpetro.com.br/transpetro-institucional/negocios/canal-do-fornecedor.htm',
};
export const searchQuestions = [
  ['Como melhorar a gestão de treinamentos de segurança do trabalho?', 'Comece pela matriz de capacitação por função, registre as turmas e presenças e acompanhe os vencimentos por colaborador. O NexaSST reúne matrizes, cursos, turmas, frequências e vencimentos para apoiar essa rotina.'],
  ['Como fazer inspeção online de extintor?', 'A equipe precisa verificar o equipamento no local. O registro digital organiza o ativo, o checklist, as fotos, o responsável e as ações para os desvios encontrados. O NexaSST oferece ativos, checklists e histórico de inspeções; a inspeção online não substitui a verificação física nem a manutenção especializada.'],
  ['O que é APR na segurança do trabalho?', 'APR significa Análise Preliminar de Riscos: um registro dos riscos de uma atividade e das medidas de prevenção a avaliar antes de executá-la. O NexaSST organiza APRs, atividades, modelos e permissões de trabalho; a avaliação continua sob responsabilidade da equipe técnica.'],
  ['Qual é o CBO do técnico de segurança do trabalho?', 'O CBO do Técnico em segurança no trabalho é 3516-05, conforme a Classificação Brasileira de Ocupações do MTE. O código identifica a ocupação; não é uma certificação do software. O NexaSST apoia a rotina desse profissional com treinamentos, inspeções e APR.'],
  ['O NexaSST é o SGG-SST?', 'Não. NexaSST é um produto independente. Se você procura um sistema de gerenciamento geral em saúde e segurança do trabalho, avalie quais rotinas precisa organizar e compare a cobertura de treinamentos, inspeções e APR em uma demonstração.'],
  ['O NexaSST tem vínculo com a Transpetro ou com o MTE?', 'Não há vínculo, homologação ou integração com Transpetro ou MTE declarados nesta página. Para requisitos de fornecedores da Transpetro e normas do Ministério do Trabalho e Emprego, consulte os canais oficiais. O NexaSST é uma alternativa para organizar registros de SST da sua empresa.'],
] as const;

export interface Guide { slug: string; title: string; description: string; answer: string; sections: ReadonlyArray<readonly [string, string]>; checklist: string[]; source?: readonly [string, string] }
export const guides: Guide[] = [
  {
    slug: 'gestao-de-treinamentos-seguranca-do-trabalho', title: 'Como organizar treinamentos de segurança do trabalho',
    description: 'Organize a matriz de capacitação, presenças e vencimentos dos treinamentos de segurança do trabalho por colaborador e função.',
    answer: 'Para melhorar a gestão de treinamento em segurança do trabalho, conecte a exigência da função ao curso realizado, à presença e ao vencimento de cada colaborador. Essa visão mostra quem precisa de capacitação e quais registros precisam ser conferidos.',
    sections: [
      ['Comece pela matriz de capacitação', 'Liste as funções e atividades e peça à equipe técnica que defina os treinamentos aplicáveis. Uma matriz deve representar a operação real: mudanças de função e de atividade precisam entrar na revisão. Não use a mesma lista para todos apenas por conveniência.'],
      ['Separe conclusão, evidência e validade', 'Uma inscrição em turma não comprova conclusão. Relacione o evento, a participação e a evidência correspondente ao colaborador. Organize as datas e regras de validade conforme o treinamento e sua aplicação, sem presumir um prazo universal para todas as NRs.'],
      ['Quando avaliar o NexaSST', 'O NexaSST oferece cursos, matrizes, turmas, frequências e acompanhamento de vencimentos. É uma alternativa para equipes que precisam consultar essas informações em conjunto, em vez de procurar registros em planilhas separadas. Na demonstração, peça para acompanhar um colaborador da matriz até seu vencimento.'],
    ], checklist: ['Mapear funções e atividades com a equipe de SST.', 'Conferir participantes e registros de cada turma.', 'Priorizar capacitações pendentes e próximas do vencimento.', 'Revisar a matriz quando a operação mudar.'],
  },
  {
    slug: 'inspecao-online-extintores', title: 'Inspeção online de extintores: como organizar os registros',
    description: 'Veja como registrar inspeções de extintores com identificação do ativo, checklist, fotos, histórico e acompanhamento de desvios.',
    answer: 'Inspeção online de extintor é a organização digital do registro de uma verificação feita no local. Ela conecta a identificação do equipamento ao checklist, às fotos e às ações necessárias, sem substituir a inspeção física ou a manutenção.',
    sections: [
      ['Identifique cada ativo antes de inspecionar', 'Cadastre uma identificação única e a localização do equipamento. Se houver vários extintores próximos, confirme que o registro corresponde ao ativo inspecionado. Um QR Code pode facilitar a consulta e diminuir a confusão entre equipamentos.'],
      ['Transforme o desvio em acompanhamento', 'Use um checklist definido pela equipe responsável e registre a condição observada. Quando houver desvio, relacione a evidência ao ativo e à ação necessária. A periodicidade e os critérios técnicos devem ser definidos conforme o equipamento e as exigências aplicáveis; este guia não é um checklist técnico de aprovação.'],
      ['Como o NexaSST apoia a inspeção', 'O módulo de inspeções organiza equipamentos, categorias, ativos, checklists, histórico e planos de ação. A mesma estrutura pode apoiar registros de outros ativos, como hidrantes e mangueiras, conforme a configuração e o checklist da operação. Peça uma demonstração com os equipamentos que sua equipe inspeciona.'],
    ], checklist: ['Conferir identificação e localização do ativo.', 'Usar o checklist técnico aprovado para o equipamento.', 'Registrar fotos e condição observada no campo.', 'Acompanhar desvios e revisar o histórico do ativo.'],
  },
  {
    slug: 'apr-seguranca-do-trabalho', title: 'APR na segurança do trabalho: da atividade ao registro',
    description: 'Entenda o que é APR e como organizar atividades, riscos, medidas preventivas e permissões de trabalho com rastreabilidade.',
    answer: 'APR é a Análise Preliminar de Riscos de uma atividade. Seu registro ajuda a explicitar os riscos identificados e as medidas preventivas a avaliar antes do trabalho, com contexto suficiente para a equipe responsável revisar a tarefa.',
    sections: [
      ['Descreva a tarefa real', 'Registre a atividade, o local e as condições de execução. Um modelo pode servir como ponto de partida, mas precisa ser revisado quando as condições mudam. Copiar uma APR sem conferir o contexto pode deixar riscos relevantes fora da análise.'],
      ['Distinga análise e autorização', 'A APR registra a análise; a Permissão de Trabalho organiza a autorização quando aplicável. A existência de um documento não comprova, sozinha, que todas as medidas foram executadas ou que a tarefa pode começar. As decisões cabem aos responsáveis da operação.'],
      ['Organização digital no NexaSST', 'O NexaSST oferece registros de APR, atividades, modelos, relatórios e permissões de trabalho. Compare o fluxo de revisão e consulta com sua rotina atual. Recursos de trava pré-tarefa dependem de orçamento e integração, conforme a proposta comercial.'],
    ], checklist: ['Identificar atividade, local e condições reais.', 'Revisar riscos e medidas com a equipe responsável.', 'Conferir a autorização de trabalho quando aplicável.', 'Preservar o registro e sua relação com a atividade.'],
  },
  {
    slug: 'cbo-tecnico-seguranca-do-trabalho', title: 'CBO do técnico de segurança do trabalho: 3516-05',
    description: 'Consulte o CBO 3516-05 do Técnico em segurança no trabalho e veja como organizar a rotina de treinamentos, inspeções e APR.',
    answer: 'O CBO do Técnico em segurança no trabalho é 3516-05. A referência é a Classificação Brasileira de Ocupações, disponibilizada pelo Ministério do Trabalho e Emprego (MTE).',
    sections: [
      ['Onde conferir o código', 'Consulte a família 3516 na publicação oficial da CBO do MTE, vinculada abaixo. Para preencher registros administrativos, confira a ocupação e a informação exigida pelo processo correspondente. O código ocupacional não comprova capacitação de uma pessoa nem certifica um sistema de SST.'],
      ['Da consulta do CBO à rotina de SST', 'Quem procura o CBO pode também precisar organizar as atividades do profissional na empresa. Separe a consulta cadastral da gestão operacional: acompanhe treinamentos, inspeções, APRs e evidências com seus responsáveis e prazos.'],
      ['Onde o NexaSST pode ajudar', 'O NexaSST é um sistema independente de gestão de segurança do trabalho. Reúne rotinas de treinamentos, inspeções e APR para apoiar profissionais e equipes de SST. Não é um serviço de emissão de registro profissional nem um portal do MTE.'],
    ], checklist: ['Conferir o código na fonte oficial.', 'Distinguir ocupação de comprovação de qualificação.', 'Mapear as rotinas que precisam de acompanhamento.', 'Avaliar o software com exemplos da sua operação.'], source: ['CBO oficial — família 3516', sources.cbo],
  },
  {
    slug: 'espaco-confinado-inventario', title: 'Espaço confinado: como organizar o inventário e os registros',
    description: 'Organize a identificação de espaços confinados, responsáveis, planos de resgate e referências à NR-33 em uma rotina rastreável.',
    answer: 'Para organizar os registros de espaço confinado, comece pela identificação dos espaços da operação e mantenha as informações vinculadas aos responsáveis e aos documentos aplicáveis. A NR-33 é a referência oficial a consultar com a equipe técnica.',
    sections: [
      ['Mantenha o inventário consultável', 'Diferencie cada espaço por identificação e localização e revise as informações quando houver mudanças. Um registro útil permite que a equipe encontre o espaço correto e consulte o contexto atualizado, sem depender apenas da memória de quem conhece a instalação.'],
      ['Não confunda inventário com autorização de entrada', 'O cadastro de um espaço não autoriza entrada ou trabalho. Os procedimentos e requisitos aplicáveis precisam ser avaliados pela equipe responsável à luz da NR-33 vigente. Consulte a fonte oficial abaixo; este conteúdo trata da organização de registros.'],
      ['Inventário no NexaSST', 'O NexaSST possui um módulo de inventário de espaços confinados com cadastro de espaços, planos de resgate, responsáveis técnicos e publicação por QR Code, conforme permissões. Avalie esse fluxo na demonstração e confirme o escopo contratado para sua operação.'],
    ], checklist: ['Identificar cada espaço e sua localização.', 'Manter responsáveis e documentos consultáveis.', 'Revisar registros quando as condições mudarem.', 'Consultar a NR-33 com os responsáveis técnicos.'], source: ['NR-33 — fonte oficial do MTE', sources.nr33],
  },
  {
    slug: 'ergonomia-aep-aet', title: 'Ergonomia no trabalho: organização de AEP, AET e ações',
    description: 'Entenda como organizar avaliações e ações de ergonomia, consultar a NR-17 e definir o escopo de uma solução para a sua equipe.',
    answer: 'A organização da ergonomia no trabalho começa por relacionar os registros de avaliação às situações de trabalho e às ações propostas. Consulte a NR-17 para avaliar, com os responsáveis técnicos, os requisitos de Avaliação Ergonômica Preliminar (AEP) e Análise Ergonômica do Trabalho (AET) aplicáveis.',
    sections: [
      ['Organize o contexto da avaliação', 'Associe os registros à atividade e ao local avaliados. Preserve o contexto observado e a identificação do responsável. Um documento isolado fica mais difícil de acompanhar quando a equipe não consegue relacioná-lo à situação de trabalho que motivou a avaliação.'],
      ['Acompanhe as ações depois do documento', 'Defina quem acompanha as ações propostas e mantenha as evidências de execução consultáveis. A decisão sobre a avaliação necessária e sua metodologia exige análise técnica; a ferramenta de gestão não substitui esse trabalho.'],
      ['Confirme o escopo antes de contratar', 'A oferta comercial do NexaSST apresenta ergonomia, AEP e AET. Confirme em demonstração os recursos disponíveis, a implantação e o escopo da proposta antes de escolher um plano. Este guia não presume emissão automática de laudos nem atendimento integral à NR-17.'],
    ], checklist: ['Identificar atividade e situação de trabalho.', 'Consultar a NR-17 vigente com a equipe técnica.', 'Relacionar avaliações às ações e responsáveis.', 'Confirmar recursos de ergonomia na demonstração.'], source: ['NR-17 — fonte oficial do MTE', sources.nr17],
  },
];
