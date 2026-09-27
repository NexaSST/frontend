import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Activity, AlertTriangle, ArrowRight, CalendarRange, ClipboardCheck, GraduationCap, MapPin, RefreshCw, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, PageTitle, Select } from '../components/ui/index.js';
import { apiJson } from '../lib/api.js';
import { sessionQueryOptions, type CompanySession } from '../lib/session.js';

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
  return <div className={`dashboard-metric dashboard-metric--${tone}`}><span className="dashboard-metric__icon">{icon}</span><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>;
}

function DashboardSkeleton() {
  return <div className="dashboard-skeleton" aria-label="Carregando visão gerencial"><div /><div /><div /></div>;
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
  const maxActivity = Math.max(1, ...(data?.activity.flatMap((point) => [point.inspectionsCompleted, point.nonconformantFindings]) ?? [1]));

  return <div className="workspace company-dashboard">
    <PageTitle title="Visão geral da empresa" description={`Compliance, prevenção e situação operacional de ${session.context.company.name}.`} />
    <section className="dashboard-filterbar" aria-label="Filtros do dashboard">
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
    {dashboard.isError && <section className="dashboard-error"><AlertTriangle size={22} /><div><h2>Não foi possível carregar o dashboard</h2><p>A visão gerencial continua protegida. Verifique a conexão e tente novamente.</p></div><Button variant="secondary" onClick={() => void dashboard.refetch()}>Tentar novamente</Button></section>}
    {data && <>
      <section className="dashboard-metrics" aria-label="Indicadores atuais">
        <Metric icon={<GraduationCap size={19} />} label="Compliance de treinamentos" value={percentage(data.snapshot.training.compliancePercent)} detail={`${data.snapshot.training.expired + data.snapshot.training.missing} obrigações pendentes`} />
        <Metric icon={<ClipboardCheck size={19} />} label="Compliance de inspeções" value={percentage(data.snapshot.inspections.compliancePercent)} detail={`${data.snapshot.inspections.overdue} inspeções atrasadas`} />
        <Metric icon={<Users size={19} />} label="Colaboradores ativos" value={String(data.snapshot.activePeople)} detail={`${data.snapshot.training.peopleWithoutMatrix} sem matriz aplicável`} />
        <Metric icon={<Activity size={19} />} label="Ativos monitorados" value={String(data.snapshot.inspections.monitoredAssets)} detail={`${data.snapshot.inspections.missingSchedule} sem próxima inspeção`} />
      </section>

      <div className="dashboard-primary-grid">
        <section className="dashboard-activity">
          <header><div><h2>Atividade preventiva</h2><p>Eventos registrados no período selecionado. Os percentuais acima representam a situação atual.</p></div><span><CalendarRange size={16} /> {periodDays === 180 ? '6 meses' : periodDays === 365 ? '12 meses' : `${periodDays} dias`}</span></header>
          {data.activity.some((point) => point.inspectionsCompleted || point.nonconformantFindings) ? <>
            <div className="activity-legend"><span><i className="completed" /> Inspeções concluídas</span><span><i className="findings" /> Não conformidades</span></div>
            <div className="activity-chart" aria-label="Atividade preventiva no período">{data.activity.map((point) => <div className="activity-column" key={point.start} title={`${point.label}: ${point.inspectionsCompleted} inspeções, ${point.nonconformantFindings} não conformidades`}>
              <div className="activity-bars"><i className="completed" style={{ height: `${Math.max(point.inspectionsCompleted ? 7 : 0, point.inspectionsCompleted / maxActivity * 100)}%` }} /><i className="findings" style={{ height: `${Math.max(point.nonconformantFindings ? 7 : 0, point.nonconformantFindings / maxActivity * 100)}%` }} /></div><span>{point.label}</span>
            </div>)}</div>
            <div className="activity-summary"><strong>{data.period.inspectionsCompleted}</strong><span>inspeções concluídas</span><strong>{data.period.nonconformantFindings}</strong><span>não conformidades identificadas</span></div>
          </> : <div className="dashboard-empty"><ClipboardCheck size={26} /><h3>Nenhuma atividade registrada neste período</h3><p>Quando inspeções forem concluídas, o histórico aparecerá aqui sem alterar os indicadores atuais.</p></div>}
        </section>

        <aside className="dashboard-alerts">
          <header><h2>Pontos de atenção</h2><span>{data.alerts.length}</span></header>
          {data.alerts.length ? <div>{data.alerts.map((alert) => <article key={`${alert.code}:${alert.branchId}`} className={`dashboard-alert dashboard-alert--${alert.severity}`}><span>{alert.count}</span><div><strong>{alert.title}</strong><small>{alert.branchName}</small><p>{alert.description}</p></div></article>)}</div>
            : <div className="dashboard-empty compact"><ClipboardCheck size={24} /><h3>Nenhuma atenção crítica</h3><p>Os cadastros e prazos visíveis estão em ordem.</p></div>}
        </aside>
      </div>

      <section className="branch-overview">
        <header><div><h2>Situação por filial</h2><p>Compare os principais sinais e entre na filial para acessar Pessoas e estrutura e os módulos contratados.</p></div></header>
        {data.branches.length ? <div className="branch-overview__list">{data.branches.map((branch) => <article className="branch-overview__row" key={branch.id}>
          <div className="branch-overview__identity"><span className="record-icon"><MapPin size={18} /></span><span><strong>{branch.name}</strong><small>{branch.code} · {branch.timezone || session.context.company.timezone || 'Fuso não informado'}</small></span></div>
          <dl><div><dt>Treinamentos</dt><dd>{percentage(branch.training.compliancePercent)}</dd></div><div><dt>Inspeções</dt><dd>{percentage(branch.inspections.compliancePercent)}</dd></div><div><dt>Atenções</dt><dd>{branch.attentionCount}</dd></div><div><dt>Colaboradores</dt><dd>{branch.activePeople}</dd></div></dl>
          <Link className="branch-enter-link" to="/workspace/$companyId/$branchId" params={{ companyId: session.companyId, branchId: branch.id }} search={{ periodDays, categoryId: undefined, activityDomain: undefined, trainingPage: 1, inspectionsPage: 1, aprPage: 1 }}>Entrar na filial <ArrowRight size={16} /></Link>
        </article>)}</div> : <div className="dashboard-empty"><MapPin size={26} /><h3>Nenhuma filial disponível</h3><p>Cadastre ou libere uma filial para começar a acompanhar a operação.</p></div>}
      </section>
    </>}
  </div>;
}
