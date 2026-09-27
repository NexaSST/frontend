import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { CompanyWorkspaceShell } from '../components/CompanyWorkspaceShell.js';
import { CatalogCard, People } from '../features/training/TrainingModule.js';
import { Departments } from '../features/people/Departments.js';
import { ModuleAnalytics } from '../features/analytics/ModuleAnalytics.js';
import { ModuleTabs, type ModuleSearch } from '../features/shared.js';
import { sessionQueryOptions } from '../lib/session.js';
import { peopleRoute } from '../router.js';

const managementAreas = [
  { id: 'overview', label: 'Visão geral' },
  { id: 'departments', label: 'Departamentos' },
  { id: 'jobs', label: 'Cargos' },
  { id: 'suppliers', label: 'Empresas prestadoras' },
  { id: 'people', label: 'Colaboradores' },
];

export function PeopleStructurePage() {
  const params = useParams({ from: '/_authenticated/workspace/$companyId/$branchId/people' });
  const search = peopleRoute.useSearch();
  const navigate = useNavigate({ from: peopleRoute.fullPath });
  const { data: session } = useSuspenseQuery(sessionQueryOptions);
  if (session.kind !== 'company') return null;
  const branch = session.context.branches.find((item) => item.id === params.branchId);
  if (!branch) return null;
  const areas = branch.foundationPermissions.includes('person.manage') ? managementAreas : managementAreas.slice(0, 1);
  const current = areas.some((area) => area.id === search.tab) ? search.tab! : 'overview';
  const setSearch = (patch: Partial<ModuleSearch>) => navigate({ search: (previous) => ({ ...previous, ...patch }) });
  const scope = { companyId: params.companyId, branchId: params.branchId };
  return <CompanyWorkspaceShell session={session} branch={branch} title="Gestão da empresa" description="Pessoas, vínculos e estrutura organizacional compartilhados pelos módulos desta filial." areas={areas} currentArea={current} onAreaChange={(tab) => void setSearch({ tab, page: 1, q: '', action: undefined, id: undefined })}>
    <ModuleTabs tabs={areas} current={current} onChange={(tab) => void setSearch({ tab, page: 1, q: '', action: undefined, id: undefined })} />
    {current === 'overview' && <ModuleAnalytics scope={scope} domain="people" periodDays={search.periodDays} onPeriodChange={(periodDays) => void setSearch({ periodDays })} onOpenAttention={(item) => void setSearch({ tab: 'people', page: 1, id: item.entityId })} />}
    {current === 'people' && <People scope={scope} search={search} permissions={branch.foundationPermissions} setSearch={(patch) => void setSearch(patch)} />}
    {current === 'departments' && <Departments scope={scope} search={search} setSearch={(patch) => void setSearch(patch)} />}
    {current === 'jobs' && <div className="catalog-grid single"><CatalogCard scope={scope} resource="job-functions" title="Cargos" detail="cbo" search={search} setSearch={(patch) => void setSearch(patch)} /></div>}
    {current === 'suppliers' && <div className="catalog-grid single"><CatalogCard scope={scope} resource="suppliers" title="Empresas prestadoras" detail="tax" search={search} setSearch={(patch) => void setSearch(patch)} /></div>}
  </CompanyWorkspaceShell>;
}
