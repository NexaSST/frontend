export const legalUpdatedAt = '27 de setembro de 2026';
export const privacyContact = 'padilha.matheus@hotmail.com';
export const responsibleName = 'Matheus Padilha Rodrigues';

export interface LegalSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}
export interface LegalPage {
  slug: 'privacidade' | 'termos-de-uso';
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
}

export const legalPages: LegalPage[] = [
  {
    slug: 'privacidade',
    title: 'Política de Privacidade',
    description: 'Saiba como o NexaSST trata dados de contas, inspeções, fotos, localização e registros de SST no site e no aplicativo.',
    intro: 'Esta política explica como o NexaSST trata dados pessoais no site, na plataforma web e no aplicativo móvel usado por equipes de segurança e saúde no trabalho.',
    sections: [
      {
        title: '1. Quem responde pelo NexaSST',
        paragraphs: [`O responsável pelo NexaSST é ${responsibleName}. Para dúvidas, solicitações relativas a dados pessoais e pedidos de exclusão, escreva para ${privacyContact}.`, 'Quando uma empresa cliente cadastra trabalhadores, atividades e registros de SST para suas próprias finalidades, ela decide quais dados inserir e quem pode acessá-los. O NexaSST processa esses dados para fornecer a plataforma, conforme o contrato e as instruções da empresa. Para dados de visitantes, contatos comerciais e da administração do serviço, o responsável pelo NexaSST define as finalidades indicadas nesta política.'],
      },
      {
        title: '2. Quais dados são tratados',
        paragraphs: ['Os dados variam conforme o uso e as permissões da conta. A empresa cliente e seus usuários escolhem e inserem parte relevante do conteúdo operacional.'],
        bullets: [
          'Conta e acesso: nome, e-mail, empresa, filial, cargo, permissões, credenciais protegidas, identificadores de sessão, registros de autenticação e de auditoria. Login Microsoft pode ser habilitado pela empresa.',
          'Operação de SST: cadastros de pessoas, cargos e ativos; treinamentos e evidências; inspeções, respostas, observações, planos de ação; APR, Permissões de Trabalho, assinaturas e documentos anexados. Esses registros podem conter dados pessoais e, dependendo do conteúdo inserido, informações sensíveis.',
          'Aplicativo móvel: dados da operação, rascunhos e fila de sincronização mantidos no aparelho; fotos de evidência; data e hora da captura; e localização precisa associada à foto, incluindo coordenadas e precisão obtidas do sistema do aparelho.',
          'Uso técnico: endereço IP e informações necessárias ao funcionamento, à segurança, à prevenção de abuso, à resolução de erros e à manutenção do serviço.',
          'Contato comercial: mensagem e dados que você escolher enviar ao abrir o WhatsApp a partir da landing page.',
        ],
      },
      {
        title: '3. Câmera, QR Code, fotos e localização',
        paragraphs: ['A câmera é usada para ler QR Codes e registrar fotos de evidência em inspeções. O aplicativo pede permissão antes do acesso. No fluxo atual de foto de inspeção, também solicita localização enquanto o aplicativo está em uso; registra as coordenadas, a precisão e o horário da captura junto à evidência. Se a permissão ou a precisão necessária não estiver disponível, a foto de evidência não é concluída nesse fluxo.', 'O aplicativo não solicita permissão de localização em segundo plano para acompanhar deslocamentos. A sincronização de registros pendentes pode ocorrer em segundo plano quando o sistema operacional permitir; isso não significa coleta contínua de localização. A câmera também pode ser usada para ler QR Codes de espaços e ativos sem produzir uma foto de evidência.', 'As fotos e seus metadados são enviados à infraestrutura de armazenamento usada pelo serviço quando a sincronização é concluída. Enquanto estiverem pendentes, podem permanecer no aparelho. Você pode gerenciar permissões de câmera e localização nas configurações do dispositivo.'],
      },
      {
        title: '4. Como e por que usamos os dados',
        paragraphs: ['Usamos os dados para autenticar usuários, administrar acessos, permitir que empresas organizem suas rotinas de SST, sincronizar registros entre aplicativo e servidor, guardar evidências, gerar consultas e relatórios, prestar suporte e proteger o serviço. A empresa cliente é responsável por definir as finalidades e as bases legais do conteúdo ocupacional que cadastra. Para a operação da plataforma, o tratamento depende do contexto contratual, de obrigações aplicáveis e de necessidades de segurança; não pressupomos que todo tratamento se baseie em consentimento.', 'O site público não carrega, no código atual, ferramentas de publicidade comportamental ou medição analítica de terceiros. A área autenticada usa cookies necessários para sessão e proteção contra requisições indevidas. Caso novas ferramentas sejam adicionadas, esta política deverá ser atualizada antes do uso correspondente.'],
      },
      {
        title: '5. Compartilhamento, acesso e transferências',
        paragraphs: ['Os registros são acessíveis às pessoas autorizadas pela empresa cliente de acordo com seus papéis e permissões. Alguns perfis e informações de ativos podem ser consultados por quem possuir o link ou QR Code público correspondente; a empresa deve avaliar quais dados disponibiliza nesses recursos.', 'Usamos provedores de hospedagem e armazenamento em nuvem para entregar o serviço, incluindo infraestrutura AWS para a API e os arquivos de evidência e Netlify para o site. O login Microsoft, quando habilitado, envolve o serviço de identidade da Microsoft. O contato iniciado pelo botão de WhatsApp é processado também pela Meta/WhatsApp, segundo suas próprias políticas. Provedores podem tratar dados fora do Brasil; os detalhes de região, subcontratação e mecanismos contratuais devem ser confirmados no contrato e na configuração operacional. Não vendemos os dados operacionais cadastrados por clientes.'],
      },
      {
        title: '6. Armazenamento, segurança e retenção',
        paragraphs: ['O aplicativo mantém registros locais para uso e sincronização mesmo sem conexão. A sessão e a chave do banco local usam armazenamento seguro do dispositivo, e a base local é configurada para criptografia. Sair da conta encerra a sessão, mas não apaga automaticamente rascunhos ou a fila local. Antes de transferir ou descartar um aparelho, solicite à empresa responsável a verificação dos registros pendentes e a limpeza do dispositivo.', 'Aplicamos controles de acesso, proteção de sessão, transmissão por HTTPS nos ambientes publicados e armazenamento privado de arquivos. Nenhum sistema é isento de risco. Mantemos dados enquanto forem necessários para a prestação do serviço, para registros de segurança, para as finalidades definidas pela empresa cliente e para obrigações legais ou contratuais aplicáveis. O prazo pode variar conforme o tipo de registro, o contrato e a necessidade de preservação de evidências; exclusão de uma conta não implica eliminação imediata de todos os documentos vinculados à empresa.'],
      },
      {
        title: '7. Seus direitos e pedidos de exclusão',
        paragraphs: [`Para solicitar acesso, correção, informações sobre uso ou compartilhamento, oposição quando cabível, revogação de consentimento quando essa for a base usada, ou exclusão de dados, escreva para ${privacyContact}. Identifique a conta e a empresa a que o pedido se refere, sem enviar senhas ou documentos sensíveis no primeiro contato. Podemos pedir elementos adicionais para confirmar a identidade antes de agir.`, 'No aplicativo, em Conta → Solicitar exclusão da conta, o titular pode iniciar o pedido diretamente. A confirmação desativa o acesso e encerra as sessões; a exclusão dos dados no servidor é analisada e processada posteriormente. Se os dados foram inseridos pela empresa cliente, encaminharemos o pedido à empresa responsável ou atuaremos de acordo com suas instruções. A exclusão pode depender da preservação de registros exigidos por lei, contrato ou defesa de direitos. Para acompanhar o processamento do pedido, use o contato de privacidade indicado nesta página.'],
      },
      {
        title: '8. Alterações e contato',
        paragraphs: [`Podemos atualizar esta política quando as funcionalidades, os prestadores ou as práticas de tratamento mudarem. A data de atualização aparece no início da página. Para qualquer questão de privacidade, contate ${privacyContact}.`],
      },
    ],
  },
  {
    slug: 'termos-de-uso',
    title: 'Termos e Condições de Uso',
    description: 'Condições de acesso e uso do NexaSST na plataforma web e no aplicativo móvel para operações de segurança do trabalho.',
    intro: 'Estes termos descrevem as condições gerais de uso do site, da plataforma web e do aplicativo NexaSST. Condições comerciais específicas, planos, preços e níveis de serviço dependem da proposta ou do contrato com a empresa cliente.',
    sections: [
      {
        title: '1. Serviço e contas',
        paragraphs: [`O NexaSST é disponibilizado por ${responsibleName} para apoiar a organização de rotinas de segurança e saúde no trabalho. Usuários acessam a operação da empresa mediante conta e permissões concedidas por ela. A empresa administra seus usuários, filiais, funções e regras internas de acesso.`, 'O aplicativo móvel utiliza o mesmo login corporativo da plataforma. O usuário deve manter suas credenciais em sigilo, usar o serviço apenas para atividades autorizadas e informar à empresa sobre acessos indevidos ou perda do aparelho.'],
      },
      {
        title: '2. Uso permitido e responsabilidades',
        paragraphs: ['A plataforma ajuda a registrar e consultar treinamentos, inspeções, APRs, Permissões de Trabalho e outros módulos contratados. Sua disponibilidade efetiva depende do plano, das permissões e da configuração da empresa. A empresa e os profissionais habilitados continuam responsáveis por identificar riscos, validar informações, aplicar as normas pertinentes, executar medidas preventivas e autorizar atividades.', 'O serviço não substitui inspeção física, avaliação técnica, treinamento efetivo ou obrigação legal. O cadastro de um documento, a leitura de um QR Code ou a emissão de um relatório não garantem conformidade, segurança da tarefa ou resultado de fiscalização. O usuário deve fornecer informações corretas e não registrar evidências falsas, simuladas ou de terceiros sem autorização.'],
      },
      {
        title: '3. Fotos, localização e sincronização',
        paragraphs: ['A captura de fotos de evidência no aplicativo pode exigir câmera e localização precisa, conforme descrito na Política de Privacidade. O registro pode ficar pendente no aparelho até que a sincronização com o servidor seja confirmada. O usuário deve conferir os estados de envio e de conflito antes de considerar um registro entregue. A sincronização em segundo plano é oportunista e pode depender do sistema operacional, da conectividade e das permissões.', 'O usuário deve obter as autorizações necessárias para fotografar pessoas, instalações e documentos e seguir as regras da empresa para uso de imagens e localização em ambiente de trabalho.'],
      },
      {
        title: '4. Conteúdo e acesso por QR Code',
        paragraphs: ['A empresa cliente e seus usuários respondem pelos registros e arquivos que inserem e pelas permissões concedidas. O NexaSST pode processar esses dados para operar o serviço conforme a Política de Privacidade e o contrato. Alguns links por QR Code podem mostrar informações a quem os possuir; não divulgue links, tokens ou códigos que deem acesso a dados além do necessário.'],
      },
      {
        title: '5. Disponibilidade, alterações e suporte',
        paragraphs: ['Podemos atualizar o software para manutenção, correções e evolução do produto. Interrupções podem ocorrer por manutenção, conexão, serviços de terceiros ou incidentes. Eventuais compromissos específicos de disponibilidade e suporte são definidos na proposta ou no contrato aplicável. Recursos indicados como oferta sob projeto, integrações ou desenvolvimento futuro não integram automaticamente a contratação.'],
      },
      {
        title: '6. Propriedade intelectual e uso indevido',
        paragraphs: ['A marca, a interface e o código do NexaSST pertencem aos seus titulares. O acesso concede apenas o direito de uso autorizado durante a vigência do vínculo aplicável. Não é permitido tentar contornar controles de acesso, acessar dados de outra empresa, explorar falhas ou usar o serviço para fins ilícitos. Podemos restringir acessos em caso de risco à segurança ou descumprimento, observadas as condições contratuais e a legislação aplicável.'],
      },
      {
        title: '7. Dados pessoais e encerramento',
        paragraphs: [`O tratamento de dados pessoais é descrito na Política de Privacidade. Para pedidos de acesso, correção ou exclusão, escreva para ${privacyContact}. O encerramento de uma conta ou de um contrato não elimina automaticamente registros que a empresa ou a lei exijam preservar. Antes de sair da conta ou deixar de usar o aplicativo, confira a fila local de registros não sincronizados com a empresa responsável.`],
      },
      {
        title: '8. Atualizações destes termos',
        paragraphs: [`Estes termos podem ser atualizados quando o serviço ou as condições de uso mudarem. A data da versão aparece no início da página. Dúvidas sobre estes termos podem ser enviadas a ${privacyContact}.`],
      },
    ],
  },
];
