export type ModuleInterest = 'training' | 'inspections' | 'apr' | 'confined-spaces';
export type Pain = 'deadlines' | 'evidence' | 'field';
export type VolumeKey = 'people' | 'inspectors' | 'assets' | 'permits';
export type Volumes = Partial<Record<VolumeKey, number>>;

export const volumeOptions: Record<VolumeKey, ReadonlyArray<readonly [string, number]>> = {
  people: [['Até 50', 50], ['51 a 150', 150], ['151 a 500', 500], ['Mais de 500', 501]],
  inspectors: [['Até 2', 2], ['3 a 5', 5], ['6 a 15', 15], ['Mais de 15', 16]],
  assets: [['Até 100', 100], ['101 a 300', 300], ['301 a 1.000', 1000], ['Mais de 1.000', 1001]],
  permits: [['Até 50', 50], ['51 a 200', 200], ['201 a 500', 500], ['Mais de 500', 501]],
};

const volumeLabels: Record<VolumeKey, string> = {
  people: 'colaboradores',
  inspectors: 'inspetores',
  assets: 'ativos',
  permits: 'emissões de APR/PT por mês',
};

function describeVolume(key: VolumeKey, value: number): string {
  const selected = volumeOptions[key].find(([, optionValue]) => optionValue === value);
  return `${selected?.[0] ?? value} ${volumeLabels[key]}`;
}

export const moduleLabels: Record<ModuleInterest, string> = {
  training: 'Treinamentos',
  inspections: 'Inspeções',
  apr: 'APR e PT',
  'confined-spaces': 'Espaços confinados',
};

export const painLabels: Record<Pain, string> = {
  deadlines: 'Prazos que viram urgência',
  evidence: 'Evidências dispersas',
  field: 'Campo e gestão desconectados',
};

const tiers = [
  { name: 'Starter', people: 50, inspectors: 2, assets: 100, permits: 50 },
  { name: 'Growth', people: 150, inspectors: 5, assets: 300, permits: 200 },
  { name: 'Scale', people: 500, inspectors: 15, assets: 1000, permits: 500 },
] as const;

export type GuideResult = {
  kind: 'avulso' | 'combo' | 'conversation';
  title: string;
  reason: string;
};

export function recommendOffer(modules: ModuleInterest[], volumes: Volumes): GuideResult | null {
  if (!modules.length) return null;

  if (modules.includes('confined-spaces')) {
    return {
      kind: 'conversation',
      title: 'Uma composição para definir na demonstração',
      reason: 'O Inventário de Espaços Confinados é contratado à parte. Vamos combinar esse escopo com os demais módulos de interesse.',
    };
  }

  const required: VolumeKey[] = [
    ...(modules.includes('training') ? ['people' as const] : []),
    ...(modules.includes('inspections') ? ['inspectors' as const, 'assets' as const] : []),
    ...(modules.includes('apr') ? ['permits' as const] : []),
  ];

  if (required.some((key) => volumes[key] === undefined)) {
    return {
      kind: 'conversation',
      title: 'Vamos dimensionar juntos',
      reason: 'Com os volumes que você conhece, já conseguimos começar a conversa. As franquias ficam para a demonstração.',
    };
  }

  const scale = tiers[2];
  if (required.some((key) => (volumes[key] ?? 0) > scale[key])) {
    return {
      kind: 'conversation',
      title: 'Sua operação pede uma proposta específica',
      reason: 'Pelo menos um volume informado supera as franquias publicadas do Scale. A equipe comercial pode definir o escopo com você.',
    };
  }

  if (modules.length === 1) {
    const module = modules[0];
    if (!module) return null;
    return {
      kind: 'avulso',
      title: `Comece pelo módulo de ${moduleLabels[module]}`,
      reason: 'Seu interesse está concentrado em uma frente. Um módulo avulso é um ponto de partida mais claro que contratar o combo inteiro.',
    };
  }

  const tierIndex = tiers.findIndex((offer) => required.every((key) => (volumes[key] ?? 0) <= offer[key]));
  const tier = tiers[tierIndex];
  if (!tier) return null;
  const previousTier = tiers[tierIndex - 1];
  const decidingKey = previousTier && required.find((key) => (volumes[key] ?? 0) > previousTier[key]);
  const explanation = decidingKey && volumes[decidingKey]
    ? `A faixa de ${describeVolume(decidingKey, volumes[decidingKey])} leva ao ${tier.name}.`
    : `Os volumes informados cabem nas franquias do ${tier.name}.`;
  return {
    kind: 'combo',
    title: `Combo ${tier.name} como ponto de partida`,
    reason: `${explanation} Na demonstração, ajustamos a composição à sua operação.`,
  };
}

export function guideWhatsAppUrl(pain: Pain | '', modules: ModuleInterest[], volumes: Volumes, result: GuideResult | null): string {
  const lines = [
    'Olá, gostaria de agendar uma demonstração do NexaSST.',
    pain ? `Principal desafio: ${painLabels[pain]}.` : '',
    modules.length ? `Interesse: ${modules.map((module) => moduleLabels[module]).join(', ')}.` : '',
    volumes.people ? `Faixa de colaboradores: ${volumeOptions.people.find(([, value]) => value === volumes.people)?.[0]}.` : '',
    volumes.inspectors ? `Faixa de inspetores: ${volumeOptions.inspectors.find(([, value]) => value === volumes.inspectors)?.[0]}.` : '',
    volumes.assets ? `Faixa de ativos: ${volumeOptions.assets.find(([, value]) => value === volumes.assets)?.[0]}.` : '',
    volumes.permits ? `Faixa de APR/PT por mês: ${volumeOptions.permits.find(([, value]) => value === volumes.permits)?.[0]}.` : '',
    result ? `Ponto de partida: ${result.title}.` : '',
  ].filter(Boolean);
  return `https://wa.me/5542998366677?text=${encodeURIComponent(lines.join('\n'))}`;
}
