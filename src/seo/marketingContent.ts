export interface MarketingPage {
  slug: string; title: string; description: string; intro: string;
  sections: [string, string][];
  tiers?: [string, number, string][];
}
export const marketingPages: MarketingPage[] = [
  {
    slug: 'sobre', title: 'Sobre o NexaSST',
    description: 'Conheça o NexaSST, software brasileiro para organizar treinamentos, inspeções, APR e PT, e o responsável pelo conteúdo do site.',
    intro: 'O NexaSST reúne registros de segurança do trabalho para aproximar o campo e a gestão. O objetivo é facilitar a consulta de prazos, evidências e responsáveis no contexto da operação.',
    sections: [
      ['Para quem construímos', 'Para profissionais e equipes de SST que precisam organizar colaboradores, ativos, inspeções e documentos operacionais. A contratação pode começar por um módulo ou reunir módulos em um combo, conforme o tamanho da equipe e o volume de registros.'],
      ['O que o software organiza', 'Gestão de treinamentos, matrizes e evidências de capacitação; inspeções digitais e checklists com histórico dos ativos; APR e Permissão de Trabalho. O inventário de espaços confinados e planos de resgate têm contratação sob demanda. Ergonomia é apresentada separadamente como recurso futuro.'],
      ['Experiência operacional em um cliente', 'Em uma operação atendida, com identidade preservada, foram informados mais de 1.000 ativos monitorados, mais de 16.000 inspeções registradas e mais de 450 treinamentos rastreados. Nesse caso, 90% dos ativos tinham histórico de inspeção. Esses números descrevem um único cliente; não representam a soma de clientes nem uma garantia de resultado para outras operações.'],
      ['Responsável pelo conteúdo', 'Matheus Padilha Rodrigues é o autor dos guias publicados no site. Os conteúdos explicam a organização de registros e o uso do software. Decisões técnicas, avaliações de risco e aprovações permanecem com os profissionais responsáveis pela operação.'],
      ['Converse sobre a sua operação', 'A demonstração começa pela sua rotina: quais módulos precisa, quantas pessoas participam e quais registros deseja organizar. Pelo WhatsApp, combinamos a demonstração e o escopo da proposta. A contratação define capacidades, condições e recursos incluídos.'],
    ],
  },
  {
    slug: 'modulos/treinamentos', title: 'Software para gestão de treinamentos de SST',
    description: 'Organize colaboradores, matrizes de treinamentos e evidências de capacitação no NexaSST. Consulte os níveis de contratação e agende uma demonstração.',
    intro: 'Centralize colaboradores, treinamentos, matrizes e evidências de capacitação para consultar a situação da equipe sem procurar registros em controles separados.',
    sections: [
      ['Capacitação ligada ao colaborador', 'Organize os registros de treinamento e suas evidências no contexto da pessoa a quem pertencem. A matriz e os vencimentos ajudam a consultar pendências e priorizar o acompanhamento da equipe.'],
      ['Escolha pela capacidade da equipe', 'Os níveis de contratação são definidos pelo limite de colaboradores. Compare o tamanho da sua base com as capacidades abaixo e converse sobre o escopo necessário. O módulo pode ser contratado individualmente ou nos combos da página de planos.'],
      ['Na demonstração', 'Veja como consultar a base de colaboradores, os registros de capacitação e a matriz de treinamentos. Traga exemplos da sua rotina para avaliar a organização das evidências e o acompanhamento de prazos. A responsabilidade pela capacitação e pela validade dos documentos permanece com a empresa e seus profissionais.'],
    ],
    tiers: [['Nível 1', 690, 'Até 50 colaboradores'], ['Nível 2', 2190, 'Até 150 colaboradores'], ['Nível 3', 6990, 'Até 500 colaboradores']],
  },
  {
    slug: 'modulos/inspecoes', title: 'Software para inspeções digitais e checklists',
    description: 'Registre inspeções com checklists, fotos e histórico dos ativos no NexaSST. Compare capacidades de inspetores e ativos e preços mensais do módulo.',
    intro: 'Conecte inspeções, evidências e ativos em um mesmo fluxo, com painel web e aplicativo que preserva registros durante a falta de conexão.',
    sections: [
      ['Histórico no contexto do ativo', 'O registro da inspeção reúne informações e evidências associadas ao equipamento. O QR Code ajuda a acessar o ativo correto, enquanto o histórico permite consultar fotos e recorrências sem depender de arquivos dispersos.'],
      ['Do campo ao acompanhamento', 'A equipe registra inspeções no aplicativo e acompanha a operação no painel web. Durante a falta de conexão, o aplicativo preserva os registros para sincronização posterior. A disponibilidade de conexão continua necessária para transmitir as informações à gestão.'],
      ['Capacidades de contratação', 'Cada nível combina limites de inspetores e ativos, com franquia de mídia. Avalie a quantidade de pessoas que inspecionam e de equipamentos acompanhados. A proposta comercial detalha a franquia de mídia e as condições da operação. O sistema organiza registros; a avaliação técnica continua com os profissionais responsáveis.'],
    ],
    tiers: [['Nível 1', 490, 'Até 2 inspetores e 100 ativos, com franquia de mídia'], ['Nível 2', 990, 'Até 5 inspetores e 300 ativos, com franquia de mídia'], ['Nível 3', 2490, 'Até 15 inspetores e 1.000 ativos, com franquia de mídia']],
  },
  {
    slug: 'modulos/apr-pt', title: 'Software para APR e Permissão de Trabalho',
    description: 'Organize APR e Permissão de Trabalho no NexaSST. Consulte limites de emissões mensais, preços do módulo e condições para integração sob orçamento.',
    intro: 'Reúna Análise Preliminar de Risco e Permissão de Trabalho em um módulo unificado, para organizar registros e acompanhar o contexto da atividade.',
    sections: [
      ['Registros ligados à atividade', 'Organize a documentação da atividade e preserve o contexto das análises e permissões. A consulta dos registros ajuda a recuperar informações da operação e acompanhar revisões sem depender de documentos soltos.'],
      ['Contratação por emissões mensais', 'A capacidade do módulo é definida pela franquia de emissões de APR/PT por mês. Compare o volume da sua operação com os níveis publicados. As condições de contratação e o escopo final são definidos na proposta comercial.'],
      ['Integrações e responsabilidade técnica', 'O adicional Trava Pré-Tarefa, para portaria ou aplicativo, depende de orçamento e integração. Não está incluído automaticamente nos preços abaixo. A análise de riscos e a autorização do trabalho continuam com os profissionais responsáveis; o software apoia a organização dos registros e não garante conformidade por si só.'],
    ],
    tiers: [['Nível 1', 690, 'Até 50 emissões de APR/PT por mês'], ['Nível 2', 1490, 'Até 200 emissões de APR/PT por mês'], ['Nível 3', 2990, 'Até 500 emissões de APR/PT por mês']],
  },
  {
    slug: 'modulos/espacos-confinados', title: 'Inventário de espaços confinados e planos de resgate',
    description: 'Organize o inventário de espaços confinados, revisões e planos de resgate no NexaSST. Contratação sob demanda, com escopo definido em demonstração.',
    intro: 'Organize o cadastro dos espaços confinados, suas revisões e os planos de resgate associados. A contratação é sob demanda, conforme o escopo da operação.',
    sections: [
      ['Inventário com contexto e revisões', 'O cadastro reúne informações do espaço, acessos, perigos e arquivos vinculados. As revisões preservam o contexto das informações aprovadas, permitindo acompanhar mudanças sem confundir o cadastro com a publicação de conteúdo.'],
      ['Planos e consulta por QR Code', 'Os planos de resgate possuem revisões próprias. Cada espaço pode ter QR Code para consultar informações e o recorte público aprovado do plano de resgate, quando disponível. A publicação é uma etapa separada, com controle sobre o conteúdo apresentado.'],
      ['Proposta sob demanda', 'Converse sobre a quantidade de espaços, o processo de revisão e aprovação e as necessidades da equipe. Não há preço mensal fixo publicado para este módulo e ele não é apresentado como incluído nos combos. A demonstração ajuda a definir o escopo da proposta comercial.'],
      ['Responsabilidade da operação', 'O sistema apoia a organização do inventário e dos planos. Caracterização dos espaços, avaliações de risco, decisões de resgate e autorizações permanecem com os profissionais responsáveis. Consulte o guia de espaços confinados para entender a diferença entre cadastro, revisão e publicação.'],
    ],
  },
];
