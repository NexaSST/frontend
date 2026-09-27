import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ClipboardCheck, FileCheck2, RefreshCw } from 'lucide-react';
import { Button, Select } from '../../components/ui/index.js';
import { apiJson } from '../../lib/api.js';
import type { Scope } from '../shared.js';
import type { PeriodDays, Flow, Dashboard, PriorityPage } from './overviewTypes.js';

export function AprPtOverview({ scope, flow, periodDays, onPeriodChange, onOpenList, onOpenPermit }: { scope: Scope; flow: Flow; periodDays: PeriodDays; onPeriodChange: (period: PeriodDays) => void; onOpenList: () => void; onOpenPermit: (id: string) => void }) {
  const dashboard = useQuery({ queryKey: ['apr-pt-flow-overview', scope.companyId, scope.branchId, periodDays], queryFn: () => apiJson<Dashboard>(`v1/companies/${scope.companyId}/branches/${scope.branchId}/dashboard`, { searchParams: { periodDays } }), staleTime: 60_000 });
  const priorities = useQuery({ queryKey: ['pt-flow-priorities', scope.companyId, scope.branchId, periodDays], queryFn: () => apiJson<PriorityPage>(`v1/companies/${scope.companyId}/branches/${scope.branchId}/dashboard/priorities`, { searchParams: { domain: 'apr', periodDays, page: 1, pageSize: 5 } }), enabled: flow === 'pt', staleTime: 60_000 });
  const data = dashboard.data;
  const summary = data?.modules.apr;
  const isPt = flow === 'pt';
  const activity = data?.activity.map((item) => ({ label: item.label, value: isPt ? item.workPermitsAuthorized : item.aprRevisionsFinalized })) ?? [];
  const max = Math.max(1, ...activity.map((item) => item.value));
  const gaps = priorities.data?.items.filter((item) => item.kind === 'pt_training_gap') ?? [];
  const metrics = isPt ? [
    { label: 'PTs em rascunho', value: summary?.draftWorkPermits ?? 0, detail: 'Aguardando conclusão e autorização' },
    { label: 'PTs autorizadas', value: summary?.authorizedWorkPermits ?? 0, detail: 'Situação atual da filial' },
    { label: 'Autorizadas no período', value: summary?.workPermitsAuthorized ?? 0, detail: `Últimos ${periodDays} dias` },
    { label: 'Com impedimento preventivo', value: summary?.workPermitsWithTrainingGaps ?? 0, detail: 'Requerem revisão dos treinamentos' },
  ] : [
    { label: 'APRs em rascunho', value: summary?.draftAprs ?? 0, detail: 'Documentos ainda editáveis' },
    { label: 'APRs finalizadas', value: summary?.finalizedAprs ?? 0, detail: 'Situação atual da filial' },
    { label: 'Revisões finalizadas', value: summary?.aprRevisionsFinalized ?? 0, detail: `Últimos ${periodDays} dias` },
  ];
  const periodControls = <div className="flex min-w-0 items-end gap-2 max-sm:w-full">
    <label className="grid min-w-48 gap-1.5 text-xs font-bold text-muted max-sm:min-w-0 max-sm:flex-1">Período de atividade
      <Select value={String(periodDays)} onChange={(event) => onPeriodChange(Number(event.target.value) as PeriodDays)}>
        <option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option>
        <option value="180">Últimos 6 meses</option><option value="365">Últimos 12 meses</option>
      </Select>
    </label>
    <Button variant="secondary" size="icon" aria-label="Atualizar indicadores" onClick={() => {
      void dashboard.refetch(); if (isPt) void priorities.refetch();
    }} loading={dashboard.isFetching || priorities.isFetching}><RefreshCw size={17} /></Button>
  </div>;
  return <section className="apr-flow-overview" aria-label={isPt ? 'Visão geral das Permissões de Trabalho' : 'Visão geral das APRs'}>
    <header className="apr-flow-hero !flex-wrap">
      <div className="apr-flow-hero__icon">{isPt ? <ClipboardCheck aria-hidden="true" /> : <FileCheck2 aria-hidden="true" />}</div>
      <div><span className="workspace-eyebrow">Visão geral</span><h2>{isPt ? 'Acompanhe as permissões de trabalho' : 'Acompanhe as análises de risco'}</h2><p>{isPt ? 'Rascunhos, autorizações e impedimentos do fluxo de PT nesta filial.' : 'Rascunhos e revisões finalizadas do fluxo de APR nesta filial.'}</p></div>
      <div className="ml-auto flex items-end justify-end gap-3 max-lg:w-full max-lg:justify-start max-sm:flex-col max-sm:items-stretch">
        {periodControls}<Button onClick={onOpenList}>Ver {isPt ? 'permissões' : 'APRs'} <ArrowRight size={16} /></Button>
      </div>
    </header>
    {dashboard.isPending ? <p className="apr-flow-feedback">Carregando indicadores…</p> : dashboard.isError ? <div className="error-panel"><strong>Não foi possível carregar os indicadores.</strong><Button variant="secondary" onClick={() => void dashboard.refetch()}>Tentar novamente</Button></div> : <>
      <div className="apr-flow-metrics">{metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value.toLocaleString('pt-BR')}</strong><small>{metric.detail}</small></article>)}</div>
      <div className="apr-flow-content"><section className="apr-flow-activity"><header><h3>{isPt ? 'PTs autorizadas' : 'Revisões APR finalizadas'} no período</h3><p>Movimentação registrada nos últimos {periodDays} dias.</p></header>{activity.some((item) => item.value > 0) ? <div className="apr-flow-bars" role="img" aria-label={activity.map((item) => `${item.label}: ${item.value}`).join('; ')}>{activity.map((item) => <div key={item.label} aria-hidden="true"><span><i style={{ height: `${item.value ? Math.max(8, item.value / max * 100) : 0}%` }} /></span><small>{item.label}</small></div>)}</div> : <div className="apr-flow-empty">Nenhuma movimentação neste período.</div>}</section><aside className="apr-flow-next"><h3>{isPt ? 'Impedimentos preventivos' : 'Próximo passo'}</h3>{isPt ? priorities.isPending ? <p>Carregando impedimentos…</p> : priorities.isError ? <p>Não foi possível carregar os impedimentos. Atualize os indicadores para tentar novamente.</p> : gaps.length ? <div className="apr-flow-attention">{gaps.map((item) => <button key={item.entityId} type="button" onClick={() => onOpenPermit(item.entityId)}><strong>{item.title}</strong><small>{item.detail}</small><ArrowRight size={15} /></button>)}</div> : <p>Nenhuma PT com impedimento de treinamento identificada.</p> : <p>Abra as APRs para revisar rascunhos e finalizar análises antes de vinculá-las a uma PT.</p>}<Button variant="secondary" onClick={onOpenList}>Abrir {isPt ? 'lista de PTs' : 'lista de APRs'}</Button></aside></div>
      <footer className="apr-flow-updated">Dados de {data?.asOf ? new Date(`${data.asOf}T12:00:00`).toLocaleDateString('pt-BR') : '—'}.</footer>
    </>}
  </section>;
}
