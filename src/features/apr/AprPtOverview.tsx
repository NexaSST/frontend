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
  const periodControls = <div className={"flex min-w-0 items-end gap-2 max-sm:w-full"}>
    <label className={"grid min-w-48 gap-1.5 text-xs font-bold text-muted max-sm:min-w-0 max-sm:flex-1"}>Período de atividade
      <Select value={String(periodDays)} onChange={(event) => onPeriodChange(Number(event.target.value) as PeriodDays)}>
        <option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option>
        <option value="180">Últimos 6 meses</option><option value="365">Últimos 12 meses</option>
      </Select>
    </label>
    <Button variant="secondary" size="icon" aria-label="Atualizar indicadores" onClick={() => {
      void dashboard.refetch(); if (isPt) void priorities.refetch();
    }} loading={dashboard.isFetching || priorities.isFetching}><RefreshCw size={17} /></Button>
  </div>;
  return <section className={"grid gap-4 min-w-0"} aria-label={isPt ? 'Visão geral das Permissões de Trabalho' : 'Visão geral das APRs'}>
    <header className={"min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel flex items-center gap-4 p-6 [&_>_div:nth-child(2)]:min-w-0 [&_>_div:nth-child(2)]:flex-1 [&_h2]:m-[.25rem_0] [&_h2]:text-[clamp(1.25rem,2vw,1.65rem)] [&_p]:m-0 [&_p]:text-muted [&_p]:leading-[1.45] max-[640px]:items-start max-[640px]:flex-wrap max-[640px]:[&_>_.ui-button]:w-full max-[640px]:[&_>_.ui-button]:justify-center flex-wrap!"}>
      <div className={"grid flex-[0_0_3.25rem] place-items-center h-13 rounded-[.9rem] text-accent-strong bg-accent-soft [&_svg]:w-[1.6rem] [&_svg]:h-[1.6rem]"}>{isPt ? <ClipboardCheck aria-hidden="true" /> : <FileCheck2 aria-hidden="true" />}</div>
      <div><span className={"workspace-eyebrow text-accent-strong text-[0.7rem] font-[850] tracking-[0.075em] uppercase"}>Visão geral</span><h2>{isPt ? 'Acompanhe as permissões de trabalho' : 'Acompanhe as análises de risco'}</h2><p>{isPt ? 'Rascunhos, autorizações e impedimentos do fluxo de PT nesta filial.' : 'Rascunhos e revisões finalizadas do fluxo de APR nesta filial.'}</p></div>
      <div className={"ml-auto flex items-end justify-end gap-3 max-lg:w-full max-lg:justify-start max-sm:flex-col max-sm:items-stretch"}>
        {periodControls}<Button onClick={onOpenList}>Ver {isPt ? 'permissões' : 'APRs'} <ArrowRight size={16} /></Button>
      </div>
    </header>
    {dashboard.isPending ? <p className={"text-muted text-[.75rem]"}>Carregando indicadores…</p> : dashboard.isError ? <div className={"error-panel p-[2.5rem_1rem] text-muted text-center [&_p]:m-[0.35rem_0_0]"}><strong>Não foi possível carregar os indicadores.</strong><Button variant="secondary" onClick={() => void dashboard.refetch()}>Tentar novamente</Button></div> : <>
      <div className={"grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] border border-solid border-line rounded-panel overflow-hidden bg-surface shadow-panel [&_article]:grid [&_article]:gap-[.35rem] [&_article]:min-w-0 [&_article]:p-[1.1rem] [&_article]:border-r [&_article]:border-solid [&_article]:border-r-line [&_article:last-child]:border-r-0 [&_span]:text-muted [&_span]:text-[.75rem] [&_span]:font-[750] [&_strong]:text-[1.9rem] [&_strong]:leading-none [&_strong]:tabular-nums [&_small]:text-muted [&_small]:text-[.74rem] max-[640px]:grid-cols-2 max-[640px]:[&_article:nth-child(2n)]:border-r-0 max-[640px]:[&_article:nth-child(n+3)]:border-t max-[640px]:[&_article:nth-child(n+3)]:border-solid max-[640px]:[&_article:nth-child(n+3)]:border-t-line"}>{metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value.toLocaleString('pt-BR')}</strong><small>{metric.detail}</small></article>)}</div>
      <div className={"grid grid-cols-[minmax(0,1.7fr)_minmax(16rem,.8fr)] gap-4 [&_h3]:m-[0_0_.25rem] [&_h3]:text-[1.05rem] [&_p]:m-0 [&_p]:text-muted [&_p]:text-[.84rem] [&_p]:leading-normal max-[1000px]:grid-cols-[1fr]"}><section className={"min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-5 min-h-68"}><header><h3>{isPt ? 'PTs autorizadas' : 'Revisões APR finalizadas'} no período</h3><p>Movimentação registrada nos últimos {periodDays} dias.</p></header>{activity.some((item) => item.value > 0) ? <div className={"flex items-end gap-[.9rem] h-40 mt-[1.2rem] [&_>_div]:grid [&_>_div]:flex-1 [&_>_div]:min-w-0 [&_>_div]:h-full [&_>_div]:grid-rows-[1fr_auto] [&_>_div]:gap-[.4rem] [&_>_div]:text-center [&_>_div_>_span]:flex [&_>_div_>_span]:items-end [&_>_div_>_span]:justify-center [&_>_div_>_span]:h-full [&_i]:w-[min(100%,3rem)] [&_i]:rounded-[.4rem_.4rem_0_0] [&_i]:bg-accent [&_small]:overflow-hidden [&_small]:text-muted [&_small]:text-[.7rem] [&_small]:text-ellipsis [&_small]:whitespace-nowrap"} role="img" aria-label={activity.map((item) => `${item.label}: ${item.value}`).join('; ')}>{activity.map((item) => <div key={item.label} aria-hidden="true"><span><i style={{ height: `${item.value ? Math.max(8, item.value / max * 100) : 0}%` }} /></span><small>{item.label}</small></div>)}</div> : <div className={"grid place-items-center min-h-40 text-muted text-center"}>Nenhuma movimentação neste período.</div>}</section><aside className={"min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-5 grid [align-content:start] gap-[.85rem] [&_.ui-button]:justify-self-start"}><h3>{isPt ? 'Impedimentos preventivos' : 'Próximo passo'}</h3>{isPt ? priorities.isPending ? <p>Carregando impedimentos…</p> : priorities.isError ? <p>Não foi possível carregar os impedimentos. Atualize os indicadores para tentar novamente.</p> : gaps.length ? <div className={"grid gap-[.4rem] max-h-48 overflow-auto [&_button]:flex [&_button]:items-center [&_button]:gap-[.5rem] [&_button]:w-full [&_button]:p-[.65rem] [&_button]:border [&_button]:border-solid [&_button]:border-line [&_button]:rounded-[.55rem] [&_button]:bg-white [&_button]:text-left [&_button]:cursor-pointer [&_button_strong]:flex-[0_0_auto] [&_button_small]:min-w-0 [&_button_small]:flex-1 [&_button_small]:overflow-hidden [&_button_small]:text-ellipsis [&_button_small]:whitespace-nowrap"}>{gaps.map((item) => <button key={item.entityId} type="button" onClick={() => onOpenPermit(item.entityId)}><strong>{item.title}</strong><small>{item.detail}</small><ArrowRight size={15} /></button>)}</div> : <p>Nenhuma PT com impedimento de treinamento identificada.</p> : <p>Abra as APRs para revisar rascunhos e finalizar análises antes de vinculá-las a uma PT.</p>}<Button variant="secondary" onClick={onOpenList}>Abrir {isPt ? 'lista de PTs' : 'lista de APRs'}</Button></aside></div>
      <footer className={"text-muted text-[.75rem]"}>Dados de {data?.asOf ? new Date(`${data.asOf}T12:00:00`).toLocaleDateString('pt-BR') : '—'}.</footer>
    </>}
  </section>;
}
