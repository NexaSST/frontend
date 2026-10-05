import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { CheckCircle2, Clock3, MapPin, ShieldCheck, XCircle } from 'lucide-react';
import './public-profile.css';
import { Button } from '../components/ui/index.js';
import { PublicTrainingSection } from './PublicTrainingSection.js';

interface PublicAsset {
  kind: 'asset'; code: string; assetType: string; company: string; branch: string;
  sector: string | null; location: string | null; expiresOn: string | null; nextInspectionDueOn: string | null;
  latestInspection: { completedAt: string; status: 'conformant' | 'nonconformant'; nonconformityCount: number } | null;
}
export interface PublicPerson {
  kind: 'person'; fullName: string; employeeCode: string | null; company: string;
  assignments: Array<{ branchId: string; branch: string; jobFunction: string | null; department: string | null; sector: string | null; status: string; startsOn: string }>;
  matrices: Array<{ branchId: string; name: string; version: number; effectiveFrom: string }>;
  trainings: Array<{ branchId: string; courseCode: string; courseName: string; status: string; expiresOn: string | null }>;
}

export function date(value: string | null) {
  if (!value) return 'Não informada';
  const day = value.slice(0, 10);
  return new Date(`${day}T12:00:00`).toLocaleDateString('pt-BR');
}

export function trainingStatus(status: string) {
  switch (status) {
    case 'up_to_date': return { label: 'Em dia', tone: 'success' };
    case 'due_30': return { label: 'Vence em até 30 dias', tone: 'warning' };
    case 'attention_90': return { label: 'Vence em até 90 dias', tone: 'warning' };
    case 'expired': return { label: 'Vencido', tone: 'danger' };
    case 'not_completed': return { label: 'Pendente', tone: 'danger' };
    case 'waived': return { label: 'Dispensado', tone: 'neutral' };
    default: return { label: 'Situação indisponível', tone: 'neutral' };
  }
}

async function loadProfile<T>(kind: 'assets' | 'people', token: string): Promise<T> {
  const response = await fetch(`/v1/public/${kind}/${encodeURIComponent(token)}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(response.status === 404 ? 'not_found' : 'unavailable');
  return response.json() as Promise<T>;
}

function ProfileFrame({ children, category }: { children: React.ReactNode; category?: string }) {
  return <div className={"public-profile"}>
    <header className={"public-profile__topbar"}><a href="/" className={"public-profile__brand"}><img src="/brand/nexasst-symbol-flat.png" alt="" width="34" height="34" />NexaSST</a><span>Consulta pública{category ? ` · ${category}` : ' por QR'}</span></header>
    {children}
    <footer className={"public-profile__footer"}><span>NexaSST · Consulta pública</span><span>Informações exibidas conforme os registros disponíveis no sistema.</span></footer>
  </div>;
}

function QueryState({ error, retry }: { error: Error | null; retry: () => void }) {
  return <ProfileFrame><main className={"public-profile__state"}><ShieldCheck size={32} aria-hidden="true" /><h1>{error?.message === 'not_found' ? 'Consulta não encontrada' : error ? 'Não foi possível carregar a consulta' : 'Carregando consulta…'}</h1><p>{error?.message === 'not_found' ? 'O QR pode estar inválido, o registro pode ter sido arquivado ou o acesso público pode estar indisponível.' : error ? 'Confira sua conexão e tente novamente.' : 'Buscando os dados públicos deste QR.'}</p>{error && error.message !== 'not_found' && <button type="button" onClick={retry}>Tentar novamente</button>}</main></ProfileFrame>;
}

function Hero({ title, subtitle, context, company }: { title: string; subtitle: string; context?: string; company: string }) {
  return <section className={"public-profile__hero"}><div className={"public-profile__hero-inner"}><h1>{title}</h1><p className={"public-profile__subtitle"}>{subtitle}</p>{context && <p className={"public-profile__context"}>{context}</p>}<div className={"public-profile__company"}><MapPin size={17} aria-hidden="true" /><span>{company}</span></div></div></section>;
}

function AssetProfile({ asset }: { asset: PublicAsset }) {
  const inspection = asset.latestInspection;
  return <ProfileFrame category="Ativo"><main>
    <Hero title={asset.code} subtitle={asset.assetType} context={[asset.location, asset.sector].filter(Boolean).join(' · ')} company={`${asset.company} — ${asset.branch}`}  />
    <div className={"public-profile__body"}><section className={"public-profile__lead public-profile__lead--asset"} aria-label="Situação do ativo">
      <div className={"public-profile__lead-main"}><span className={`public-profile__signal ${(inspection?.status === 'nonconformant' ? "public-profile__signal--danger" : (inspection ? "public-profile__signal--success" : "public-profile__signal--neutral"))}`}>{inspection?.status === 'conformant' ? <CheckCircle2 size={20} /> : inspection?.status === 'nonconformant' ? <XCircle size={20} /> : <Clock3 size={20} />}{inspection?.status === 'conformant' ? 'Última inspeção conforme' : inspection?.status === 'nonconformant' ? 'Última inspeção com não conformidade' : 'Sem inspeção concluída'}</span><p>{inspection ? `Concluída em ${date(inspection.completedAt)}${inspection.nonconformityCount ? ` · ${inspection.nonconformityCount} não conformidade${inspection.nonconformityCount === 1 ? '' : 's'}` : ''}` : 'Ainda não há uma inspeção concluída para este ativo.'}</p></div>
      <div className={"public-profile__asset-dates"}><div><span>Próxima inspeção prevista</span><strong>{date(asset.nextInspectionDueOn)}</strong></div>{asset.expiresOn && <div><span>Validade do ativo</span><strong>{date(asset.expiresOn)}</strong></div>}</div>
    </section>
    <div className={"public-profile__report"}><Button variant="secondary" disabled>Reportar problema</Button></div></div>
  </main></ProfileFrame>;
}

function PersonProfile({ person }: { person: PublicPerson }) {
  const jobs = [...new Set(person.assignments.map((item) => item.jobFunction).filter(Boolean))].join(' · ');
  const departments = [...new Set(person.assignments.map((item) => [item.department, item.sector].filter(Boolean).join(' / ')).filter(Boolean))].join(' · ');
  const branches = [...new Set(person.assignments.map((item) => item.branch))].join(' / ');
  return <ProfileFrame category="Colaborador"><main>
    <Hero title={person.fullName} subtitle={jobs || 'Cargo não informado'} context={departments} company={`${person.company} — ${branches}`} />
    <div className={"public-profile__body public-profile__body--person"}>
      {person.employeeCode && <p className={"public-profile__employee-code"}>Matrícula {person.employeeCode}</p>}
      {person.assignments.map((assignment) => <PublicTrainingSection key={assignment.branchId} assignment={assignment} trainings={person.trainings.filter((training) => training.branchId === assignment.branchId)} matrix={person.matrices.find((matrix) => matrix.branchId === assignment.branchId)} multipleBranches={person.assignments.length > 1} />)}
    </div>
  </main></ProfileFrame>;
}

export function PublicAssetPage() {
  const { token } = useParams({ from: '/public/assets/$token' });
  const query = useQuery({ queryKey: ['public-asset', token], queryFn: () => loadProfile<PublicAsset>('assets', token), retry: false });
  if (!query.data) return <QueryState error={query.error} retry={() => { void query.refetch(); }} />;
  return <AssetProfile asset={query.data} />;
}

export function PublicPersonPage() {
  const { token } = useParams({ from: '/public/people/$token' });
  const query = useQuery({ queryKey: ['public-person', token], queryFn: () => loadProfile<PublicPerson>('people', token), retry: false });
  if (!query.data) return <QueryState error={query.error} retry={() => { void query.refetch(); }} />;
  return <PersonProfile person={query.data} />;
}
