import { cx } from '../components/ui/utils.js';
import { OperationalChart } from '../components/OperationalChart.js';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Activity, AlertTriangle, ArrowRight, CalendarRange, ClipboardCheck, GraduationCap, MapPin, RefreshCw, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, PageTitle, Select } from '../components/ui/index.js';
import { apiJson } from '../lib/api.js';
import { sessionQueryOptions, type CompanySession } from '../lib/session.js';

const dashboardMetricClasses = {
  "neutral": "",
  "success": "[&_strong]:text-accent",
  "warning": "[&_strong]:text-[#8a6110]",
  "danger": "[&_strong]:text-danger",
};

const dashboardAlertClasses = {
  "warning": "[&_>_span]:bg-[#f0c45e]",
  "danger": "[&_>_span]:bg-[#ef9b91]",
  "info": "[&_>_span]:bg-[#b4d6e3]",
};

type PeriodDays = 30 | 90 | 180 | 365;
interface TrainingSummary { applicable: number; compliant: number; expiring: number; expired: number; missing: number; peopleWithoutMatrix: number; assignmentIssues: number; compliancePercent: number | null }
interface InspectionSummary { monitoredAssets: number; planned: number; compliant: number; overdue: number; missingSchedule: number; expiredAssets: number; missingValidity: number; compliancePercent: number | null }
interface DashboardBranch { id: string; name: string; code: string; timezone: string | null; activePeople: number; training: TrainingSummary; inspections: InspectionSummary; period: { inspectionsCompleted: number; nonconformantFindings: number }; attentionCount: number }
interface CompanyDashboard {
  generatedAt: string; periodDays: PeriodDays;
  snapshot: { activePeople: number; training: TrainingSummary; inspections: InspectionSummary };
  period: { inspectionsCompleted: number; nonconformantFindings: number };
  activity: Array<{ start: string; end: string; label: string; inspectionsCompleted: number; nonconformantFindings: number }>;
  branches: DashboardBranch[];
  alerts: Array<{ code: string; severity: 'danger' | 'warning' | 'info'; branchId: string; branchName: string; title: string; description: string; count: number }>;
}

function percentage(value: number | null): string {
  return value === null ? '—' : `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)}%`;
}

function Metric({ icon, label, value, detail, tone = 'neutral' }: {
  icon: ReactNode; label: string; value: string; detail: string; tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  return <div className={cx("grid grid-cols-[auto_minmax(0,1fr)] items-start gap-[0.7rem] min-w-0 p-[1.1rem] border-l border-solid border-l-line first:border-l-0 [&_>_div_>_span]:block [&_>_div_>_span]:text-muted [&_>_div_>_span]:min-h-[2.2em] [&_>_div_>_span]:text-[0.75rem] [&_>_div_>_span]:font-[750] [&_>_div_>_span]:leading-[1.15] [&_small]:block [&_small]:text-muted [&_small]:overflow-hidden [&_small]:text-[0.7rem] [&_small]:leading-[1.35] [&_small]:text-ellipsis [&_strong]:block [&_strong]:m-[0.15rem_0_0.2rem] [&_strong]:text-[1.9rem] [&_strong]:leading-none [&_strong]:tracking-[-0.03em] [&_strong]:tabular-nums max-[800px]:nth-3:border-l-0 max-[800px]:nth-3:border-t max-[800px]:nth-3:border-solid max-[800px]:nth-3:border-t-line max-[800px]:nth-4:border-t max-[800px]:nth-4:border-solid max-[800px]:nth-4:border-t-line max-[520px]:border-0 max-[520px]:border-t max-[520px]:border-solid max-[520px]:border-t-line max-[520px]:nth-3:border-0 max-[520px]:nth-3:border-t max-[520px]:nth-3:border-solid max-[520px]:nth-3:border-t-line max-[520px]:nth-4:border-0 max-[520px]:nth-4:border-t max-[520px]:nth-4:border-solid max-[520px]:nth-4:border-t-line max-[520px]:first:border-t-0", dashboardMetricClasses[tone])}><span className={"inline-grid place-items-center w-[2.15rem] h-[2.15rem] rounded-[0.6rem] text-accent-strong bg-[#e6eee9]"}>{icon}</span><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}

function DashboardSkeleton() {
  return <div className={"grid gap-4 [&_div]:min-h-32 [&_div]:rounded-panel [&_div]:bg-[#e8e9e4] [&_div]:animate-[dashboard-pulse_1.2s_ease-in-out_infinite_alternate] [&_div:nth-child(2)]:min-h-100"} aria-label="Carregando visão gerencial"><div /><div /><div /></div>;
}

export function CompanyHomePage() {
  const { data: session } = useSuspenseQuery(sessionQueryOptions);
  if (session.kind !== 'company') return null;
  return <CompanyDashboard session={session} />;
}

function CompanyDashboard({ session }: { session: CompanySession }) {
  const search = useSearch({ strict: false }) as { branchId?: string; periodDays?: PeriodDays };
  const navigate = useNavigate();
  const branchId = session.context.branches.some((branch) => branch.id === search.branchId) ? search.branchId : undefined;
  const periodDays: PeriodDays = [30, 90, 180, 365].includes(Number(search.periodDays)) ? Number(search.periodDays) as PeriodDays : 30;
  const dashboard = useQuery({
    queryKey: ['company-dashboard', session.companyId, branchId ?? 'all', periodDays],
    queryFn: () => apiJson<CompanyDashboard>(`v1/companies/${session.companyId}/dashboard`, {
      searchParams: { ...(branchId ? { branchId } : {}), periodDays },
    }),
    staleTime: 60_000,
  });
  const setFilters = (next: { branchId?: string | null; periodDays?: PeriodDays }) => void navigate({
    to: '/app', search: {
      branchId: next.branchId === null ? undefined : next.branchId ?? branchId,
      periodDays: next.periodDays ?? periodDays,
    }, replace: true,
  });
  const data = dashboard.data;

  return <div className={"workspace m-[0_auto] p-[3.5rem_0_5rem] max-[520px]:pt-8 w-[min(94vw,96rem)] [&_.page-heading]:mb-6 [&_.page-heading_h1]:max-w-none [&_.page-heading_h1]:text-[clamp(2.1rem,4vw,3.5rem)] max-[520px]:w-[min(92vw,96rem)]"}>
    <PageTitle title="Visão geral da empresa" description={`Compliance, prevenção e situação operacional de ${session.context.company.name}.`} />
    <section className={"grid grid-cols-[minmax(18rem,1fr)_minmax(13rem,0.45fr)_minmax(12rem,0.38fr)_auto] items-end gap-3 mb-4 p-[1rem_1.1rem] border border-solid border-line rounded-panel bg-surface [&_>_div]:flex [&_>_div]:items-center [&_>_div]:gap-[0.7rem] [&_>_div]:min-h-11 [&_>_div_>_svg]:flex-[0_0_auto] [&_>_div_>_svg]:text-accent [&_strong]:block [&_small]:block [&_small]:mt-[0.15rem] [&_small]:text-muted [&_small]:text-[0.76rem] [&_small]:leading-[1.35] [&_label]:grid [&_label]:gap-[0.35rem] [&_label]:text-muted [&_label]:text-[0.72rem] [&_label]:font-extrabold max-[800px]:grid-cols-[1fr_1fr] max-[800px]:[&_>_div]:col-span-full max-[520px]:grid-cols-[minmax(0,1fr)_auto] max-[520px]:p-[0.9rem] max-[520px]:[&_>_label]:col-span-full"} aria-label="Filtros do dashboard">
      <div><MapPin size={18} /><span><strong>Escopo</strong><small>Compare toda a empresa ou concentre a análise em uma filial.</small></span></div>
      <label><span>Filial</span><Select value={branchId ?? ''} onChange={(event) => setFilters({ branchId: event.target.value || null })}>
        <option value="">Todas as filiais</option>{session.context.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
      </Select></label>
      <label><span>Período</span><Select value={String(periodDays)} onChange={(event) => setFilters({ periodDays: Number(event.target.value) as PeriodDays })}>
        <option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="180">Últimos 6 meses</option><option value="365">Últimos 12 meses</option>
      </Select></label>
      <Button variant="secondary" size="icon" aria-label="Atualizar dashboard" loading={dashboard.isFetching} onClick={() => void dashboard.refetch()}><RefreshCw size={17} /></Button>
    </section>

    {dashboard.isPending && <DashboardSkeleton />}
    {dashboard.isError && <section className={"min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel flex items-center gap-4 p-5 text-danger [&_div]:flex-1 [&_h2]:m-[0_0_0.25rem] [&_h2]:text-ink [&_p]:m-0 [&_p]:text-muted"}><AlertTriangle size={22} /><div><h2>Não foi possível carregar o dashboard</h2><p>A visão gerencial continua protegida. Verifique a conexão e tente novamente.</p></div><Button variant="secondary" onClick={() => void dashboard.refetch()}>Tentar novamente</Button></section>}
    {data && <>
      <section className={"grid grid-cols-4 mb-4 overflow-hidden border border-solid border-line rounded-panel bg-surface shadow-panel max-[800px]:grid-cols-2 max-[520px]:grid-cols-[1fr]"} aria-label="Indicadores atuais">
        <Metric icon={<GraduationCap size={19} />} label="Compliance de treinamentos" value={percentage(data.snapshot.training.compliancePercent)} detail={`${data.snapshot.training.expired + data.snapshot.training.missing} obrigações pendentes`} />
        <Metric icon={<ClipboardCheck size={19} />} label="Compliance de inspeções" value={percentage(data.snapshot.inspections.compliancePercent)} detail={`${data.snapshot.inspections.overdue} inspeções atrasadas`} />
        <Metric icon={<Users size={19} />} label="Colaboradores ativos" value={String(data.snapshot.activePeople)} detail={`${data.snapshot.training.peopleWithoutMatrix} sem matriz aplicável`} />
        <Metric icon={<Activity size={19} />} label="Ativos monitorados" value={String(data.snapshot.inspections.monitoredAssets)} detail={`${data.snapshot.inspections.missingSchedule} sem próxima inspeção`} />
      </section>

      <div className={"grid grid-cols-[minmax(0,1.75fr)_minmax(18rem,0.75fr)] gap-4 mb-4 max-[800px]:grid-cols-[1fr]"}>
        <section className={"min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-[1.35rem] [&_>_header]:flex [&_>_header]:items-start [&_>_header]:justify-between [&_>_header]:gap-4 [&_h2]:m-[0_0_0.35rem] [&_header_p]:max-w-[68ch] [&_header_p]:m-0 [&_header_p]:text-muted [&_header_p]:text-[0.82rem] [&_header_p]:leading-normal [&_header_>_span]:inline-flex [&_header_>_span]:flex-[0_0_auto] [&_header_>_span]:items-center [&_header_>_span]:gap-[0.4rem] [&_header_>_span]:p-[0.4rem_0.55rem] [&_header_>_span]:rounded-[999px] [&_header_>_span]:text-accent-strong [&_header_>_span]:bg-[#e6eee9] [&_header_>_span]:text-[0.72rem] [&_header_>_span]:font-extrabold max-[520px]:p-4 max-[520px]:[&_>_header]:flex-col"}>
          <header><div><h2>Atividade preventiva</h2><p>Eventos registrados no período selecionado. Os percentuais acima representam a situação atual.</p></div><span><CalendarRange size={16} /> {periodDays === 180 ? '6 meses' : periodDays === 365 ? '12 meses' : `${periodDays} dias`}</span></header>
          {data.activity.some((point) => point.inspectionsCompleted || point.nonconformantFindings) ? <>
            <div className={"activity-legend flex justify-end gap-4 m-[1rem_0_0.5rem] text-muted text-[0.72rem] [&_span]:inline-flex [&_span]:items-center [&_span]:gap-[0.35rem] [&_i]:w-[0.6rem] [&_i]:h-[0.6rem] [&_i]:rounded-[0.2rem] [&_.completed]:bg-accent [&_.findings]:bg-[#d89830] max-[520px]:justify-start max-[520px]:flex-wrap"}><span><i className={"completed"} /> Inspeções concluídas</span><span><i className={"findings"} /> Não conformidades</span></div>
            <OperationalChart label="Atividade preventiva no período" data={data.activity.map((point) => ({ ...point }))} series={[{ key: 'inspectionsCompleted', label: 'Inspeções concluídas' }, { key: 'nonconformantFindings', label: 'Não conformidades' }]} />
            <div className={"activity-summary grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-baseline gap-[0.35rem_0.55rem] mt-4 text-muted text-[0.75rem] [&_strong]:text-ink [&_strong]:text-[1.2rem] [&_strong]:tabular-nums max-[520px]:grid-cols-[auto_minmax(0,1fr)]"}><strong>{data.period.inspectionsCompleted}</strong><span>inspeções concluídas</span><strong>{data.period.nonconformantFindings}</strong><span>não conformidades identificadas</span></div>
          </> : <div className={"dashboard-empty grid justify-items-center min-h-52 p-6 text-muted text-center [&.compact]:min-h-48 [&_h3]:m-[0.65rem_0_0.3rem] [&_h3]:text-ink [&_h3]:text-[1rem] [&_p]:max-w-[48ch] [&_p]:m-0 [&_p]:text-[0.78rem] [&_p]:leading-normal"}><ClipboardCheck size={26} /><h3>Nenhuma atividade registrada neste período</h3><p>Quando inspeções forem concluídas, o histórico aparecerá aqui sem alterar os indicadores atuais.</p></div>}
        </section>

        <aside className={"min-w-0 border border-solid rounded-panel bg-[#13251f] shadow-panel overflow-hidden text-[#f5faf7] border-[#13251f] [&_>_header]:flex [&_>_header]:items-center [&_>_header]:justify-between [&_>_header]:gap-4 [&_>_header]:p-[1.35rem_1.35rem_0.75rem] [&_h2]:m-[0_0_0.35rem] [&_>_header_span]:inline-grid [&_>_header_span]:place-items-center [&_>_header_span]:min-w-[1.7rem] [&_>_header_span]:h-[1.7rem] [&_>_header_span]:p-[0_0.4rem] [&_>_header_span]:rounded-[999px] [&_>_header_span]:text-[#173329] [&_>_header_span]:bg-[#d9eee4] [&_>_header_span]:text-[0.72rem] [&_>_header_span]:font-[850] [&_>_div]:max-h-100 [&_>_div]:overflow-y-auto [&_.dashboard-empty]:text-[#d5e0db] [&_.dashboard-empty_h3]:text-[#f5faf7]"}>
          <header><h2>Pontos de atenção</h2><span>{data.alerts.length}</span></header>
          {data.alerts.length ? <div>{data.alerts.map((alert) => <article key={`${alert.code}:${alert.branchId}`} className={cx("grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-[0.9rem_1.35rem] border-t border-solid border-t-[rgb(255_255_255/11%)] [&_>_span]:inline-grid [&_>_span]:place-items-center [&_>_span]:[align-self:start] [&_>_span]:min-w-8 [&_>_span]:h-8 [&_>_span]:p-[0_0.35rem] [&_>_span]:rounded-compact [&_>_span]:text-[#13251f] [&_>_span]:text-[0.75rem] [&_>_span]:font-black [&_>_span]:tabular-nums [&_strong]:block [&_small]:block [&_small]:mt-[0.15rem] [&_small]:text-[#b9cbc3] [&_small]:text-[0.7rem] [&_p]:m-[0.4rem_0_0] [&_p]:text-[#d5e0db] [&_p]:text-[0.73rem] [&_p]:leading-[1.4]", dashboardAlertClasses[alert.severity])}><span>{alert.count}</span><div><strong>{alert.title}</strong><small>{alert.branchName}</small><p>{alert.description}</p></div></article>)}</div>
            : <div className={"dashboard-empty grid justify-items-center min-h-52 p-6 text-muted text-center [&.compact]:min-h-48 [&_h3]:m-[0.65rem_0_0.3rem] [&_h3]:text-ink [&_h3]:text-[1rem] [&_p]:max-w-[48ch] [&_p]:m-0 [&_p]:text-[0.78rem] [&_p]:leading-normal compact"}><ClipboardCheck size={24} /><h3>Nenhuma atenção crítica</h3><p>Os cadastros e prazos visíveis estão em ordem.</p></div>}
        </aside>
      </div>

      <section className={"min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-[1.35rem] [&_>_header]:flex [&_>_header]:items-start [&_>_header]:justify-between [&_>_header]:gap-4 [&_>_header]:mb-3 [&_h2]:m-[0_0_0.35rem] [&_header_p]:max-w-[68ch] [&_header_p]:m-0 [&_header_p]:text-muted [&_header_p]:text-[0.82rem] [&_header_p]:leading-normal [&_dl]:grid [&_dl]:grid-cols-4 [&_dl]:gap-3 [&_dl]:m-0 [&_dl_div]:min-w-0 [&_dt]:overflow-hidden [&_dt]:text-muted [&_dt]:text-[0.67rem] [&_dt]:font-[750] [&_dt]:text-ellipsis [&_dt]:whitespace-nowrap [&_dd]:m-[0.2rem_0_0] [&_dd]:text-[0.9rem] [&_dd]:font-extrabold [&_dd]:tabular-nums max-[800px]:[&_dl]:col-span-full max-[800px]:[&_dl]:row-2 max-[520px]:p-4 max-[520px]:[&_dl]:col-1 max-[520px]:[&_dl]:row-auto max-[520px]:[&_dl]:grid-cols-2"}>
        <header><div><h2>Situação por filial</h2><p>Compare os principais sinais e entre na filial para acessar Pessoas e estrutura e os módulos contratados.</p></div></header>
        {data.branches.length ? <div className={"grid"}>{data.branches.map((branch) => <article className={"grid grid-cols-[minmax(13rem,1fr)_minmax(23rem,1.25fr)_auto] items-center gap-4 p-[0.9rem_0] border-t border-solid border-t-line max-[800px]:grid-cols-[minmax(0,1fr)_auto] max-[520px]:grid-cols-[1fr] max-[520px]:gap-3"} key={branch.id}>
          <div className={"flex items-center gap-[0.7rem] min-w-0 [&_strong]:block [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:whitespace-nowrap [&_small]:block [&_small]:overflow-hidden [&_small]:text-ellipsis [&_small]:whitespace-nowrap [&_small]:mt-[0.2rem] [&_small]:text-muted [&_small]:text-[0.72rem]"}><span className={"record-icon inline-grid place-items-center w-9 h-9 rounded-[0.65rem] text-accent-strong bg-[#e5eee9]"}><MapPin size={18} /></span><span><strong>{branch.name}</strong><small>{branch.code} · {branch.timezone || session.context.company.timezone || 'Fuso não informado'}</small></span></div>
          <dl><div><dt>Treinamentos</dt><dd>{percentage(branch.training.compliancePercent)}</dd></div><div><dt>Inspeções</dt><dd>{percentage(branch.inspections.compliancePercent)}</dd></div><div><dt>Atenções</dt><dd>{branch.attentionCount}</dd></div><div><dt>Colaboradores</dt><dd>{branch.activePeople}</dd></div></dl>
          <Link className={"inline-flex items-center justify-center gap-[0.4rem] min-h-10 p-[0.55rem_0.75rem] border border-solid border-line rounded-control text-accent-strong bg-white text-[0.76rem] font-extrabold no-underline whitespace-nowrap [&:hover]:border-[#93aa9f] [&:hover]:bg-[#f2f7f4] max-[800px]:col-2 max-[800px]:row-1 max-[520px]:col-1 max-[520px]:row-auto max-[520px]:w-full"} to="/workspace/$companyId/$branchId" params={{ companyId: session.companyId, branchId: branch.id }} search={{ periodDays, categoryId: undefined, activityDomain: undefined, trainingPage: 1, inspectionsPage: 1, aprPage: 1 }}>Entrar na filial <ArrowRight size={16} /></Link>
        </article>)}</div> : <div className={"dashboard-empty grid justify-items-center min-h-52 p-6 text-muted text-center [&.compact]:min-h-48 [&_h3]:m-[0.65rem_0_0.3rem] [&_h3]:text-ink [&_h3]:text-[1rem] [&_p]:max-w-[48ch] [&_p]:m-0 [&_p]:text-[0.78rem] [&_p]:leading-normal"}><MapPin size={26} /><h3>Nenhuma filial disponível</h3><p>Cadastre ou libere uma filial para começar a acompanhar a operação.</p></div>}
      </section>
    </>}
  </div>;
}
