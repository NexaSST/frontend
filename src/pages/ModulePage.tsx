import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { CompanyWorkspaceShell } from "../components/CompanyWorkspaceShell.js";
import { InspectionsModule } from "../features/inspections/InspectionsModule.js";
import { TrainingModule } from "../features/training/TrainingModule.js";
import { AprModule } from "../features/apr/AprModule.js";
import { ConfinedSpacesModule } from "../features/confined-spaces/ConfinedSpacesModule.js";
import { ModuleTabs } from "../features/shared.js";
import { sessionQueryOptions } from "../lib/session.js";
import { moduleRoute } from "../router.js";

const labels: Record<string, string> = {
  inspections: "Ativos e inspeções",
  training: "Treinamentos",
  apr: "APR / PT",
  confined_spaces: "Inventário de Espaços Confinados",
};

export function ModulePage() {
  const params = useParams({
    from: "/_authenticated/workspace/$companyId/$branchId/$moduleCode",
  });
  const search = moduleRoute.useSearch();
  const navigate = useNavigate({ from: moduleRoute.fullPath });
  const { data: session } = useSuspenseQuery(sessionQueryOptions);
  if (session.kind !== "company") return null;
  const branch = session.context.branches.find(
    (item) => item.id === params.branchId,
  );
  const permissions =
    branch?.modules.find((item) => item.code === params.moduleCode)
      ?.permissions ?? [];
  const canOperate = permissions.some((permission) => permission !== 'analytics.view');
  const aprArea: 'apr' | 'pt' = search.area ?? (search.tab === 'work-permits' || search.tab === 'pt-reports' ? 'pt' : 'apr');
  const tabs = !canOperate ? [{ id: 'overview', label: 'Visão geral' }] :
    params.moduleCode === "inspections"
      ? [
          { id: "overview", label: "Visão geral" },
          { id: "types", label: "Equipamentos" },
          { id: "categories", label: "Categorias" },
          ...(permissions.includes("template.publish")
            ? [{ id: "templates", label: "Checklists" }]
            : []),
          { id: "assets", label: "Ativos" },
          { id: "history", label: "Inspeções" },
          ...(permissions.includes("inspection.review") ? [{ id: "action-plans", label: "Planos de ação" }] : []),
        ]
      : params.moduleCode === "training"
        ? [
            { id: "overview", label: "Visão geral" },
            { id: "frequencies", label: "Frequências" },
            { id: "courses", label: "Cursos" },
            ...(permissions.includes("training.matrix.publish")
              ? [{ id: "matrices", label: "Matriz" }]
              : []),
            { id: "events", label: "Turmas" },
            { id: "expirations", label: "Vencimentos" },
          ]
        : params.moduleCode === "apr" ? aprArea === 'pt' ? [
            { id: "overview", label: "Visão geral" },
            { id: "work-permits", label: "Permissões de Trabalho" },
            { id: "pt-reports", label: "Relatórios" },
          ] : [
            { id: "overview", label: "Visão geral" },
            { id: "documents", label: "APRs" },
            { id: "activities", label: "Atividades" },
            ...(permissions.includes("template.publish") ? [{ id: "templates", label: "Templates" }] : []),
            { id: "apr-reports", label: "Relatórios" },
          ] : [
            { id: "overview", label: "Visão geral" },
            { id: "spaces", label: "Espaços" },
            { id: "rescue-plans", label: "Planos de resgate" },
            ...(permissions.includes("confined_spaces.approve") ? [{ id: "technical-responsibles", label: "Responsáveis técnicos" }, { id: "publications", label: "Publicação QR" }] : []),
          ];
  const currentTab = tabs.some((tab) => tab.id === search.tab)
    ? search.tab!
    : "overview";
  const setSearch = (patch: Partial<typeof search>) =>
    navigate({ search: (previous) => ({ ...previous, ...patch }) });
  const scope = { companyId: params.companyId, branchId: params.branchId };
  if (!branch) return null;
  return (
      <CompanyWorkspaceShell session={session} branch={branch} moduleCode={params.moduleCode} title={params.moduleCode === "apr" ? aprArea === 'pt' ? "Permissões de Trabalho" : "APRs" : labels[params.moduleCode] ?? params.moduleCode} description={`Operação de ${branch.name} · ${session.context.company.name}`} areas={tabs} currentArea={currentTab} onAreaChange={(tab) => setSearch({ tab, page: 1, q: "", nr: undefined, action: undefined, id: undefined })}>
      <ModuleTabs tabs={tabs} current={currentTab} onChange={(tab) => setSearch({ tab, page: 1, q: "", nr: undefined, action: undefined, id: undefined })} />
      {params.moduleCode === "inspections" && (
        <InspectionsModule
          scope={scope}
          tab={currentTab}
          search={search}
          permissions={permissions}
          setSearch={setSearch}
        />
      )}
      {params.moduleCode === "training" && (
        <TrainingModule
          scope={scope}
          tab={currentTab}
          search={search}
          permissions={permissions}
          setSearch={setSearch}
        />
      )}
      {params.moduleCode === "apr" && (
        <AprModule
          scope={scope}
          tab={currentTab}
          search={search}
          area={aprArea}
          permissions={permissions}
          setSearch={setSearch}
        />
      )}
      {params.moduleCode === "confined_spaces" && (
        <ConfinedSpacesModule
          scope={scope}
          tab={currentTab}
          search={search}
          permissions={permissions}
          setSearch={setSearch}
        />
      )}
    </CompanyWorkspaceShell>
  );
}
