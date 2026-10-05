import { cx } from './ui/utils.js';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { Building2, ChevronRight, ClipboardCheck, GraduationCap, Home, Menu, Network, ScrollText, ShieldCheck, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { BranchContext, CompanySession } from '../lib/session.js';
import { Button, Select } from './ui/index.js';

const moduleIcons = { inspections: ClipboardCheck, training: GraduationCap, apr: ScrollText, confined_spaces: ShieldCheck } as const;

export interface WorkspaceArea { id: string; label: string }

export function CompanyWorkspaceShell({ session, branch, moduleCode, home = false, title, description, areas, currentArea, onAreaChange, children }: {
  session: CompanySession;
  branch: BranchContext;
  moduleCode?: string;
  home?: boolean;
  title: string;
  description: string;
  areas: WorkspaceArea[];
  currentArea: string;
  onAreaChange: (area: string) => void;
  children: ReactNode;
}) {
  void onAreaChange;
  const navigate = useNavigate();
  const routeSearch = useSearch({ strict: false }) as { periodDays?: 30 | 90 | 180 | 365; tab?: string; area?: 'apr' | 'pt' };
  const [drawerOpen, setDrawerOpen] = useState(false);
  const canChangeBranch = session.context.roles.some((role) => role.code === 'company_admin' && role.branchId === null);
  void areas;
  void currentArea;
  const changeBranch = async (branchId: string) => {
    const target = session.context.branches.find((item) => item.id === branchId);
    if (!target) return;
    setDrawerOpen(false);
    if (moduleCode && target.modules.some((module) => module.code === moduleCode)) {
      await navigate({ to: '/workspace/$companyId/$branchId/$moduleCode', params: { companyId: session.companyId, branchId, moduleCode }, search: { tab: moduleCode === 'apr' ? 'overview' : undefined, area: moduleCode === 'apr' ? routeSearch.area ?? (routeSearch.tab === 'work-permits' || routeSearch.tab === 'pt-reports' ? 'pt' : 'apr') : undefined, page: 1, q: '', action: undefined, id: undefined, periodDays: routeSearch.periodDays ?? 30 } });
      return;
    }
    await navigate({ to: '/workspace/$companyId/$branchId', params: { companyId: session.companyId, branchId }, search: {
      periodDays: routeSearch.periodDays ?? 30, categoryId: undefined, activityDomain: undefined,
      trainingPage: 1, inspectionsPage: 1, aprPage: 1,
    } });
  };
  const nav = <>
    <Link className={"flex items-center gap-[0.65rem] min-h-[2.65rem] p-[0.65rem_0.75rem] rounded-[0.65rem] text-muted no-underline text-[0.86rem] font-bold [&:hover]:text-ink [&:hover]:bg-[#e9eeea]"} to="/app" search={{ branchId: undefined, periodDays: undefined }}><Building2 size={17} /> Todas as filiais</Link>
    <label className={"grid gap-[0.4rem] m-[1rem_0_1.35rem] p-[0_0.5rem] text-muted text-[0.72rem] font-extrabold uppercase tracking-[0.045em]"}><span>Filial atual</span><Select value={branch.id} disabled={!canChangeBranch} onChange={(event) => void changeBranch(event.target.value)}>{session.context.branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></label>
    <Link className={(cx("flex items-center gap-[0.65rem] min-h-[2.65rem] p-[0.65rem_0.75rem] rounded-[0.65rem] text-muted no-underline text-[0.86rem] font-bold [&:hover]:text-ink [&:hover]:bg-[#e9eeea] [&.active]:text-white [&.active]:bg-accent", home ? "active" : ""))} to="/workspace/$companyId/$branchId" params={{ companyId: session.companyId, branchId: branch.id }} search={{ periodDays: routeSearch.periodDays ?? 30, categoryId: undefined, activityDomain: undefined, trainingPage: 1, inspectionsPage: 1, aprPage: 1 }} onClick={() => setDrawerOpen(false)}><Home size={18} /><span>Início da filial</span></Link>
    {branch.foundationPermissions.some((permission) => permission === 'person.manage' || permission === 'analytics.view') && <div className={"grid gap-1 mt-[1.2rem]"}>
      <span className={"p-[0_0.75rem_0.35rem] text-[#728079] text-[0.68rem] font-[850] tracking-[0.075em] uppercase"}>Gestão</span>
      <Link className={(cx("flex items-center gap-[0.65rem] min-h-[2.65rem] p-[0.65rem_0.75rem] rounded-[0.65rem] text-muted no-underline text-[0.86rem] font-bold [&:hover]:text-ink [&:hover]:bg-[#e9eeea] [&.active]:text-white [&.active]:bg-accent", !moduleCode && !home ? "active" : ""))} to="/workspace/$companyId/$branchId/people" params={{ companyId: session.companyId, branchId: branch.id }} search={{ tab: undefined, page: 1, q: '', action: undefined, id: undefined, periodDays: routeSearch.periodDays ?? 30 }} onClick={() => setDrawerOpen(false)}><Network size={18} /><span>Pessoas e estrutura</span></Link>
    </div>}
    <div className={"grid gap-1 mt-[1.2rem]"}>
      <span className={"p-[0_0.75rem_0.35rem] text-[#728079] text-[0.68rem] font-[850] tracking-[0.075em] uppercase"}>Módulos contratados</span>
      {branch.modules.map((module) => {
        if (module.code === 'apr') return <div className={""} key={module.code}>
          <Link className={(cx("flex items-center gap-[0.65rem] min-h-[2.65rem] p-[0.65rem_0.75rem] rounded-[0.65rem] text-muted no-underline text-[0.86rem] font-bold [&:hover]:text-ink [&:hover]:bg-[#e9eeea] [&.active]:text-white [&.active]:bg-accent", moduleCode === 'apr' && routeSearch.area !== 'pt' && routeSearch.tab !== 'work-permits' && routeSearch.tab !== 'pt-reports' ? "active" : ""))} to="/workspace/$companyId/$branchId/$moduleCode" params={{ companyId: session.companyId, branchId: branch.id, moduleCode: 'apr' }} search={{ area: 'apr', tab: 'overview', page: 1, q: '', action: undefined, id: undefined, periodDays: routeSearch.periodDays ?? 30 }} onClick={() => setDrawerOpen(false)}><ScrollText size={18} /><span>APRs</span></Link>
          <Link className={(cx("flex items-center gap-[0.65rem] min-h-[2.65rem] p-[0.65rem_0.75rem] rounded-[0.65rem] text-muted no-underline text-[0.86rem] font-bold [&:hover]:text-ink [&:hover]:bg-[#e9eeea] [&.active]:text-white [&.active]:bg-accent", moduleCode === 'apr' && (routeSearch.area === 'pt' || routeSearch.tab === 'work-permits' || routeSearch.tab === 'pt-reports') ? "active" : ""))} to="/workspace/$companyId/$branchId/$moduleCode" params={{ companyId: session.companyId, branchId: branch.id, moduleCode: 'apr' }} search={{ area: 'pt', tab: 'overview', page: 1, q: '', action: undefined, id: undefined, periodDays: routeSearch.periodDays ?? 30 }} onClick={() => setDrawerOpen(false)}><ClipboardCheck size={18} /><span>Permissões de trabalho</span></Link>
        </div>;
        const Icon = moduleIcons[module.code as keyof typeof moduleIcons] ?? ClipboardCheck;
        const active = module.code === moduleCode;
        return <div className={""} key={module.code}><Link className={(cx("flex items-center gap-[0.65rem] min-h-[2.65rem] p-[0.65rem_0.75rem] rounded-[0.65rem] text-muted no-underline text-[0.86rem] font-bold [&:hover]:text-ink [&:hover]:bg-[#e9eeea] [&.active]:text-white [&.active]:bg-accent", active ? "active" : ""))} to="/workspace/$companyId/$branchId/$moduleCode" params={{ companyId: session.companyId, branchId: branch.id, moduleCode: module.code }} search={{ tab: undefined, page: 1, q: '', action: undefined, id: undefined, periodDays: routeSearch.periodDays ?? 30 }} onClick={() => setDrawerOpen(false)}><Icon size={18} /><span>{module.name}</span></Link></div>;
      })}
    </div>
  </>;
  return <div className={(cx("grid grid-cols-[17rem_minmax(0,1fr)] min-h-[calc(100vh-4.5rem)] m-[0_auto] max-[800px]:block max-[800px]:min-h-auto max-[800px]:p-[1rem_0_4rem]", moduleCode === 'apr' && (routeSearch.area === 'pt' || routeSearch.tab === 'work-permits' || routeSearch.tab === 'pt-reports') ? "w-[min(96vw,180rem)] max-[800px]:w-[94vw]" : "w-[min(96vw,100rem)] max-[800px]:w-[min(94vw,82rem)]"))}>
    <Button className={"hidden max-[800px]:inline-flex max-[800px]:mb-4"} variant="secondary" onClick={() => setDrawerOpen(true)}><Menu size={18} /> Navegação</Button>
    <aside className={(cx("sticky top-18 [align-self:start] h-[calc(100vh-4.5rem)] p-[1.25rem_1rem_2rem_0] overflow-y-auto border-r border-solid border-r-line max-[800px]:fixed max-[800px]:z-80 max-[800px]:top-0 max-[800px]:left-0 max-[800px]:w-[min(20rem,88vw)] max-[800px]:h-screen max-[800px]:p-4 max-[800px]:invisible max-[800px]:pointer-events-none max-[800px]:transform-[translateX(-105%)] max-[800px]:border-r max-[800px]:border-solid max-[800px]:border-r-line max-[800px]:bg-surface max-[800px]:shadow-panel max-[800px]:[transition:transform_180ms_ease] max-[800px]:[&.open]:visible max-[800px]:[&.open]:pointer-events-auto max-[800px]:[&.open]:transform-[translateX(0)]", drawerOpen ? "open" : ""))}><div className={"hidden max-[800px]:flex max-[800px]:items-center max-[800px]:justify-between max-[800px]:mb-3"}><strong>Navegação</strong><Button variant="ghost" size="icon" aria-label="Fechar navegação" onClick={() => setDrawerOpen(false)}><X size={19} /></Button></div>{nav}</aside>
    {drawerOpen && <button className={"hidden max-[800px]:fixed max-[800px]:z-70 max-[800px]:inset-0 max-[800px]:block max-[800px]:border-0 max-[800px]:bg-[rgb(19_33_29/45%)]"} aria-label="Fechar navegação" onClick={() => setDrawerOpen(false)} />}
    <main className={"min-w-0 p-[1.8rem_0_5rem_2.25rem] max-[800px]:p-0"}>
      {!home && <><nav className={"flex items-center gap-[0.35rem] mb-[1.35rem] text-muted text-[0.76rem] [&_a]:text-accent-strong [&_a]:no-underline max-[800px]:overflow-hidden max-[800px]:whitespace-nowrap max-[800px]:[&_span]:overflow-hidden max-[800px]:[&_span]:text-ellipsis max-[800px]:[&_a]:overflow-hidden max-[800px]:[&_a]:text-ellipsis"} aria-label="Caminho"><Link to="/app" search={{ branchId: undefined, periodDays: undefined }}>{session.context.company.name}</Link><ChevronRight size={14} /><span>{branch.name}</span></nav>
        <header className={"mb-6 [&_h1]:max-w-none [&_h1]:m-[0.2rem_0_0.45rem] [&_h1]:text-[clamp(1.8rem,3vw,2.75rem)] [&_p]:max-w-[66ch] [&_p]:m-0 [&_p]:text-muted [&_p]:leading-[1.55]"}><div><h1>{title}</h1><p>{description}</p></div></header></>}
      {children}
    </main>
  </div>;
}
