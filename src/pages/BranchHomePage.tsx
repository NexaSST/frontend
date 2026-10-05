import { cx } from '../components/ui/utils.js';
import { BranchModuleStart, moduleStart } from '../components/BranchModuleStart.js';
import { OperationalChart } from '../components/OperationalChart.js';
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

const branchDashboardMetricClasses = {
  "neutral": "",
  "success": "[&_strong]:text-accent",
  "warning": "[&_strong]:text-[#8a6110]",
  "danger": "[&_strong]:text-danger",
};

const branchPrioritySignalClasses = {
  "danger": "bg-[#ef9b91]",
  "warning": "bg-[#f0c45e]",
  "info": "bg-[#b4d6e3]",
};

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
      className={cx("grid grid-cols-[auto_minmax(0,1fr)] gap-[.75rem] min-w-0 p-[1rem_1.1rem] border-l border-solid border-l-line first:border-l-0 [&_>_span]:grid [&_>_span]:place-items-center [&_>_span]:w-[2.1rem] [&_>_span]:h-[2.1rem] [&_>_span]:rounded-[.65rem] [&_>_span]:text-accent-strong [&_>_span]:bg-[#e6eee9] [&_small]:block [&_small]:min-h-[2.1em] [&_small]:text-muted [&_small]:text-[.72rem] [&_small]:font-extrabold [&_small]:leading-[1.15] [&_strong]:block [&_strong]:m-[.12rem_0_.2rem] [&_strong]:text-[1.85rem] [&_strong]:leading-none [&_strong]:tracking-[-.03em] [&_strong]:tabular-nums [&_p]:overflow-hidden [&_p]:text-muted [&_p]:text-[.7rem] [&_p]:leading-[1.35] [&_p]:text-ellipsis max-[520px]:border-0 max-[520px]:border-t max-[520px]:border-solid max-[520px]:border-t-line max-[520px]:first:border-t-0 max-[520px]:[&_small]:text-[.875rem] max-[520px]:[&_p]:text-[.875rem]", branchDashboardMetricClasses[tone])}
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
        className={cx("grid place-items-center w-[1.9rem] h-[1.9rem] rounded-[.55rem] text-[#13251f]", branchPrioritySignalClasses[item.severity])}
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
      className={"branch-priority grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[.7rem] min-h-15 p-[.7rem_1rem] text-inherit border-t border-solid border-t-[rgb(255_255_255/11%)] no-underline [&:hover]:bg-[rgb(255_255_255/6%)] focus-visible:[outline:3px_solid_#78bda2] focus-visible:outline-offset-[-3px] [&_>_span:nth-child(2)]:min-w-0 [&_strong]:block [&_strong]:text-[.78rem] [&_small]:block [&_small]:mt-[.16rem] [&_small]:text-[#bfd0c8] [&_small]:text-[.68rem] [&_small]:leading-[1.35] max-[520px]:[&_small]:text-[.875rem]"}
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
    <div className={"branch-priority grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[.7rem] min-h-15 p-[.7rem_1rem] text-inherit border-t border-solid border-t-[rgb(255_255_255/11%)] no-underline [&:hover]:bg-[rgb(255_255_255/6%)] focus-visible:[outline:3px_solid_#78bda2] focus-visible:outline-offset-[-3px] [&_>_span:nth-child(2)]:min-w-0 [&_strong]:block [&_strong]:text-[.78rem] [&_small]:block [&_small]:mt-[.16rem] [&_small]:text-[#bfd0c8] [&_small]:text-[.68rem] [&_small]:leading-[1.35] max-[520px]:[&_small]:text-[.875rem] [&_>_svg]:opacity-[.35]"}>{body}</div>
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
  return (
    <section className={"min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel min-h-0 p-5 [&_>_header]:flex [&_>_header]:items-start [&_>_header]:justify-between [&_>_header]:gap-4 [&_>_header]:flex-col [&_header_p]:mt-[.3rem] [&_header_p]:text-muted [&_header_p]:text-[.78rem] [&_header_p]:leading-[1.45] max-[520px]:min-h-88 max-[520px]:p-4 max-[520px]:[&_>_header]:items-start max-[520px]:[&_>_header]:flex-col max-[520px]:[&_header_p]:text-[.875rem] [&_.domain-switcher]:w-full [&_.domain-switcher]:flex-nowrap [&_.domain-switcher]:justify-start [&_.domain-switcher]:overflow-x-auto [&_.domain-switcher_button]:flex-[1_0_auto] [&_.domain-switcher_button]:min-h-11 [&_.domain-switcher_button]:whitespace-nowrap [&_.domain-switcher_button]:text-[.875rem] [&_.activity-legend]:justify-start [&_.activity-legend]:flex-wrap [&_.activity-legend]:mt-4"}>
      <header>
        <div>
          <h2>Atividade no período</h2>
          <p>
            Conclusões e ocorrências registradas no período selecionado.
          </p>
        </div>
        <div
          className={"domain-switcher flex flex-wrap justify-end gap-[.25rem] p-[.2rem] rounded-[.65rem] bg-canvas [&_button]:min-h-8 [&_button]:p-[0_.65rem] [&_button]:border-0 [&_button]:rounded-[.5rem] [&_button]:text-muted [&_button]:bg-transparent [&_button]:font-[inherit] [&_button]:text-[.7rem] [&_button]:font-extrabold [&_button]:cursor-pointer [&_button:hover]:text-ink [&_button.active]:text-white [&_button.active]:bg-accent [&_button:focus-visible]:[outline:3px_solid_color-mix(in_srgb,var(--color-accent)_28%,transparent)] [&_button:focus-visible]:outline-offset-2 max-[520px]:justify-start max-[520px]:w-full max-[520px]:[&_button]:min-h-11 max-[520px]:[&_button]:p-[.6rem_.75rem] max-[520px]:[&_button]:text-[.875rem]"}
          role="group"
          aria-label="Domínio da atividade"
        >
          {available.map((item) => (
            <button
              type="button"
              key={item}
              className={(item === domain ? "active" : "")}
              aria-pressed={item === domain}
              onClick={() => setDomain(item)}
            >
              {moduleMeta[item].label}
            </button>
          ))}
        </div>
      </header>
      <div className={"activity-legend flex justify-end gap-4 m-[1rem_0_0.5rem] text-muted text-[0.72rem] [&_span]:inline-flex [&_span]:items-center [&_span]:gap-[0.35rem] [&_i]:w-[0.6rem] [&_i]:h-[0.6rem] [&_i]:rounded-[0.2rem] [&_.completed]:bg-accent [&_.findings]:bg-[#d89830] max-[520px]:justify-start max-[520px]:flex-wrap"}>
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
        <OperationalChart label={`Atividade de ${moduleMeta[domain].label}`} data={data.activity.map((point) => ({ ...point }))} series={series.map((item) => ({ key: item.key, label: item.label }))} />
      ) : (
        <div className={"branch-dashboard__empty grid place-items-center gap-[.35rem] min-h-60 text-muted text-center [&.compact]:min-h-28 [&.compact]:p-4 [&_strong]:text-inherit [&_strong]:text-[.84rem] [&_span]:max-w-[45ch] [&_span]:text-[.72rem] max-[520px]:[&_span]:text-[.875rem]"}>
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
  permissions,
  headerControls,
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
  permissions: string[];
  headerControls?: ReactNode;
}) {
  const priorities = useQuery({
    queryKey: [
      "",
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
  const start = moduleStart(domain, summary, Boolean(categoryId));
  const canStart = start && permissions.includes(start.permission);
  const Icon = meta.Icon;
  return (
    <section className={String.raw`min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel overflow-hidden [&_>_header]:flex [&_>_header]:items-center [&_>_header]:justify-start [&_>_header]:gap-4 [&_>_header]:p-[1.1rem_1.15rem_.85rem] [&_>_header]:flex-wrap [&_header_p]:mt-[.3rem] [&_header_p]:text-muted [&_header_p]:text-[.78rem] [&_header_p]:leading-[1.45] [&_.branch-priority]:text-ink [&_.branch-priority]:border-t-line [&_.branch-priority:hover]:bg-[#f6f7f2] [&_.branch-priority_small]:text-muted [&_>_header_>_span]:grid [&_>_header_>_span]:place-items-center [&_>_header_>_span]:w-[2.1rem] [&_>_header_>_span]:h-[2.1rem] [&_>_header_>_span]:rounded-[.6rem] [&_>_header_>_span]:text-accent-strong [&_>_header_>_span]:bg-[#e6eee9] [&_>_header_>_span]:shrink-0 [&_dl]:grid [&_dl]:grid-cols-5 [&_dl]:m-0 [&_dl]:border-t [&_dl]:border-solid [&_dl]:border-t-line [&_dl]:border-b [&_dl]:border-solid [&_dl]:border-b-line [&_dl_div]:min-w-0 [&_dl_div]:p-[.8rem_1rem] [&_dl_div]:border-l [&_dl_div]:border-solid [&_dl_div]:border-l-line [&_dl_div:first-child]:border-l-0 [&_dt]:min-h-[2.1em] [&_dt]:text-muted [&_dt]:text-[.68rem] [&_dt]:font-extrabold [&_dt]:leading-[1.2] [&_dd]:m-[.25rem_0_0] [&_dd]:text-[1.25rem] [&_dd]:font-black [&_dd]:tabular-nums [&_.pagination]:p-[.8rem_1rem] [&_.pagination]:border-t [&_.pagination]:border-solid [&_.pagination]:border-t-line max-[800px]:[&_dl]:grid-cols-3 max-[800px]:[&_dl_div:nth-child(4)]:border-l-0 max-[800px]:[&_dl_div:nth-child(4)]:border-t max-[800px]:[&_dl_div:nth-child(4)]:border-solid max-[800px]:[&_dl_div:nth-child(4)]:border-t-line max-[800px]:[&_dl_div:nth-child(5)]:border-t max-[800px]:[&_dl_div:nth-child(5)]:border-solid max-[800px]:[&_dl_div:nth-child(5)]:border-t-line max-[520px]:[&_header_p]:text-[.875rem] max-[520px]:[&_dl]:grid-cols-2 max-[520px]:[&_dl_div]:border-l-0 max-[520px]:[&_dl_div]:border-t max-[520px]:[&_dl_div]:border-solid max-[520px]:[&_dl_div]:border-t-line max-[520px]:[&_dl_div:nth-child(4)]:border-l-0 max-[520px]:[&_dl_div:nth-child(4)]:border-t max-[520px]:[&_dl_div:nth-child(4)]:border-solid max-[520px]:[&_dl_div:nth-child(4)]:border-t-line max-[520px]:[&_dl_div:nth-child(5)]:border-l-0 max-[520px]:[&_dl_div:nth-child(5)]:border-t max-[520px]:[&_dl_div:nth-child(5)]:border-solid max-[520px]:[&_dl_div:nth-child(5)]:border-t-line max-[520px]:[&_dl_div:nth-child(even)]:border-l max-[520px]:[&_dl_div:nth-child(even)]:border-solid max-[520px]:[&_dl_div:nth-child(even)]:border-l-line max-[520px]:[&_dl_div:first-child]:border-t-0 max-[520px]:[&_dl_div:nth-child(2)]:border-t-0 [&_.branch-dashboard\_\_empty.compact]:min-h-0 [&_.branch-dashboard\_\_empty.compact]:flex [&_.branch-dashboard\_\_empty.compact]:items-center [&_.branch-dashboard\_\_empty.compact]:justify-between [&_.branch-dashboard\_\_empty.compact]:flex-wrap [&_.branch-dashboard\_\_empty.compact]:gap-[.75rem] [&_.branch-dashboard\_\_empty.compact]:text-left [&_.branch-dashboard\_\_empty.compact]:p-[1rem_1.15rem] [&_.branch-dashboard\_\_empty.compact_>_svg]:hidden [&_.branch-dashboard\_\_empty.compact_>_span]:basis-full [&_.branch-dashboard\_\_empty.compact_>_span]:max-w-[68ch] [&_.branch-dashboard\_\_empty.compact_>_span]:leading-normal [&_.branch-dashboard\_\_empty.compact_>_a]:shrink-0 [&_.branch-dashboard\_\_empty.compact_>_a]:no-underline max-[520px]:[&_.branch-dashboard\_\_empty.compact_>_a]:w-full max-[520px]:[&_.branch-dashboard\_\_empty.compact_>_a]:min-h-11 [&_>_header_>_div]:flex-[1_1_18rem]`}>
      <header>
        <span>
          <Icon size={20} />
        </span>
        <div>
          <h2>{meta.label}</h2>
          <p>Resumo atual e prioridades que exigem acompanhamento.</p>
        </div>
        {headerControls}
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
        <div className={"branch-dashboard__empty grid place-items-center gap-[.35rem] min-h-60 text-muted text-center [&.compact]:min-h-28 [&.compact]:p-4 [&_strong]:text-inherit [&_strong]:text-[.84rem] [&_span]:max-w-[45ch] [&_span]:text-[.72rem] max-[520px]:[&_span]:text-[.875rem] compact"}>
          <span>Carregando prioridades…</span>
        </div>
      ) : priorities.isError ? (
        <div className={"branch-dashboard__empty grid place-items-center gap-[.35rem] min-h-60 text-muted text-center [&.compact]:min-h-28 [&.compact]:p-4 [&_strong]:text-inherit [&_strong]:text-[.84rem] [&_span]:max-w-[45ch] [&_span]:text-[.72rem] max-[520px]:[&_span]:text-[.875rem] compact"}>
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
          <div className={"grid"}>
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
      ) : domain === 'inspections' && categoryId && (summary as InspectionSummary).registeredAssets === 0 ? (
        <div className={"branch-dashboard__empty grid place-items-center gap-[.35rem] min-h-60 text-muted text-center [&.compact]:min-h-28 [&.compact]:p-4 [&_strong]:text-inherit [&_strong]:text-[.84rem] [&_span]:max-w-[45ch] [&_span]:text-[.72rem] max-[520px]:[&_span]:text-[.875rem] compact"}>
          <strong>Nenhum ativo nesta categoria</strong>
          <Link className={"ui-button inline-flex items-center justify-center gap-2 rounded-control font-[inherit] font-[750] cursor-pointer [transition:background_140ms_ease,border-color_140ms_ease,color_140ms_ease,transform_140ms_ease] [&:active:not(:disabled)]:transform-[translateY(1px)] disabled:cursor-not-allowed disabled:opacity-50 [&.danger]:text-danger border border-solid border-line text-ink bg-white [&:hover:not(:disabled)]:border-[#9fb0a7] [&:hover:not(:disabled)]:bg-[#f4f6f2] min-h-[2.4rem] p-[0.5rem_0.7rem] text-[0.8rem]"} to="/workspace/$companyId/$branchId"
            params={{ companyId, branchId }} search={(previous) => ({ periodDays, categoryId: undefined, activityDomain: previous.activityDomain, trainingPage: previous.trainingPage ?? 1, inspectionsPage: 1, aprPage: previous.aprPage ?? 1 })}>
            Limpar filtro
          </Link>
        </div>
      ) : canStart ? (
        <BranchModuleStart start={start} companyId={companyId} branchId={branchId} domain={domain} />
      ) : (
        <div className={"branch-dashboard__empty grid place-items-center gap-[.35rem] min-h-60 text-muted text-center [&.compact]:min-h-28 [&.compact]:p-4 [&_strong]:text-inherit [&_strong]:text-[.84rem] [&_span]:max-w-[45ch] [&_span]:text-[.72rem] max-[520px]:[&_span]:text-[.875rem] compact"}>
          <ClipboardCheck size={22} />
          <strong>{domain === 'inspections' ? 'Nenhuma pendência identificada nos ativos acompanhados.' : domain === 'training' ? 'Nenhuma pendência identificada nas obrigações acompanhadas.' : 'Nenhuma pendência identificada nos documentos acompanhados.'}</strong>
          {permissions.length > 0 && <Link className={"ui-button inline-flex items-center justify-center gap-2 rounded-control font-[inherit] font-[750] cursor-pointer [transition:background_140ms_ease,border-color_140ms_ease,color_140ms_ease,transform_140ms_ease] [&:active:not(:disabled)]:transform-[translateY(1px)] disabled:cursor-not-allowed disabled:opacity-50 [&.danger]:text-danger border border-solid border-line text-ink bg-white [&:hover:not(:disabled)]:border-[#9fb0a7] [&:hover:not(:disabled)]:bg-[#f4f6f2] min-h-[2.4rem] p-[0.5rem_0.7rem] text-[0.8rem]"}
            to="/workspace/$companyId/$branchId/$moduleCode" params={{ companyId, branchId, moduleCode: domain }}
            search={{ tab: permissions.some((permission) => permission !== 'analytics.view') ? domain === 'inspections' ? 'assets' : domain === 'training' ? 'courses' : 'documents' : 'overview', page: 1, q: '', action: undefined, id: undefined, periodDays }}>
            {permissions.some((permission) => permission !== 'analytics.view') ? domain === 'inspections' ? 'Ver ativos' : domain === 'training' ? 'Ver treinamentos' : 'Ver APRs' : 'Ver visão geral'}<ArrowRight size={16} />
          </Link>}
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
      "",
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
  const activeDomain = search.activityDomain && domains.includes(search.activityDomain)
    ? search.activityDomain
    : (domains[0] ?? "inspections");
  if (dashboard.isPending)
    return (
      <div
        className={"grid gap-4 [&_div]:min-h-28 [&_div]:rounded-panel [&_div]:bg-[#e8e9e4] [&_div]:animate-[dashboard-pulse_1.2s_ease-in-out_infinite_alternate] [&_div:nth-child(2)]:min-h-100"}
        aria-label="Carregando dashboard da filial"
      >
        <div />
        <div />
        <div />
      </div>
    );
  if (dashboard.isError || !data)
    return (
      <section className={"min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel flex items-center gap-4 p-5 text-danger [&_div]:flex-1 [&_h2]:m-[0_0_0.25rem] [&_h2]:text-ink [&_p]:m-0 [&_p]:text-muted"}>
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
    <div className={"grid gap-4 [&_h2]:m-0 [&_h2]:text-[1.05rem] [&_h2]:tracking-[-0.015em] [&_p]:m-0"}>
      <section
        className={"grid grid-cols-[minmax(15rem,1fr)_minmax(11rem,.36fr)_auto_auto] items-end gap-[.8rem] p-[.9rem_1rem] border border-solid border-line rounded-panel bg-surface [&_>_div:first-child]:flex [&_>_div:first-child]:items-center [&_>_div:first-child]:gap-[.65rem] [&_>_div:first-child]:min-h-11 [&_>_div:first-child_>_svg]:text-accent [&_h1]:block [&_h1]:m-0 [&_h1]:text-[1.35rem] [&_h1]:leading-[1.1] [&_h1]:tracking-tight [&_small]:block [&_small]:mt-[.15rem] [&_small]:text-muted [&_small]:text-[.72rem] [&_label]:grid [&_label]:gap-[.35rem] [&_label]:text-muted [&_label]:text-[.72rem] [&_label]:font-extrabold max-[800px]:grid-cols-[1fr_1fr] max-[800px]:[&_>_div:first-child]:col-span-full max-[520px]:grid-cols-[minmax(0,1fr)_auto] max-[520px]:p-[.85rem] max-[520px]:[&_>_label]:col-span-full max-[520px]:[&_small]:text-[.875rem] max-[520px]:[&_label]:text-[.875rem]"}
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
          className={"flex items-center gap-[.45rem] min-h-11 text-muted text-[.72rem] tabular-nums max-[520px]:col-span-full max-[520px]:text-[.875rem]"}
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
        className={"grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] overflow-hidden border border-solid border-line rounded-panel bg-surface shadow-panel max-[520px]:grid-cols-[1fr]"}
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
      <div className={"grid grid-cols-[minmax(0,2fr)_minmax(19rem,1fr)] gap-4 items-start max-[800px]:grid-cols-[1fr]"}>
        {domains.length > 0 && <ActivityPanel
          data={data}
          domain={activeDomain}
          setDomain={(activityDomain) => setSearch({ activityDomain })}
        />}
        <aside className={(cx("min-w-0 border border-solid rounded-panel overflow-hidden [&_>_header]:flex [&_>_header]:items-center [&_>_header]:justify-between [&_>_header]:gap-4 [&_>_header]:p-[1.25rem_1.25rem_.75rem] [&_header_p]:mt-[.3rem] [&_header_p]:text-[.78rem] [&_header_p]:leading-[1.45] [&_>_header_>_span]:grid [&_>_header_>_span]:place-items-center [&_>_header_>_span]:min-w-[1.8rem] [&_>_header_>_span]:h-[1.8rem] [&_>_header_>_span]:p-[0_.4rem] [&_>_header_>_span]:rounded-[999px] [&_>_header_>_span]:text-[#173329] [&_>_header_>_span]:bg-[#d9eee4] [&_>_header_>_span]:text-[.72rem] [&_>_header_>_span]:font-black max-[520px]:[&_header_p]:text-[.875rem]", data.priorities.length ? String.raw`bg-[#13251f] shadow-[0_12px_30px_rgb(19_37_31/14%)] text-[#f5faf7] border-[#13251f] [&_header_p]:text-[#bfd0c8] [&_.branch-dashboard\_\_empty]:text-[#d5e0db]` : String.raw`text-ink bg-surface border-line shadow-panel [&_header_p]:text-muted [&_.branch-dashboard\_\_empty]:text-muted [&_.branch-dashboard\_\_empty]:min-h-0 [&_.branch-dashboard\_\_empty]:p-[.75rem_1.25rem_1.25rem] [&_.branch-dashboard\_\_empty]:text-left [&_.branch-dashboard\_\_empty]:justify-items-start [&_.branch-dashboard\_\_empty_>_svg]:hidden`))}>
          <header>
            <div>
              <h2>Prioridades</h2>
              <p>Pendências nos registros acompanhados.</p>
            </div>
            <span>{data.priorities.length}</span>
          </header>
          {data.priorities.length ? (
            <div className={"grid"}>
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
            <div className={"branch-dashboard__empty grid place-items-center gap-[.35rem] min-h-60 text-muted text-center [&.compact]:min-h-28 [&.compact]:p-4 [&_strong]:text-inherit [&_strong]:text-[.84rem] [&_span]:max-w-[45ch] [&_span]:text-[.72rem] max-[520px]:[&_span]:text-[.875rem] compact"}>
              <ClipboardCheck size={22} />
              <strong>Nenhuma prioridade atual</strong>
              <span>Nenhuma pendência identificada nos registros acompanhados.</span>
            </div>
          )}
        </aside>
      </div>
      <section className={"flex items-end justify-between gap-4 mt-4 p-[0_.15rem] [&_p]:mt-[.3rem] [&_p]:text-muted [&_p]:text-[.78rem] [&_p]:leading-[1.45] [&_>_span]:inline-flex [&_>_span]:items-center [&_>_span]:gap-[.4rem] [&_>_span]:flex-[0_0_auto] [&_>_span]:text-accent-strong [&_>_span]:text-[.72rem] [&_>_span]:font-[850] max-[520px]:items-start max-[520px]:flex-col max-[520px]:[&_p]:text-[.875rem] max-[520px]:[&_>_span]:text-[.875rem]"}>
        <div>
          <h2>Detalhes por domínio</h2>
          <p>
            Situação dos registros acompanhados e próximos passos por módulo.
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
      <div className={"grid gap-4"}>
        {domains.includes("training") && data.modules.training && (
          <ModuleDetails
            domain="training"
            permissions={branch?.modules.find((item) => item.code === "training")?.permissions ?? []}
            summary={data.modules.training}
            page={search.trainingPage}
            setPage={(trainingPage) => setSearch({ trainingPage })}
            companyId={companyId}
            branchId={branchId}
            periodDays={search.periodDays}
            actionable={Boolean(session)}
          />
        )}
        {domains.includes("inspections") && data.modules.inspections && (
          <>
            <ModuleDetails
              domain="inspections"
              permissions={branch?.modules.find((item) => item.code === "inspections")?.permissions ?? []}
              summary={data.modules.inspections}
              page={search.inspectionsPage}
              setPage={(inspectionsPage) => setSearch({ inspectionsPage })}
              companyId={companyId}
              branchId={branchId}
              periodDays={search.periodDays}
              categoryId={search.categoryId}
              headerControls={<label className={"grid gap-[.35rem] w-[min(100%,17rem)] ml-auto text-muted text-[.875rem] font-[750] max-[640px]:w-full max-[640px]:ml-0"}>
                <span>Categoria de equipamento</span>
                <Select aria-label="Categoria de equipamento" title="Filtra o retrato atual de ativos e inspeções" value={search.categoryId ?? ''}
                  onChange={(event) => setSearch({ categoryId: event.target.value || undefined, inspectionsPage: 1 })}>
                  <option value="">Todas as categorias</option>
                  {data.categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
                </Select>
              </label>}
              actionable={Boolean(session)}
            />
          </>
        )}
        {domains.includes("apr") && data.modules.apr && (
          <ModuleDetails
            domain="apr"
            permissions={branch?.modules.find((item) => item.code === "apr")?.permissions ?? []}
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

    </div>
  );
}

export function BranchHomePage() {
  const { companyId, branchId } = branchRoute.useParams();
  const { data: session } = useSuspenseQuery(sessionQueryOptions);
  if (session.kind === "platform")
    return (
      <div className={"workspace m-[0_auto] p-[3.5rem_0_5rem] max-[520px]:pt-8 w-[min(94vw,96rem)] [&_.page-heading]:mb-6 [&_.page-heading_h1]:max-w-none [&_.page-heading_h1]:text-[clamp(2.1rem,4vw,3.5rem)] max-[520px]:w-[min(92vw,96rem)]"}>
        <Link
          className={"back-link inline-flex items-center gap-[0.4rem] mb-8 text-accent-strong font-[720] underline-offset-[0.22em]"}
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
