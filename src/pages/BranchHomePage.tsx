import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  MapPin,
  Network,
  RefreshCw,
  ScrollText,
  ShieldAlert,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { CompanyWorkspaceShell } from "../components/CompanyWorkspaceShell.js";
import { Pagination } from "../components/Pagination.js";
import { Button, Select } from "../components/ui/index.js";
import { apiJson } from "../lib/api.js";
import {
  sessionQueryOptions,
  type BranchContext,
  type CompanySession,
} from "../lib/session.js";
import { branchRoute } from "../router.js";

type PeriodDays = 30 | 90 | 180 | 365;
type DashboardDomain = "training" | "inspections" | "apr";
type Severity = "danger" | "warning" | "info";
interface TrainingSummary {
  applicable: number;
  compliant: number;
  expiring: number;
  attention: number;
  upToDate: number;
  expired: number;
  missing: number;
  peopleWithoutMatrix: number;
  assignmentIssues: number;
  compliancePercent: number | null;
}
interface InspectionSummary {
  registeredAssets: number;
  monitoredAssets: number;
  periodicAssets: number;
  planned: number;
  compliant: number;
  overdue: number;
  missingSchedule: number;
  expiredAssets: number;
  missingValidity: number;
  compliancePercent: number | null;
  inspectionsCompleted?: number;
  nonconformantFindings?: number;
}
interface AprSummary {
  draftAprs: number;
  finalizedAprs: number;
  draftWorkPermits: number;
  authorizedWorkPermits: number;
  aprRevisionsFinalized: number;
  workPermitsAuthorized: number;
  workPermitsWithTrainingGaps: number;
}
interface Priority {
  id: string;
  domain: DashboardDomain;
  kind: string;
  severity: Severity;
  title: string;
  detail: string;
  date: string | null;
  entityId: string;
}
interface ActivityPoint {
  start: string;
  end: string;
  label: string;
  trainingCompleted: number;
  inspectionsCompleted: number;
  nonconformantFindings: number;
  aprRevisionsFinalized: number;
  workPermitsAuthorized: number;
}
interface BranchDashboard {
  generatedAt: string;
  asOf: string;
  timezone: string;
  periodDays: PeriodDays;
  branch: { id: string; name: string; code: string };
  contractedModules: string[];
  categories: Array<{ id: string; name: string }>;
  snapshot: {
    activePeople: number;
    training?: TrainingSummary;
    inspections?: InspectionSummary;
  };
  period: {
    trainingCompleted?: number;
    inspectionsCompleted?: number;
    nonconformantFindings?: number;
    aprRevisionsFinalized?: number;
    workPermitsAuthorized?: number;
  };
  activity: ActivityPoint[];
  priorities: Priority[];
  modules: {
    training?: TrainingSummary;
    inspections?: InspectionSummary;
    apr?: AprSummary;
  };
}
interface PriorityPage {
  domain: DashboardDomain;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: Priority[];
}

const moduleMeta: Record<
  DashboardDomain,
  { label: string; Icon: typeof ClipboardCheck; tab: string }
> = {
  training: { label: "Treinamentos", Icon: GraduationCap, tab: "courses" },
  inspections: {
    label: "Ativos e inspeções",
    Icon: ClipboardCheck,
    tab: "assets",
  },
  apr: { label: "APR / PT", Icon: ScrollText, tab: "work-permits" },
};

function percentage(value: number | null): string {
  return value === null
    ? "—"
    : `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value)}%`;
}

function Metric({
  icon,
  label,
  value,
  detail,
  tone = "neutral",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return (
    <div
      className={`branch-dashboard__metric branch-dashboard__metric--${tone}`}
    >
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
}

function PriorityItem({
  item,
  companyId,
  branchId,
  actionable,
}: {
  item: Priority;
  companyId: string;
  branchId: string;
  actionable: boolean;
}) {
  const meta = moduleMeta[item.domain];
  const body = (
    <>
      <span
        className={`branch-priority__signal branch-priority__signal--${item.severity}`}
      >
        <ShieldAlert size={15} />
      </span>
      <span>
        <strong>{item.title}</strong>
        <small>
          {item.detail}
          {item.date
            ? ` · ${new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${item.date}T00:00:00Z`))}`
            : ""}
        </small>
      </span>
      <ArrowRight size={16} />
    </>
  );
  return actionable ? (
    <Link
      className="branch-priority"
      to="/workspace/$companyId/$branchId/$moduleCode"
      params={{ companyId, branchId, moduleCode: item.domain }}
      search={{
        tab: meta.tab,
        page: 1,
        q: "",
        action: undefined,
        id: item.entityId,
        periodDays: 30,
      }}
    >
      {body}
    </Link>
  ) : (
    <div className="branch-priority branch-priority--static">{body}</div>
  );
}

function ActivityPanel({
  data,
  domain,
  setDomain,
}: {
  data: BranchDashboard;
  domain: DashboardDomain;
  setDomain: (domain: DashboardDomain) => void;
}) {
  const available = (
    ["training", "inspections", "apr"] as DashboardDomain[]
  ).filter((item) => data.contractedModules.includes(item));
  const series =
    domain === "training"
      ? [
          {
            key: "trainingCompleted" as const,
            label: "Treinamentos realizados",
            className: "completed",
          },
        ]
      : domain === "inspections"
        ? [
            {
              key: "inspectionsCompleted" as const,
              label: "Inspeções concluídas",
              className: "completed",
            },
            {
              key: "nonconformantFindings" as const,
              label: "Não conformidades",
              className: "findings",
            },
          ]
        : [
            {
              key: "aprRevisionsFinalized" as const,
              label: "APRs finalizadas",
              className: "completed",
            },
            {
              key: "workPermitsAuthorized" as const,
              label: "PTs autorizadas",
              className: "findings",
            },
          ];
  const max = Math.max(
    1,
    ...data.activity.flatMap((point) => series.map((item) => point[item.key])),
  );
  return (
    <section className="branch-dashboard__activity">
      <header>
        <div>
          <h2>Atividade no período</h2>
          <p>
            Eventos históricos; os indicadores acima representam a situação
            atual.
          </p>
        </div>
        <div
          className="domain-switcher"
          role="group"
          aria-label="Domínio da atividade"
        >
          {available.map((item) => (
            <button
              type="button"
              key={item}
              className={item === domain ? "active" : ""}
              aria-pressed={item === domain}
              onClick={() => setDomain(item)}
            >
              {moduleMeta[item].label}
            </button>
          ))}
        </div>
      </header>
      <div className="activity-legend">
        {series.map((item) => (
          <span key={item.key}>
            <i className={item.className} />
            {item.label}
          </span>
        ))}
      </div>
      {data.activity.some((point) =>
        series.some((item) => point[item.key] > 0),
      ) ? (
        <div
          className="activity-chart"
          aria-label={`Atividade de ${moduleMeta[domain].label}`}
        >
          {data.activity.map((point) => {
            const exactValues = `${point.label}: ${series.map((item) => `${item.label}, ${point[item.key]}`).join("; ")}`;
            return (
              <div
                className="activity-column"
                key={point.start}
                tabIndex={0}
                aria-label={exactValues}
                title={exactValues}
              >
                <div className="activity-bars" aria-hidden="true">
                  {series.map((item) => (
                    <i
                      key={item.key}
                      className={item.className}
                      style={{
                        height: `${Math.max(point[item.key] ? 7 : 0, (point[item.key] / max) * 100)}%`,
                      }}
                    />
                  ))}
                </div>
                <span aria-hidden="true">{point.label}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="branch-dashboard__empty">
          <Activity size={24} />
          <strong>Nenhuma atividade registrada</strong>
          <span>Os eventos deste domínio aparecerão aqui.</span>
        </div>
      )}
    </section>
  );
}

function ModuleDetails({
  domain,
  summary,
  page,
  setPage,
  companyId,
  branchId,
  periodDays,
  categoryId,
  actionable,
}: {
  domain: DashboardDomain;
  summary: TrainingSummary | InspectionSummary | AprSummary;
  page: number;
  setPage: (page: number) => void;
  companyId: string;
  branchId: string;
  periodDays: PeriodDays;
  categoryId?: string;
  actionable: boolean;
}) {
  const priorities = useQuery({
    queryKey: [
      "branch-dashboard-priorities",
      companyId,
      branchId,
      domain,
      page,
      periodDays,
      categoryId ?? "all",
    ],
    queryFn: () =>
      apiJson<PriorityPage>(
        `v1/companies/${companyId}/branches/${branchId}/dashboard/priorities`,
        {
          searchParams: {
            domain,
            page,
            pageSize: 5,
            periodDays,
            ...(domain === "inspections" && categoryId ? { categoryId } : {}),
          },
        },
      ),
    staleTime: 60_000,
  });
  const meta = moduleMeta[domain];
  const stats: Array<[string, number]> =
    domain === "training"
      ? [
          ["Em dia", (summary as TrainingSummary).upToDate],
          ["A vencer · 0–30d", (summary as TrainingSummary).expiring],
          ["Atenção · 31–90d", (summary as TrainingSummary).attention],
          ["Vencidas", (summary as TrainingSummary).expired],
          ["Não concluídas", (summary as TrainingSummary).missing],
        ]
      : domain === "inspections"
        ? [
            ["Periódicos", (summary as InspectionSummary).periodicAssets],
            ["Em dia", (summary as InspectionSummary).compliant],
            ["Atrasados", (summary as InspectionSummary).overdue],
            [
              "Sem próxima inspeção",
              (summary as InspectionSummary).missingSchedule,
            ],
            ["Validade vencida", (summary as InspectionSummary).expiredAssets],
          ]
        : [
            ["APRs em rascunho", (summary as AprSummary).draftAprs],
            [
              "APRs finalizadas no período",
              (summary as AprSummary).aprRevisionsFinalized,
            ],
            ["PTs em rascunho", (summary as AprSummary).draftWorkPermits],
            [
              "PTs autorizadas no período",
              (summary as AprSummary).workPermitsAuthorized,
            ],
            [
              "PTs com requisitos não atendidos",
              (summary as AprSummary).workPermitsWithTrainingGaps,
            ],
          ];
  const Icon = meta.Icon;
  return (
    <section className="branch-module-detail">
      <header>
        <span>
          <Icon size={20} />
        </span>
        <div>
          <h2>{meta.label}</h2>
          <p>Resumo atual e prioridades que exigem acompanhamento.</p>
        </div>
      </header>
      <dl>
        {stats.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {priorities.isPending ? (
        <div className="branch-dashboard__empty compact">
          <span>Carregando prioridades…</span>
        </div>
      ) : priorities.isError ? (
        <div className="branch-dashboard__empty compact">
          <strong>Não foi possível carregar os detalhes</strong>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void priorities.refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      ) : priorities.data?.items.length ? (
        <>
          <div className="branch-priority-list">
            {priorities.data.items.map((item) => (
              <PriorityItem
                key={item.id}
                item={item}
                companyId={companyId}
                branchId={branchId}
                actionable={actionable}
              />
            ))}
          </div>
          <Pagination
            page={priorities.data.page}
            totalPages={priorities.data.totalPages}
            total={priorities.data.total}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="branch-dashboard__empty compact">
          <ClipboardCheck size={22} />
          <strong>Nenhuma prioridade neste domínio</strong>
          <span>Os registros atuais não exigem intervenção.</span>
        </div>
      )}
    </section>
  );
}

function DashboardContent({
  companyId,
  branchId,
  session,
  branch,
}: {
  companyId: string;
  branchId: string;
  session?: CompanySession;
  branch?: BranchContext;
}) {
  const search = branchRoute.useSearch();
  const navigate = useNavigate({ from: branchRoute.fullPath });
  const dashboard = useQuery({
    queryKey: [
      "branch-dashboard",
      companyId,
      branchId,
      search.periodDays,
      search.categoryId ?? "all",
    ],
    queryFn: () =>
      apiJson<BranchDashboard>(
        `v1/companies/${companyId}/branches/${branchId}/dashboard`,
        {
          searchParams: {
            periodDays: search.periodDays,
            ...(search.categoryId ? { categoryId: search.categoryId } : {}),
          },
        },
      ),
    staleTime: 60_000,
  });
  const data = dashboard.data;
  const setSearch = (patch: Partial<typeof search>) =>
    void navigate({
      search: (previous) => ({ ...previous, ...patch }),
      replace: true,
    });
  const domains = (
    ["training", "inspections", "apr"] as DashboardDomain[]
  ).filter((item) => data?.contractedModules.includes(item));
  const activeDomain = domains.includes(search.activityDomain ?? "training")
    ? search.activityDomain!
    : (domains[0] ?? "inspections");
  const entries = branch
    ? [
        ...(branch.foundationPermissions.includes("person.manage")
          ? [
              {
                code: "people",
                name: "Pessoas e estrutura",
                description:
                  "Colaboradores, departamentos, funções e prestadores.",
                Icon: Network,
              },
            ]
          : []),
        ...branch.modules.map((module) => ({
          code: module.code,
          name: module.name,
          description: "Abrir operação e cadastros do módulo.",
          Icon:
            moduleMeta[module.code as DashboardDomain]?.Icon ?? ClipboardCheck,
        })),
      ]
    : [];
  if (dashboard.isPending)
    return (
      <div
        className="branch-dashboard__skeleton"
        aria-label="Carregando dashboard da filial"
      >
        <div />
        <div />
        <div />
      </div>
    );
  if (dashboard.isError || !data)
    return (
      <section className="dashboard-error">
        <AlertTriangle size={22} />
        <div>
          <h2>Não foi possível carregar o dashboard</h2>
          <p>Verifique a conexão e tente novamente.</p>
        </div>
        <Button variant="secondary" onClick={() => void dashboard.refetch()}>
          Tentar novamente
        </Button>
      </section>
    );
  const updated = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: data.timezone,
  }).format(new Date(data.generatedAt));
  return (
    <div className="branch-dashboard">
      <section
        className="branch-dashboard__filterbar"
        aria-label="Cabeçalho e filtros do dashboard"
      >
        <div>
          <MapPin size={18} />
          <div>
            <h1>{data.branch.name}</h1>
            <small>
              {data.branch.code} · Fuso {data.timezone}
            </small>
          </div>
        </div>
        <label>
          <span>Período</span>
          <Select
            aria-label="Período"
            value={String(search.periodDays)}
            onChange={(event) =>
              setSearch({
                periodDays: Number(event.target.value) as PeriodDays,
                trainingPage: 1,
                inspectionsPage: 1,
                aprPage: 1,
              })
            }
          >
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="180">Últimos 6 meses</option>
            <option value="365">Últimos 12 meses</option>
          </Select>
        </label>
        <div
          className="branch-dashboard__updated"
          role="status"
          aria-live="polite"
        >
          <Clock3 size={16} />
          <span>Atualizado em {updated}</span>
        </div>
        <Button
          variant="secondary"
          size="icon"
          aria-label="Atualizar dashboard"
          loading={dashboard.isFetching}
          onClick={() => void dashboard.refetch()}
        >
          <RefreshCw size={17} />
        </Button>
      </section>
      <section
        className="branch-dashboard__metrics"
        aria-label="Indicadores atuais"
      >
        {data.snapshot.training && (
          <Metric
            icon={<GraduationCap size={19} />}
            label="Compliance de treinamentos"
            value={percentage(data.snapshot.training.compliancePercent)}
            detail={`${data.snapshot.training.expired + data.snapshot.training.missing} obrigações pendentes`}
          />
        )}
        {data.snapshot.inspections && (
          <Metric
            icon={<ClipboardCheck size={19} />}
            label="Compliance de inspeções"
            value={percentage(data.snapshot.inspections.compliancePercent)}
            detail={`${data.snapshot.inspections.overdue} inspeções atrasadas`}
          />
        )}
        <Metric
          icon={<Users size={19} />}
          label="Colaboradores ativos"
          value={String(data.snapshot.activePeople)}
          detail={
            data.snapshot.training
              ? `${data.snapshot.training.peopleWithoutMatrix} sem matriz aplicável`
              : "Vínculos vigentes na filial"
          }
        />
        {data.snapshot.inspections && (
          <Metric
            icon={<Activity size={19} />}
            label="Ativos cadastrados"
            value={String(data.snapshot.inspections.registeredAssets)}
            detail={`${data.snapshot.inspections.periodicAssets} exigem inspeção periódica`}
          />
        )}
      </section>
      <div className="branch-dashboard__primary">
        <ActivityPanel
          data={data}
          domain={activeDomain}
          setDomain={(activityDomain) => setSearch({ activityDomain })}
        />
        <aside className="branch-dashboard__priorities">
          <header>
            <div>
              <h2>Prioridades</h2>
              <p>Risco presente e próximas intervenções.</p>
            </div>
            <span>{data.priorities.length}</span>
          </header>
          {data.priorities.length ? (
            <div className="branch-priority-list">
              {data.priorities.map((item) => (
                <PriorityItem
                  key={item.id}
                  item={item}
                  companyId={companyId}
                  branchId={branchId}
                  actionable={Boolean(session)}
                />
              ))}
            </div>
          ) : (
            <div className="branch-dashboard__empty compact">
              <ClipboardCheck size={22} />
              <strong>Nenhuma prioridade atual</strong>
              <span>Os sinais monitorados estão em ordem.</span>
            </div>
          )}
        </aside>
      </div>
      <section className="branch-dashboard__details-heading">
        <div>
          <h2>Detalhes por domínio</h2>
          <p>
            Listas paginadas com cinco registros por vez, sem ocultar conteúdo
            em scroll interno.
          </p>
        </div>
        <span>
          <CalendarRange size={16} />{" "}
          {search.periodDays === 180
            ? "6 meses"
            : search.periodDays === 365
              ? "12 meses"
              : `${search.periodDays} dias`}
        </span>
      </section>
      <div className="branch-dashboard__modules">
        {data.modules.training && (
          <ModuleDetails
            domain="training"
            summary={data.modules.training}
            page={search.trainingPage}
            setPage={(trainingPage) => setSearch({ trainingPage })}
            companyId={companyId}
            branchId={branchId}
            periodDays={search.periodDays}
            actionable={Boolean(session)}
          />
        )}
        {data.modules.inspections && (
          <>
            <div className="branch-dashboard__category">
              <label>
                <span>Categoria de equipamento</span>
                <Select
                  aria-label="Categoria de equipamento"
                  value={search.categoryId ?? ""}
                  onChange={(event) =>
                    setSearch({
                      categoryId: event.target.value || undefined,
                      inspectionsPage: 1,
                    })
                  }
                >
                  <option value="">Todas as categorias</option>
                  {data.categories.map((category) => (
                    <option value={category.id} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </label>
              <small>
                Filtra somente o retrato atual de ativos e inspeções.
              </small>
            </div>
            <ModuleDetails
              domain="inspections"
              summary={data.modules.inspections}
              page={search.inspectionsPage}
              setPage={(inspectionsPage) => setSearch({ inspectionsPage })}
              companyId={companyId}
              branchId={branchId}
              periodDays={search.periodDays}
              categoryId={search.categoryId}
              actionable={Boolean(session)}
            />
          </>
        )}
        {data.modules.apr && (
          <ModuleDetails
            domain="apr"
            summary={data.modules.apr}
            page={search.aprPage}
            setPage={(aprPage) => setSearch({ aprPage })}
            companyId={companyId}
            branchId={branchId}
            periodDays={search.periodDays}
            actionable={Boolean(session)}
          />
        )}
      </div>
      {session && (
        <section className="branch-dashboard__quick">
          <header>
            <div>
              <h2>Acessos rápidos</h2>
              <p>Continue a operação nos módulos liberados para sua função.</p>
            </div>
          </header>
          <div>
            {entries.map(({ code, name, description, Icon }) =>
              code === "people" ? (
                <Link
                  key={code}
                  to="/workspace/$companyId/$branchId/people"
                  params={{ companyId, branchId }}
                  search={{
                    tab: undefined,
                    page: 1,
                    q: "",
                    action: undefined,
                    id: undefined,
                    periodDays: search.periodDays,
                  }}
                >
                  <Icon size={18} />
                  <span>
                    <strong>{name}</strong>
                    <small>{description}</small>
                  </span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  key={code}
                  to="/workspace/$companyId/$branchId/$moduleCode"
                  params={{ companyId, branchId, moduleCode: code }}
                  search={{
                    tab: undefined,
                    page: 1,
                    q: "",
                    action: undefined,
                    id: undefined,
                    periodDays: search.periodDays,
                  }}
                >
                  <Icon size={18} />
                  <span>
                    <strong>{name}</strong>
                    <small>{description}</small>
                  </span>
                  <ArrowRight size={16} />
                </Link>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export function BranchHomePage() {
  const { companyId, branchId } = branchRoute.useParams();
  const { data: session } = useSuspenseQuery(sessionQueryOptions);
  if (session.kind === "platform")
    return (
      <div className="workspace company-dashboard">
        <Link
          className="back-link"
          to="/platform/companies/$companyId"
          params={{ companyId }}
        >
          <ArrowLeft size={17} /> Voltar à empresa
        </Link>
        <DashboardContent companyId={companyId} branchId={branchId} />
      </div>
    );
  const branch = session.context.branches.find((item) => item.id === branchId);
  if (!branch) return null;
  return (
    <CompanyWorkspaceShell
      session={session}
      branch={branch}
      home
      title={branch.name}
      description={`Operação de ${branch.name} · ${session.context.company.name}`}
      areas={[]}
      currentArea=""
      onAreaChange={() => undefined}
    >
      <DashboardContent
        companyId={companyId}
        branchId={branchId}
        session={session}
        branch={branch}
      />
    </CompanyWorkspaceShell>
  );
}
