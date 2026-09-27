import type { Domain, BreakdownItem } from './types.js';

export function metricRows(domain: Domain, raw: unknown): Array<{ label: string; value: string; detail: string }> {
  const data = (raw ?? {}) as Record<string, unknown>;
  const totals = (data.totals ?? data) as Record<string, unknown>;
  const n = (key: string) => Number(totals[key] ?? 0).toLocaleString('pt-BR');
  const pct = (key: string) => totals[key] == null ? '—' : `${Number(totals[key]).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
  if (domain === 'people') return [
    { label: 'Colaboradores ativos', value: n('activePeople'), detail: 'Pessoas com vínculo vigente' },
    { label: 'Vínculos próprios', value: n('ownPeople'), detail: 'Colaboradores da empresa' },
    { label: 'Terceirizados', value: n('outsourcedPeople'), detail: 'Vínculos com prestadoras' },
    { label: 'Cadastros em atenção', value: n('registrationIssues'), detail: 'Pessoas com dados incompletos' },
  ];
  if (domain === 'inspections') return [
    { label: 'Ativos cadastrados', value: n('registeredAssets'), detail: 'Inventário atual da filial' },
    { label: 'Ativos monitorados', value: n('monitoredAssets'), detail: 'Com controle aplicável' },
    { label: 'Compliance de inspeções', value: pct('compliancePercent'), detail: 'Universo medido na data de referência' },
    { label: 'Inspeções atrasadas', value: n('overdue'), detail: 'Prazo anterior à data consultada' },
  ];
  if (domain === 'training') return [
    { label: 'Obrigações aplicáveis', value: n('applicable'), detail: 'Universo medido na filial' },
    { label: 'Compliance de treinamentos', value: pct('compliancePercent'), detail: 'Obrigações atendidas e válidas' },
    { label: 'Vencidas', value: n('expired'), detail: 'Conclusão perdeu a validade' },
    { label: 'Não concluídas', value: n('missing'), detail: 'Sem conclusão aceita' },
  ];
  return [
    { label: 'APRs em rascunho', value: n('draftAprs'), detail: 'Documentos ainda editáveis' },
    { label: 'APRs finalizadas', value: n('finalizedAprs'), detail: 'Situação atual' },
    { label: 'PTs abertas', value: n('authorizedWorkPermits'), detail: 'Permissões autorizadas' },
    { label: 'Impedimentos preventivos', value: n('workPermitsWithTrainingGaps'), detail: 'Requisitos de treinamento não atendidos' },
  ];
}

export function seriesValues(domain: Domain, raw: unknown) {
  const items = ((raw as { items?: Array<Record<string, unknown>> } | undefined)?.items ?? []);
  return items.map((item) => ({
    label: String(item.date ?? item.start ?? ''),
    primary: Number(domain === 'apr' ? item.aprRevisionsFinalized ?? item.value ?? 0
      : domain === 'training' ? item.trainingCompleted ?? item.value ?? 0
        : item.inspectionsCompleted ?? item.assignmentsStarted ?? item.value ?? 0),
    secondary: Number(domain === 'apr' ? item.workPermitsAuthorized ?? 0 : item.nonconformantFindings ?? item.assignmentsEnded ?? 0),
  }));
}

export const seriesLegend: Record<Domain, [string, string?]> = {
  people: ['Vínculos iniciados', 'Vínculos encerrados'],
  inspections: ['Inspeções concluídas', 'Achados não conformes'],
  training: ['Conclusões aceitas'],
  apr: ['Revisões APR finalizadas', 'PTs autorizadas'],
};

export function summaryBreakdown(domain: Domain, raw: unknown): BreakdownItem[] {
  const data = (raw ?? {}) as Record<string, unknown>;
  if (domain === 'people') return ((data.groups as Record<string, unknown[]> | undefined)?.departments ?? []) as Array<{ id: string; label: string; count: number }>;
  if (domain === 'inspections') return (data.items ?? []) as Array<{ id: string; label: string; registeredAssets: number }>;
  const entries = domain === 'training'
    ? [['Em dia', Number(data.upToDate ?? 0)], ['A vencer', Number(data.expiring ?? 0)], ['Em atenção', Number(data.attention ?? 0)], ['Vencidas', Number(data.expired ?? 0)], ['Não concluídas', Number(data.missing ?? 0)]]
    : [['APRs em rascunho', Number(data.draftAprs ?? 0)], ['APRs finalizadas', Number(data.finalizedAprs ?? 0)], ['PTs em rascunho', Number(data.draftWorkPermits ?? 0)], ['PTs abertas', Number(data.authorizedWorkPermits ?? 0)]];
  return entries.map(([label, count], index) => ({ id: String(index), label: String(label), count: Number(count) }));
}

export function durationLabel(hours: number | null): string {
  if (hours === null) return '—';
  if (hours < 48) return `${hours.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`;
  return `${(hours / 24).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} dias`;
}

