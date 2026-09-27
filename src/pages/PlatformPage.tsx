import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Activity, Building2, Network, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { sileo } from 'sileo';
import { z } from 'zod';
import { Pagination } from '../components/Pagination.js';
import { Badge, Button, FormField, Input, PageTitle, SectionTitle } from '../components/ui/index.js';
import { apiJson, apiPage } from '../lib/api.js';
import { CommercialCatalogManager } from '../features/platform/CommercialCatalog.js';

interface Company { id: string; name: string; legalName?: string | null; taxIdentifier?: string | null; timezone?: string | null }
interface PlatformAnalytics { generatedAt: string; data: { companies: { active: number; archived: number }; branches: { active: number; archived: number }; entitlements: { active: number; items: Array<{ code: string; name: string; active: number; suspended: number; cancelled: number }> }; operationalActivation: { companies: number; items: Array<{ domain: string; companies: number }> }; operationalActivationAvailable: boolean } }
interface PlatformSeries { data: { items: Array<{ date: string; companiesCreated: number; branchesCreated: number; entitlementsStarted: number; operationalActivations: number }>; operationalActivationAvailable: boolean } }
interface ProjectionStatus { pendingEvents: number; latestRun: null | { status: string; snapshotsWritten: number; finishedAt: string | null; error: string | null } }
const companySchema = z.object({ name: z.string().trim().min(2, 'Informe o nome da empresa.'), timezone: z.string().trim().optional() });
type CompanyInput = z.infer<typeof companySchema>;

export function PlatformPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const companies = useQuery({ queryKey: ['platform-companies', page, search], queryFn: () => apiPage<Company>('v1/platform/companies', { searchParams: { page, pageSize: 25, ...(search ? { search } : {}) } }) });
  const analytics = useQuery({ queryKey: ['platform-analytics'], queryFn: () => apiJson<PlatformAnalytics>('v1/platform/analytics/summary'), staleTime: 60_000 });
  const adoption = useQuery({ queryKey: ['platform-analytics-series'], queryFn: () => apiJson<PlatformSeries>('v1/platform/analytics/adoption-series', { searchParams: { days: 90 } }), staleTime: 60_000 });
  const projections = useQuery({ queryKey: ['platform-analytics-projections'], queryFn: () => apiJson<ProjectionStatus>('v1/platform/analytics/projections'), staleTime: 60_000 });
  const adoptionAccessibleLabel = adoption.data?.data.items.length
    ? `Movimento administrativo nos últimos 90 dias: ${adoption.data.data.items.map((item) => `${item.date}, ${item.companiesCreated} empresas, ${item.branchesCreated} filiais, ${item.entitlementsStarted} direitos iniciados e ${item.operationalActivations} ativações operacionais`).join('; ')}.`
    : 'Movimento administrativo nos últimos 90 dias sem pontos disponíveis.';
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyInput>({ resolver: zodResolver(companySchema), defaultValues: { timezone: 'America/Sao_Paulo' } });
  const createCompany = useMutation({
    mutationFn: (input: CompanyInput) => apiJson<{ id: string }>('v1/platform/companies', { method: 'post', json: input }),
    onSuccess: async () => { reset({ timezone: 'America/Sao_Paulo' }); await queryClient.invalidateQueries({ queryKey: ['platform-companies'] }); sileo.success({ title: 'Empresa criada' }); },
    onError: () => sileo.error({ title: 'Não foi possível criar a empresa', description: 'Revise os dados e tente novamente.' }),
  });

  return (
    <div className="workspace">
      <PageTitle title="Plataforma Master" description="Empresas, filiais e módulos contratados em um contexto administrativo separado." meta={<Badge tone="neutral">Visão administrativa</Badge>} />
      {analytics.isPending ? <section className="platform-analytics-state" role="status">Carregando pulso da plataforma…</section> : analytics.isError ? <section className="platform-analytics-state error-state"><p>Não foi possível carregar o pulso da plataforma.</p><Button variant="secondary" size="sm" onClick={() => void analytics.refetch()}>Tentar novamente</Button></section> : analytics.data && <section className="platform-analytics" aria-labelledby="platform-analytics-title"><header><div><h2 id="platform-analytics-title">Pulso da plataforma</h2><p>Contratação e estrutura administrativa, sem expor a operação de SST dos clientes.</p></div><small>Atualizado em {new Date(analytics.data.generatedAt).toLocaleString('pt-BR')}</small></header><div className="platform-analytics__metrics"><article><Building2 size={18} /><span><strong>{analytics.data.data.companies.active}</strong><small>empresas ativas</small></span></article><article><Network size={18} /><span><strong>{analytics.data.data.branches.active}</strong><small>filiais ativas</small></span></article><article><Activity size={18} /><span><strong>{analytics.data.data.entitlements.active}</strong><small>direitos ativos</small></span></article><article><span><strong>{analytics.data.data.operationalActivation.companies}</strong><small>empresas ativadas</small></span></article></div><div className="platform-analytics__body"><section><h3>Contratação por módulo</h3>{analytics.data.data.entitlements.items.map((item) => <div className="platform-module-row" key={item.code}><span><strong>{item.name}</strong><small>{item.suspended} suspensos</small></span><b>{item.active}</b></div>)}</section><section><h3>Movimento administrativo · 90 dias</h3>{adoption.isPending ? <p className="platform-analytics__pending" role="status">Carregando movimento administrativo…</p> : adoption.isError ? <div className="platform-analytics__series-error"><p>Movimento administrativo indisponível.</p><button type="button" onClick={() => void adoption.refetch()}>Tentar novamente</button></div> : adoption.data.data.items.some((item) => item.companiesCreated || item.branchesCreated || item.entitlementsStarted || item.operationalActivations) ? <div className="platform-series" role="img" aria-label={adoptionAccessibleLabel}>{adoption.data.data.items.map((item) => <i key={item.date} aria-hidden="true" style={{ height: `${Math.max(3, (item.companiesCreated + item.branchesCreated + item.entitlementsStarted + item.operationalActivations) * 12)}px` }} />)}</div> : <p className="empty-state">Nenhuma criação, contratação ou ativação registrada no período.</p>}<p className="platform-analytics__note">Ativação operacional considera o primeiro fato canônico projetado de cada módulo, não apenas a contratação.</p></section></div><div className="platform-analytics__projection">{projections.isPending ? 'Verificando projeções…' : projections.isError ? 'Situação das projeções indisponível.' : projections.data.latestRun ? `Projeção ${projections.data.latestRun.status === 'succeeded' ? 'atualizada' : 'com falha'} · ${projections.data.latestRun.snapshotsWritten} snapshots · ${projections.data.pendingEvents} eventos pendentes` : 'A projeção ainda não foi executada.'}</div></section>}
      <div className="split-layout">
        <section className="content-section">
          <SectionTitle title="Empresas" description="Selecione uma empresa para administrar suas filiais." action={<label className="search-field"><Search size={17} /><span className="sr-only">Buscar empresas</span><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar empresa" /></label>} />
          {companies.isLoading && <p className="empty-state">Carregando empresas…</p>}
          {companies.isError && <p className="error-state">Não foi possível carregar as empresas. Tente novamente.</p>}
          {companies.data?.rows.length === 0 && <p className="empty-state">Nenhuma empresa encontrada.</p>}
          <div className="record-list">
            {companies.data?.rows.map((company) => <Link key={company.id} className="record-row" to="/platform/companies/$companyId" params={{ companyId: company.id }}><span className="record-icon"><Building2 size={18} /></span><span><strong>{company.name}</strong><small>{company.taxIdentifier || company.timezone || 'Sem detalhes complementares'}</small></span><span>Administrar</span></Link>)}
          </div>
          {companies.data && <Pagination page={companies.data.page} total={companies.data.total} totalPages={companies.data.totalPages} onPageChange={setPage} />}
        </section>
        <aside className="side-section"><div><Plus size={20} /><h2>Nova empresa</h2><p>Crie o cadastro base. Filiais e módulos são definidos em seguida.</p></div><form className="form-stack" onSubmit={handleSubmit((value) => createCompany.mutate(value))}><FormField label="Nome" error={errors.name?.message}><Input {...register('name')} invalid={Boolean(errors.name)} /></FormField><FormField label="Fuso horário"><Input {...register('timezone')} /></FormField><Button type="submit" loading={createCompany.isPending}>Criar empresa</Button></form></aside>
      </div>
      <CommercialCatalogManager />
    </div>
  );
}
