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
    <Link className="workspace-home-link" to="/app" search={{ branchId: undefined, periodDays: undefined }}><Building2 size={17} /> Todas as filiais</Link>
    <label className="workspace-branch-picker"><span>Filial atual</span><Select value={branch.id} disabled={!canChangeBranch} onChange={(event) => void changeBranch(event.target.value)}>{session.context.branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></label>
    <Link className={`workspace-nav-item ${home ? 'active' : ''}`} to="/workspace/$companyId/$branchId" params={{ companyId: session.companyId, branchId: branch.id }} search={{ periodDays: routeSearch.periodDays ?? 30, categoryId: undefined, activityDomain: undefined, trainingPage: 1, inspectionsPage: 1, aprPage: 1 }} onClick={() => setDrawerOpen(false)}><Home size={18} /><span>Início da filial</span></Link>
    {branch.foundationPermissions.some((permission) => permission === 'person.manage' || permission === 'analytics.view') && <div className="workspace-nav-group">
      <span className="workspace-nav-label">Gestão</span>
      <Link className={`workspace-nav-item ${!moduleCode && !home ? 'active' : ''}`} to="/workspace/$companyId/$branchId/people" params={{ companyId: session.companyId, branchId: branch.id }} search={{ tab: undefined, page: 1, q: '', action: undefined, id: undefined, periodDays: routeSearch.periodDays ?? 30 }} onClick={() => setDrawerOpen(false)}><Network size={18} /><span>Pessoas e estrutura</span></Link>
    </div>}
    <div className="workspace-nav-group">
      <span className="workspace-nav-label">Módulos contratados</span>
      {branch.modules.map((module) => {
        if (module.code === 'apr') return <div className="workspace-nav-module" key={module.code}>
          <Link className={`workspace-nav-item ${moduleCode === 'apr' && routeSearch.area !== 'pt' && routeSearch.tab !== 'work-permits' && routeSearch.tab !== 'pt-reports' ? 'active' : ''}`} to="/workspace/$companyId/$branchId/$moduleCode" params={{ companyId: session.companyId, branchId: branch.id, moduleCode: 'apr' }} search={{ area: 'apr', tab: 'overview', page: 1, q: '', action: undefined, id: undefined, periodDays: routeSearch.periodDays ?? 30 }} onClick={() => setDrawerOpen(false)}><ScrollText size={18} /><span>APRs</span></Link>
          <Link className={`workspace-nav-item ${moduleCode === 'apr' && (routeSearch.area === 'pt' || routeSearch.tab === 'work-permits' || routeSearch.tab === 'pt-reports') ? 'active' : ''}`} to="/workspace/$companyId/$branchId/$moduleCode" params={{ companyId: session.companyId, branchId: branch.id, moduleCode: 'apr' }} search={{ area: 'pt', tab: 'overview', page: 1, q: '', action: undefined, id: undefined, periodDays: routeSearch.periodDays ?? 30 }} onClick={() => setDrawerOpen(false)}><ClipboardCheck size={18} /><span>Permissões de trabalho</span></Link>
        </div>;
        const Icon = moduleIcons[module.code as keyof typeof moduleIcons] ?? ClipboardCheck;
        const active = module.code === moduleCode;
        return <div className="workspace-nav-module" key={module.code}><Link className={`workspace-nav-item ${active ? 'active' : ''}`} to="/workspace/$companyId/$branchId/$moduleCode" params={{ companyId: session.companyId, branchId: branch.id, moduleCode: module.code }} search={{ tab: undefined, page: 1, q: '', action: undefined, id: undefined, periodDays: routeSearch.periodDays ?? 30 }} onClick={() => setDrawerOpen(false)}><Icon size={18} /><span>{module.name}</span></Link></div>;
      })}
    </div>
  </>;
  return <div className={`company-workspace-shell${moduleCode === 'apr' && (routeSearch.area === 'pt' || routeSearch.tab === 'work-permits' || routeSearch.tab === 'pt-reports') ? ' company-workspace-shell--pt' : ''}`}>
    <Button className="workspace-menu-button" variant="secondary" onClick={() => setDrawerOpen(true)}><Menu size={18} /> Navegação</Button>
    <aside className={`workspace-sidebar ${drawerOpen ? 'open' : ''}`}><div className="workspace-drawer-header"><strong>Navegação</strong><Button variant="ghost" size="icon" aria-label="Fechar navegação" onClick={() => setDrawerOpen(false)}><X size={19} /></Button></div>{nav}</aside>
    {drawerOpen && <button className="workspace-scrim" aria-label="Fechar navegação" onClick={() => setDrawerOpen(false)} />}
    <main className="workspace-main">
      {!home && <><nav className="workspace-breadcrumb" aria-label="Caminho"><Link to="/app" search={{ branchId: undefined, periodDays: undefined }}>{session.context.company.name}</Link><ChevronRight size={14} /><span>{branch.name}</span></nav>
        <header className="workspace-context-heading"><div><h1>{title}</h1><p>{description}</p></div></header></>}
      {children}
    </main>
  </div>;
}
